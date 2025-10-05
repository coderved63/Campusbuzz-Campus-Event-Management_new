import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import Ticket from '@/models/Ticket';
import User from '@/models/User';

// Generate a verification token for security
function generateVerificationToken(ticketId: string, userId: string, eventId: string): string {
  const crypto = require('crypto');
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const data = `${ticketId}-${userId}-${eventId}-${Date.now()}`;
  return crypto.createHmac('sha256', secret).update(data).digest('hex').substring(0, 16);
}

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
    await dbConnect();

    const { 
      eventId, 
      quantity, 
      customerInfo, 
      paymentMethod,
      totalAmount 
    } = req.body;

    // Validate required fields
    if (!eventId || !quantity || !customerInfo || !paymentMethod) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Fetch event
    const event = await Event.findById(eventId);
    if (!event || !event.isApproved) {
      return res.status(404).json({ 
        success: false, 
        error: 'Event not found or not approved' 
      });
    }

    // Check/create user
    let user = await User.findOne({ email: customerInfo.email.toLowerCase() });
    if (!user) {
      // Create a basic user account for ticket booking
      user = new User({
        name: customerInfo.name,
        email: customerInfo.email.toLowerCase(),
        password: 'temp_password_' + Math.random().toString(36), // Temporary password
        isAdmin: false
      });
      await user.save();
    }

    // Generate transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create ticket
    const ticket = new Ticket({
      userid: user._id.toString(),
      eventid: eventId,
      user: user._id,
      event: event._id,
      ticketDetails: {
        name: customerInfo.name,
        email: customerInfo.email,
        eventname: event.title,
        eventdate: event.date,
        eventtime: event.time,
        ticketprice: totalAmount,
        qr: '' // Will be set below
      },
      count: quantity,
      quantity: quantity,
      ticketType: 'General',
      verified: false
    });

    // Generate comprehensive QR data
    const qrData = {
      ticketId: ticket._id.toString(),
      eventId: eventId,
      userId: user._id.toString(),
      eventName: event.title,
      attendeeName: customerInfo.name,
      eventDate: event.date,
      eventTime: event.time,
      eventLocation: event.location,
      quantity: quantity,
      price: totalAmount,
      purchaseDate: ticket.createdAt,
      verified: true,
      timestamp: new Date().toISOString(),
      // Add verification token for security
      verificationToken: generateVerificationToken(ticket._id.toString(), user._id.toString(), eventId)
    };

    // Store QR data instead of generating file (dynamic approach)
    ticket.ticketDetails.qrData = JSON.stringify(qrData);
    ticket.ticketDetails.qr = `/api/qrcode/${ticket._id}`; // Dynamic QR URL
    await ticket.save();

    // Update event attendees count
    if (event.attendeesCount !== undefined) {
      event.attendeesCount += quantity;
      await event.save();
    }

    // Prepare response data
    const bookingConfirmation = {
      transactionId,
      ticketId: ticket._id.toString(),
      event: {
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location
      },
      customer: {
        name: customerInfo.name,
        email: customerInfo.email
      },
      booking: {
        quantity,
        totalAmount,
        paymentMethod,
        bookingDate: new Date()
      },
      qrCode: `/api/qrcode/${ticket._id}`
    };

    console.log(`Ticket booked successfully: ${ticket._id} for event: ${event.title}`);

    res.status(201).json({ 
      success: true, 
      data: bookingConfirmation,
      message: 'Ticket booked successfully!' 
    });

  } catch (error) {
    console.error('Error processing ticket booking:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process ticket booking' 
    });
  }
}