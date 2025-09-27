import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import User from '@/models/User';
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

      // Get user details
      const user = await User.findById(userData.id);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: 'User not found' 
        });
      }

      // Create sample events if none exist
      const eventCount = await Event.countDocuments({});
      let createdEvents = 0;

      if (eventCount === 0) {
        const sampleEvents = [
          {
            owner: user._id,
            title: "Tech Workshop: AI & Machine Learning",
            description: "Join us for an exciting workshop on Artificial Intelligence and Machine Learning. Learn the fundamentals and get hands-on experience with popular ML frameworks. Perfect for beginners and intermediate developers.",
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
            time: "10:00 AM",
            location: "Computer Science Lab, Building A",
            category: "Technology",
            price: 0,
            host: "Tech Club",
            isApproved: true
          },
          {
            owner: user._id,
            title: "Music Festival 2025",
            description: "Annual campus music festival featuring local bands, DJ sets, and live performances. Food stalls, games, and prizes await! Don't miss the biggest musical event of the year.",
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
            time: "4:00 PM",
            location: "Main Campus Ground",
            category: "Entertainment",
            price: 250,
            host: "Cultural Committee",
            isApproved: true
          },
          {
            owner: user._id,
            title: "Career Fair 2025",
            description: "Meet with top companies and explore career opportunities. Network with professionals, attend workshops on resume building and interview skills. Great chance to land your dream job!",
            date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
            time: "9:00 AM",
            location: "Auditorium Hall",
            category: "Career",
            price: 0,
            host: "Placement Cell",
            isApproved: true
          },
          {
            owner: user._id,
            title: "Photography Workshop",
            description: "Learn the art of photography from professional photographers. Topics include composition, lighting, editing, and portfolio building. Bring your camera or use our equipment.",
            date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
            time: "2:00 PM",
            location: "Art Studio, Building C",
            category: "Art",
            price: 150,
            host: "Photography Club",
            isApproved: true
          },
          {
            owner: user._id,
            title: "Sports Championship",
            description: "Inter-college sports championship featuring cricket, football, basketball, and more. Cheer for your favorite teams and witness thrilling matches. Refreshments available.",
            date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 4 weeks from now
            time: "8:00 AM",
            location: "Sports Complex",
            category: "Sports",
            price: 100,
            host: "Sports Committee",
            isApproved: true
          }
        ];

        for (const eventData of sampleEvents) {
          await Event.create(eventData);
          createdEvents++;
        }
      }

      // Also approve any existing pending events
      const approveResult = await Event.updateMany(
        { isApproved: false },
        { isApproved: true }
      );

      res.status(200).json({
        success: true,
        message: `Created ${createdEvents} sample events and approved ${approveResult.modifiedCount} pending events`,
        createdEvents,
        approvedEvents: approveResult.modifiedCount
      });
    } catch (error) {
      console.error('Error creating sample events:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to create sample events' 
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