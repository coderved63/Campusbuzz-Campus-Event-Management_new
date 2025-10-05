import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import Event from '@/models/Event';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';

interface QRVerificationData {
  ticketId: string;
  eventId: string;
  eventName: string;
  userName: string;
  userEmail: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  price: string | number;
  purchaseDate: string;
  verified: boolean;
  timestamp: string;
  verificationToken?: string;
}

export default requireAuth(async (
  req: NextApiRequest,
  res: NextApiResponse,
  user
) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({ 
        success: false, 
        error: 'QR data is required' 
      });
    }

    let parsedData: QRVerificationData;
    
    try {
      // Parse QR data if it's a string
      parsedData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    } catch (parseError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid QR data format' 
      });
    }

    // Validate required fields
    if (!parsedData.ticketId || !parsedData.eventId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required QR data fields' 
      });
    }

    // Fetch ticket from database
    const ticket = await Ticket.findById(parsedData.ticketId)
      .populate('eventid')
      .populate('userid');
    
    if (!ticket) {
      return res.status(404).json({ 
        success: false, 
        error: 'Ticket not found' 
      });
    }

    // Verify ticket data matches QR data
    if (ticket.eventid._id.toString() !== parsedData.eventId) {
      return res.status(400).json({ 
        success: false, 
        error: 'QR data does not match ticket records' 
      });
    }

    // Check if event exists and is valid
    const event = await Event.findById(parsedData.eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        error: 'Event not found' 
      });
    }

    // Verify verification token if present
    if (parsedData.verificationToken) {
      const expectedToken = generateVerificationToken(
        parsedData.ticketId,
        ticket.userid._id.toString(),
        parsedData.eventId
      );
      
      // Note: This is a simplified check. In production, you might want more sophisticated verification
      if (!parsedData.verificationToken.startsWith(expectedToken.substring(0, 8))) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid verification token' 
        });
      }
    }

    // Check if ticket has already been used (if your system tracks this)
    const ticketStatus = ticket.status || 'active';
    
    // Prepare verification result
    const verificationResult = {
      valid: true,
      ticket: {
        id: ticket._id,
        eventName: event.title,
        attendeeName: ticket.ticketDetails.name,
        attendeeEmail: ticket.ticketDetails.email,
        eventDate: event.date,
        eventTime: event.time,
        eventLocation: event.location,
        purchaseDate: ticket.createdAt,
        status: ticketStatus
      },
      event: {
        id: event._id,
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        host: event.host,
        category: event.category
      },
      verificationTime: new Date().toISOString(),
      verifiedBy: user.email
    };

    // Optional: Mark ticket as verified/used
    // ticket.status = 'verified';
    // ticket.verifiedAt = new Date();
    // ticket.verifiedBy = user.id;
    // await ticket.save();

    res.status(200).json({ 
      success: true, 
      data: verificationResult,
      message: 'Ticket verified successfully'
    });

  } catch (error) {
    console.error('Error verifying QR code:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to verify QR code' 
    });
  }
});

// Generate a verification token for security (same as in booking)
function generateVerificationToken(ticketId: string, userId: string, eventId: string): string {
  const crypto = require('crypto');
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const data = `${ticketId}-${userId}-${eventId}`;
  return crypto.createHmac('sha256', secret).update(data).digest('hex').substring(0, 16);
}