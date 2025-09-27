import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import Ticket from '@/models/Ticket';
import { getUserFromToken } from '@/lib/auth';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { getQRCodesPath } from '@/lib/upload';
import { BookTicketRequest, ApiResponse, ITicket } from '@/types';

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
        name: name || userData.name,
        email: email || userData.email,
        eventname: event.title,
        eventdate: event.date,
        eventtime: event.time,
        ticketprice: event.price
      }
    });

    // Generate QR code data with better formatting
    const qrData = JSON.stringify({
      ticketId: ticket._id,
      eventId: event._id,
      eventName: event.title,
      userName: name || userData.name,
      userEmail: email || userData.email,
      date: new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: event.time,
      location: event.location,
      price: event.price === 0 ? 'Free' : `₹${event.price}`,
      host: event.host,
      category: event.category
    }, null, 2);

    // Generate QR code image
    const qrCodeFileName = `ticket_${ticket._id}.png`;
    const qrCodePath = path.join(getQRCodesPath(), qrCodeFileName);
    
    // Create QR code with higher quality and better settings
    await QRCode.toFile(qrCodePath, qrData, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
      color: {
        dark: '#1f2937',  // Dark blue
        light: '#ffffff'  // White background
      }
    });

    // Update ticket with QR code path
    ticket.ticketDetails.qr = `/uploads/qrcodes/${qrCodeFileName}`;
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