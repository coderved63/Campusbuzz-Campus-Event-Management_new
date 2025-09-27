import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import { getUserFromToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const ticket = await Ticket.findById(id)
        .populate({
          path: 'eventId',
          select: 'title date time location price'
        })
        .populate('userId', 'name email');

      if (!ticket) {
        return res.status(404).json({ success: false, error: 'Ticket not found' });
      }

      res.status(200).json({ success: true, ticket });
    } catch (error) {
      console.error('Error fetching ticket:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch ticket' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const user = getUserFromToken(req);
      
      if (!user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const ticket = await Ticket.findById(id);
      
      if (!ticket) {
        return res.status(404).json({ success: false, error: 'Ticket not found' });
      }

      // Check if user owns the ticket or is admin
      if (ticket.userId.toString() !== user.id && !user.isAdmin) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      await Ticket.findByIdAndDelete(id);
      res.status(200).json({ success: true, message: 'Ticket deleted successfully' });
    } catch (error) {
      console.error('Error deleting ticket:', error);
      res.status(500).json({ success: false, error: 'Failed to delete ticket' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'DELETE']);
    res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }
}