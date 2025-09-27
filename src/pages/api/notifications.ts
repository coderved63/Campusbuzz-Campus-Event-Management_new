import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { getUserFromToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const user = getUserFromToken(req);
      
      if (!user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const notifications = await Notification.find({ userId: user.id })
        .sort({ createdAt: -1 })
        .limit(20);

      const unreadCount = await Notification.countDocuments({ 
        userId: user.id, 
        isRead: false 
      });

      res.status(200).json({ 
        success: true, 
        notifications,
        unreadCount 
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
  } else if (req.method === 'POST') {
    try {
      const user = getUserFromToken(req);
      
      if (!user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const { notificationId } = req.body;

      if (notificationId) {
        // Mark specific notification as read
        await Notification.findByIdAndUpdate(notificationId, { isRead: true });
      } else {
        // Mark all notifications as read
        await Notification.updateMany(
          { userId: user.id },
          { isRead: true }
        );
      }

      res.status(200).json({ success: true, message: 'Notifications marked as read' });
    } catch (error) {
      console.error('Error updating notifications:', error);
      res.status(500).json({ success: false, error: 'Failed to update notifications' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }
}