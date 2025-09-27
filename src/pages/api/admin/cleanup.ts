import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import Ticket from '@/models/Ticket';
import User from '@/models/User';
import path from 'path';
import fs from 'fs/promises';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // TODO: Add admin authentication check here
    await dbConnect();

    const { action, daysOld = 30 } = req.body;

    if (!action) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cleanup action is required' 
      });
    }

    const results = {
      action,
      itemsProcessed: 0,
      itemsDeleted: 0,
      errors: []
    };

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    switch (action) {
      case 'cleanup-old-events':
        // Clean up old completed events
        const oldEvents = await Event.find({
          date: { $lt: cutoffDate },
          status: 'completed'
        });

        results.itemsProcessed = oldEvents.length;

        for (const event of oldEvents) {
          try {
            // Delete associated tickets
            await Ticket.deleteMany({ eventid: event._id.toString() });
            
            // Delete event image if exists
            if (event.image) {
              try {
                const imagePath = path.join(process.cwd(), 'uploads', path.basename(event.image));
                await fs.unlink(imagePath);
              } catch (imageError) {
                results.errors.push(`Failed to delete image for event ${event._id}: ${imageError.message}`);
              }
            }

            // Delete the event
            await Event.findByIdAndDelete(event._id);
            results.itemsDeleted++;
          } catch (error) {
            results.errors.push(`Failed to delete event ${event._id}: ${error.message}`);
          }
        }
        break;

      case 'cleanup-unverified-tickets':
        // Clean up old unverified tickets
        const oldUnverifiedTickets = await Ticket.find({
          createdAt: { $lt: cutoffDate },
          verified: false
        });

        results.itemsProcessed = oldUnverifiedTickets.length;

        const deleteResult = await Ticket.deleteMany({
          createdAt: { $lt: cutoffDate },
          verified: false
        });

        results.itemsDeleted = deleteResult.deletedCount;
        break;

      case 'cleanup-temp-users':
        // Clean up temporary users (created for ticket bookings)
        const tempUsers = await User.find({
          password: { $regex: /^temp_password_/ },
          createdAt: { $lt: cutoffDate }
        });

        results.itemsProcessed = tempUsers.length;

        for (const user of tempUsers) {
          try {
            // Check if user has any tickets
            const userTickets = await Ticket.countDocuments({ userid: user._id.toString() });
            
            if (userTickets === 0) {
              await User.findByIdAndDelete(user._id);
              results.itemsDeleted++;
            }
          } catch (error) {
            results.errors.push(`Failed to process temp user ${user._id}: ${error.message}`);
          }
        }
        break;

      case 'update-event-status':
        // Update event statuses based on dates
        const now = new Date();
        
        // Mark past events as completed
        const pastEvents = await Event.updateMany(
          { 
            date: { $lt: now },
            status: { $in: ['draft', 'published'] }
          },
          { status: 'completed' }
        );

        results.itemsProcessed = pastEvents.matchedCount;
        results.itemsDeleted = pastEvents.modifiedCount;
        break;

      case 'cleanup-orphaned-files':
        // Clean up orphaned image files
        try {
          const uploadsDir = path.join(process.cwd(), 'uploads');
          const files = await fs.readdir(uploadsDir);
          
          results.itemsProcessed = files.length;

          for (const file of files) {
            if (file === 'qrcodes') continue; // Skip QR codes directory
            
            const filePath = path.join(uploadsDir, file);
            const stat = await fs.stat(filePath);
            
            if (stat.isFile()) {
              // Check if file is referenced by any event
              const fileInUse = await Event.findOne({ 
                image: { $regex: file } 
              });

              if (!fileInUse && stat.mtime < cutoffDate) {
                try {
                  await fs.unlink(filePath);
                  results.itemsDeleted++;
                } catch (error) {
                  results.errors.push(`Failed to delete file ${file}: ${error.message}`);
                }
              }
            }
          }
        } catch (error) {
          results.errors.push(`Failed to process uploads directory: ${error.message}`);
        }
        break;

      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid cleanup action' 
        });
    }

    console.log(`Cleanup completed: ${action}`, results);

    res.status(200).json({ 
      success: true, 
      data: results,
      message: `Cleanup completed: ${results.itemsDeleted} items processed`
    });

  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Cleanup operation failed' 
    });
  }
}