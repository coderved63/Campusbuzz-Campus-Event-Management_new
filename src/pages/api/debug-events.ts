import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Get all events with their approval status
    const allEvents = await Event.find({})
      .populate('owner', 'name email isAdmin')
      .sort({ createdAt: -1 });
    
    const approvedEvents = await Event.find({ isApproved: true })
      .populate('owner', 'name email isAdmin')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalEvents: allEvents.length,
      approvedEvents: approvedEvents.length,
      pendingEvents: allEvents.length - approvedEvents.length,
      allEvents: allEvents.map(event => ({
        _id: event._id,
        title: event.title,
        isApproved: event.isApproved,
        owner: event.owner,
        createdAt: event.createdAt
      })),
      approvedEventsList: approvedEvents.map(event => ({
        _id: event._id,
        title: event.title,
        date: event.date,
        owner: event.owner,
        createdAt: event.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching debug info:', error);
    res.status(500).json({ error: 'Failed to fetch debug info' });
  }
}