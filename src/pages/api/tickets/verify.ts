import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import Event from '@/models/Event';
import User from '@/models/User';

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

    const { ticketId } = req.body;

    if (!ticketId) {
      return res.status(400).json({ 
        valid: false,
        error: 'Ticket ID is required' 
      });
    }

    // Find the ticket and populate related data
    const ticket = await Ticket.findById(ticketId)
      .populate('event', 'title date location')
      .populate('user', 'name email');

    if (!ticket) {
      return res.status(404).json({ 
        valid: false,
        error: 'Ticket not found' 
      });
    }

    // Check if ticket is already verified
    const isAlreadyVerified = ticket.verified;

    // Mark ticket as verified if not already
    if (!isAlreadyVerified) {
      ticket.verified = true;
      ticket.verifiedAt = new Date();
      await ticket.save();
    }

    // Prepare ticket details for response
    const ticketDetails = {
      _id: ticket._id.toString(),
      eventTitle: ticket.event?.title || 'Unknown Event',
      userName: ticket.user?.name || 'Unknown User',
      userEmail: ticket.user?.email || 'Unknown Email',
      ticketType: ticket.ticketType || 'General',
      quantity: ticket.quantity || 1,
      purchaseDate: ticket.createdAt?.toISOString() || new Date().toISOString(),
      eventDate: ticket.event?.date?.toISOString() || new Date().toISOString(),
      eventLocation: ticket.event?.location || 'Unknown Location',
      verified: true,
      verificationDate: ticket.verifiedAt?.toISOString() || new Date().toISOString()
    };

    res.status(200).json({ 
      valid: true,
      ticket: ticketDetails,
      message: isAlreadyVerified 
        ? 'Ticket was previously verified' 
        : 'Ticket verified successfully'
    });

  } catch (error) {
    console.error('Error verifying ticket:', error);
    res.status(500).json({ 
      valid: false,
      error: 'Internal server error' 
    });
  }
}