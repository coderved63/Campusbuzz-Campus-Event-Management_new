import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import { getUserFromToken } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const userData = getUserFromToken(req);
      if (!userData) {
        return res.status(401).json({ 
          success: false, 
          error: 'Not authenticated' 
        });
      }

      // For testing purposes - approve all pending events
      const result = await Event.updateMany(
        { isApproved: false },
        { isApproved: true }
      );

      res.status(200).json({
        success: true,
        message: `Approved ${result.modifiedCount} events`,
        approvedCount: result.modifiedCount
      });
    } catch (error) {
      console.error('Error auto-approving events:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to approve events' 
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ 
      success: false, 
      error: `Method ${req.method} not allowed` 
    });
  }
}