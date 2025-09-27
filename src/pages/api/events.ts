import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { getUserFromToken } from '@/lib/auth';
import { upload } from '@/lib/upload';
import { ApiResponse, IEvent } from '@/types';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<IEvent | IEvent[]>>
) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    case 'DELETE':
      return handleDelete(req, res);
    default:
      return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<IEvent[]>>
) {
  try {
    const userData = getUserFromToken(req);
    let query: any = { isApproved: true }; // Default query for regular users
    let isAdmin = false;

    if (userData) {
      const user = await User.findById(userData.id);
      if (user && user.isAdmin) {
        // Admins can see all events
        query = {};
        isAdmin = true;
      }
    }

    const events = await Event.find(query)
      .populate('owner', 'name email')
      .sort({ date: 1 });
    
    // Add debug info for development
    const totalEvents = await Event.countDocuments({});
    const approvedEvents = await Event.countDocuments({ isApproved: true });
    
    console.log(`Events API called: Total=${totalEvents}, Approved=${approvedEvents}, Returned=${events.length}, IsAdmin=${isAdmin}`);
    
    res.status(200).json({ success: true, events: events } as any);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch events' 
    });
  }
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<IEvent>>
) {
  try {
    const userData = getUserFromToken(req);
    if (!userData) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authenticated' 
      });
    }

    // Handle file upload
    await new Promise<void>((resolve, reject) => {
      upload.single('image')(req as any, res as any, (err: any) => {
        if (err) {
          console.error('Upload error:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    const { title, description, date, time, location, category, price, host } = req.body;
    console.log('Received form data:', { title, description, date, time, location, category, price, host });
    
    if (!title || !description || !date || !time || !location || !category || !price || !host) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required' 
      });
    }

    // Check if user is admin
    const user = await User.findById(userData.id);
    const isAdmin = user && user.isAdmin;

    const eventData: any = {
      owner: userData.id,
      title,
      description,
      date: new Date(date),
      time,
      location,
      category,
      price: Number(price),
      host,
      isApproved: isAdmin ? true : false
    };

    // Only add image if file was uploaded
    if ((req as any).file) {
      eventData.image = `/uploads/${(req as any).file.filename}`;
    }

    const newEvent = new Event(eventData);
    await newEvent.save();

    if (!isAdmin) {
      // Create notification for the event creator
      await Notification.create({
        userId: userData.id,
        title: 'Event Pending Approval',
        message: `Your event "${title}" has been sent for admin approval.`,
        type: 'event',
        eventId: newEvent._id,
        createdAt: new Date()
      });

      // Create notifications for admins
      try {
        const admins = await User.find({ isAdmin: true }).select('_id');
        if (admins && admins.length > 0) {
          const notifications = admins.map(admin => ({
            userId: admin._id,
            title: 'New Event Pending Approval',
            message: `A new event "${title}" needs your approval.`,
            type: 'event',
            eventId: newEvent._id,
            createdAt: new Date()
          }));
          await Notification.create(notifications);
        }
      } catch (notifError) {
        console.error('Error creating admin notifications:', notifError);
      }
    }

    res.status(201).json({ 
      success: true, 
      data: newEvent,
      message: "Event created successfully and sent for admin approval"
    });
  } catch (error: any) {
    console.error('Error creating event:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to create event' 
    });
  }
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<null>>
) {
  try {
    const { id } = req.query;
    const userData = getUserFromToken(req);

    if (!userData) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authenticated' 
      });
    }

    // Find the event
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        error: 'Event not found' 
      });
    }

    // Check if user is owner or admin
    const user = await User.findById(userData.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Allow admins to delete any event, otherwise check if user is the owner
    if (!user.isAdmin && event.owner.toString() !== user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized to delete this event' 
      });
    }

    // Delete the event
    await Event.findByIdAndDelete(id);
    
    // Also delete associated tickets
    const Ticket = require('@/models/Ticket').default;
    await Ticket.deleteMany({ eventid: id });

    res.status(200).json({ 
      success: true, 
      data: null,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete event' 
    });
  }
}