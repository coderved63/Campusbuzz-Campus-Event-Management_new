import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import { getUserFromToken } from '@/lib/auth';
import { ApiResponse, ITicket } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ITicket | ITicket[]>>
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
  res: NextApiResponse<ApiResponse<ITicket[]>>
) {
  try {
    const { userId } = req.query;

    if (userId) {
      // Get tickets for specific user
      const tickets = await Ticket.find({ userid: userId })
        .sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: tickets });
    }

    // Get all tickets (admin only)
    const userData = getUserFromToken(req);
    if (!userData) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authenticated' 
      });
    }

    const tickets = await Ticket.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch tickets' 
    });
  }
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ITicket>>
) {
  try {
    const { ticketDetails } = req.body;
    
    // Validate required fields
    if (!ticketDetails || !ticketDetails.userid || !ticketDetails.eventid || !ticketDetails.ticketDetails) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required ticket details' 
      });
    }

    // Create new ticket
    const newTicket = new Ticket({
      userid: ticketDetails.userid,
      eventid: ticketDetails.eventid,
      ticketDetails: {
        name: ticketDetails.ticketDetails.name,
        email: ticketDetails.ticketDetails.email,
        eventname: ticketDetails.ticketDetails.eventname,
        eventdate: new Date(ticketDetails.ticketDetails.eventdate),
        eventtime: ticketDetails.ticketDetails.eventtime,
        ticketprice: ticketDetails.ticketDetails.ticketprice,
        qr: ticketDetails.ticketDetails.qr
      }
    });

    // Save ticket to database
    await newTicket.save();
    
    res.status(201).json({ 
      success: true, 
      data: newTicket 
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create ticket' 
    });
  }
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<null>>
) {
  try {
    const { id } = req.query;
    
    await Ticket.findByIdAndDelete(id);
    
    res.status(200).json({ 
      success: true, 
      data: null,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete ticket' 
    });
  }
}