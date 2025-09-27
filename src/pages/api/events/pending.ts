import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const events = await Event.find({ isApproved: false })
        .populate('owner', 'name email')
        .sort({ createdAt: -1 });
      
      res.status(200).json({ success: true, events });
    } catch (error) {
      console.error('Error fetching pending events:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch pending events' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }
}