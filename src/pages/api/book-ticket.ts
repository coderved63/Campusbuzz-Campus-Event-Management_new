import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import Ticket from '@/models/Ticket';
import User from '@/models/User';
import { getUserFromToken } from '@/lib/auth';
import { BookTicketRequest, ApiResponse, ITicket } from '@/types';

// Generate a verification token for security
function generateVerificationToken(ticketId: string, userId: string, eventId: string): string {
  const crypto = require('crypto');
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const data = `${ticketId}-${userId}-${eventId}-${Date.now()}`;
  return crypto.createHmac('sha256', secret).update(data).digest('hex').substring(0, 16);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ITicket>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const userData = getUserFromToken(req);
    if (!userData) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authenticated' 
      });
    }

    // Get full user details from database
    const user = await User.findById(userData.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const { eventId, name, email }: BookTicketRequest = req.body;

    // Get event details
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        error: 'Event not found' 
      });
    }

    // Check if user already has a ticket for this event
    const existingTicket = await Ticket.findOne({
      userid: userData.id,
      eventid: eventId
    });

    if (existingTicket) {
      return res.status(400).json({ 
        success: false, 
        error: 'You already have a ticket for this event' 
      });
    }

    // Create ticket
    const ticket = await Ticket.create({
      userid: userData.id,
      eventid: eventId,
      ticketDetails: {
        name: name || user.name,
        email: email || user.email,
        eventname: event.title,
        eventdate: event.date,
        eventtime: event.time,
        ticketprice: event.price
      }
    });

    // Generate comprehensive QR data
    const qrData = {
      ticketId: ticket._id,
      eventId: event._id,
      eventName: event.title,
      userName: name || user.name,
      userEmail: email || user.email,
      eventDate: event.date,
      eventTime: event.time,
      eventLocation: event.location,
      price: event.price === 0 ? 'Free' : `₹${event.price}`,
      host: event.host,
      category: event.category,
      purchaseDate: ticket.createdAt,
      verified: true,
      timestamp: new Date().toISOString(),
      // Add verification token for security
      verificationToken: generateVerificationToken(ticket._id.toString(), userData.id, event._id.toString())
    };

    // Store QR data in ticket (no file generation)
    ticket.ticketDetails.qrData = JSON.stringify(qrData);
    ticket.ticketDetails.qr = `/api/qrcode/${ticket._id}`; // Dynamic QR URL
    await ticket.save();

    res.status(201).json({ 
      success: true, 
      data: ticket,
      message: 'Ticket booked successfully'
    });
  } catch (error) {
    console.error('Error booking ticket:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to book ticket' 
    });
  }
}