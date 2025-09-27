import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import { IEvent } from '@/types';

interface OrderSummaryData {
  event: IEvent;
  orderDetails: {
    ticketQuantity: number;
    ticketPrice: number;
    totalAmount: number;
    serviceFee: number;
    finalTotal: number;
  };
  customerInfo?: {
    name: string;
    email: string;
    phone?: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    await dbConnect();

    const { eventId, quantity = 1, customerInfo } = req.body;

    if (!eventId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Event ID is required' 
      });
    }

    if (quantity < 1 || quantity > 10) {
      return res.status(400).json({ 
        success: false, 
        error: 'Quantity must be between 1 and 10' 
      });
    }

    // Fetch event details
    const event = await Event.findById(eventId)
      .populate('owner', 'name email')
      .lean();

    if (!event) {
      return res.status(404).json({ 
        success: false, 
        error: 'Event not found' 
      });
    }

    if (!event.isApproved) {
      return res.status(400).json({ 
        success: false, 
        error: 'Event is not approved for booking' 
      });
    }

    // Check capacity if available
    if (event.capacity && event.attendeesCount && 
        (event.attendeesCount + quantity) > event.capacity) {
      return res.status(400).json({ 
        success: false, 
        error: 'Not enough tickets available' 
      });
    }

    // Calculate pricing
    const ticketPrice = event.price || 0;
    const subtotal = ticketPrice * quantity;
    const serviceFee = Math.max(subtotal * 0.05, 2); // 5% service fee, minimum $2
    const finalTotal = subtotal + serviceFee;

    const orderSummary: OrderSummaryData = {
      event: event as IEvent,
      orderDetails: {
        ticketQuantity: quantity,
        ticketPrice,
        totalAmount: subtotal,
        serviceFee,
        finalTotal
      },
      ...(customerInfo && { customerInfo })
    };

    res.status(200).json({ 
      success: true, 
      data: orderSummary 
    });

  } catch (error) {
    console.error('Error generating order summary:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate order summary' 
    });
  }
}