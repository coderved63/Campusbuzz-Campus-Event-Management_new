import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import { getUserFromToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { id } = req.query;
      const user = getUserFromToken(req);

      if (!user || !user.isAdmin) {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }

      const event = await Event.findByIdAndUpdate(
        id,
        { isApproved: true },
        { new: true }
      );

      if (!event) {
        return res.status(404).json({ success: false, error: 'Event not found' });
      }

      res.status(200).json({ success: true, event });
    } catch (error) {
      console.error('Error approving event:', error);
      res.status(500).json({ success: false, error: 'Failed to approve event' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }
}