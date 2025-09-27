import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import { ApiResponse, IEvent } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<IEvent>>
) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      
      const event = await Event.findById(id)
        .populate('owner', 'name email');
      
      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }
      
      res.status(200).json({
        success: true,
        event: event
      });
    } catch (error: any) {
      console.error('Error fetching event:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch event'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`
    });
  }
}