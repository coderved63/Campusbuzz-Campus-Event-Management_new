import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import Ticket from '@/models/Ticket';
import User from '@/models/User';
import Category from '@/models/Category';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    await dbConnect();

    // Get comprehensive dashboard statistics
    const [
      totalEvents,
      approvedEvents,
      pendingEvents,
      totalTickets,
      totalUsers,
      totalCategories,
      recentEvents,
      recentTickets,
      topEvents
    ] = await Promise.all([
      Event.countDocuments(),
      Event.countDocuments({ isApproved: true }),
      Event.countDocuments({ isApproved: false }),
      Ticket.countDocuments(),
      User.countDocuments(),
      Category.countDocuments(),
      Event.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('owner', 'name email')
        .lean(),
      Ticket.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('event', 'title date')
        .populate('user', 'name email')
        .lean(),
      Event.aggregate([
        { $match: { isApproved: true } },
        { $sort: { attendeesCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'users',
            localField: 'owner',
            foreignField: '_id',
            as: 'owner'
          }
        },
        { $unwind: '$owner' }
      ])
    ]);

    // Calculate revenue (simplified - in real app would come from payment records)
    const totalRevenue = await Ticket.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$ticketDetails.ticketprice' }
        }
      }
    ]);

    // Get monthly statistics for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Event.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          eventsCreated: { $sum: 1 },
          approvedEvents: {
            $sum: { $cond: ['$isApproved', 1, 0] }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const dashboardData = {
      overview: {
        totalEvents,
        approvedEvents,
        pendingEvents,
        totalTickets,
        totalUsers,
        totalCategories,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentActivity: {
        recentEvents: recentEvents.slice(0, 5),
        recentTickets: recentTickets.slice(0, 5)
      },
      topPerforming: {
        topEvents: topEvents.slice(0, 5)
      },
      analytics: {
        monthlyStats
      }
    };

    res.status(200).json({ 
      success: true, 
      data: dashboardData 
    });

  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch dashboard data' 
    });
  }
}