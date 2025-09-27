import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import { getUserFromToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const user = getUserFromToken(req);
      
      if (!user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const tickets = await Ticket.find({ userId: user.id })
        .populate('eventId', 'title date time location price')
        .sort({ purchaseDate: -1 });

      res.status(200).json({ success: true, tickets });
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch tickets' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }
}