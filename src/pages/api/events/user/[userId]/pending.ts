import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import { getUserFromToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { userId } = req.query;
      const userData = getUserFromToken(req);
      
      if (!userData) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      // Check if user is requesting their own events or is admin
      if (userData.id !== userId && !userData.isAdmin) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const events = await Event.find({ 
        owner: userId, 
        isApproved: false 
      })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
      
      res.status(200).json({ success: true, events });
    } catch (error) {
      console.error('Error fetching user pending events:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch pending events' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }
}