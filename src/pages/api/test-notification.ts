import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { getUserFromToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const user = getUserFromToken(req);
      
      if (!user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const { title, message, type } = req.body;

      const notification = await Notification.create({
        userId: user.id,
        title: title || 'Test Notification',
        message: message || 'This is a test notification',
        type: type || 'general',
        createdAt: new Date()
      });

      res.status(200).json({ success: true, notification });
    } catch (error) {
      console.error('Error creating test notification:', error);
      res.status(500).json({ success: false, error: 'Failed to create test notification' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }
}