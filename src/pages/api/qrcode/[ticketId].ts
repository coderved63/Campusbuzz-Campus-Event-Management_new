import type { NextApiRequest, NextApiResponse } from 'next';
import QRCode from 'qrcode';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import Event from '@/models/Event';
import { requireAuth } from '@/lib/auth';

export default requireAuth(async (
  req: NextApiRequest,
  res: NextApiResponse,
  user
) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { ticketId } = req.query;

    if (!ticketId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Ticket ID is required' 
      });
    }

    // Fetch ticket details
    const ticket = await Ticket.findById(ticketId).populate('eventid');
    
    if (!ticket) {
      return res.status(404).json({ 
        success: false, 
        error: 'Ticket not found' 
      });
    }

    // Verify user owns this ticket (unless admin)
    if (ticket.userid.toString() !== user.id && !user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
    }

    // Create comprehensive QR data
    const qrData = {
      ticketId: ticket._id,
      eventId: ticket.eventid._id,
      eventName: ticket.eventid.title,
      eventDate: ticket.eventid.date,
      eventTime: ticket.eventid.time,
      eventLocation: ticket.eventid.location,
      userName: ticket.ticketDetails.name,
      userEmail: ticket.ticketDetails.email,
      price: ticket.ticketDetails.ticketprice,
      purchaseDate: ticket.createdAt,
      verified: true,
      timestamp: new Date().toISOString(),
      // Add security token for verification
      verificationToken: generateVerificationToken(ticket._id, ticket.userid, ticket.eventid._id)
    };

    const qrString = JSON.stringify(qrData);

    // Generate QR code as SVG for better scalability
    const qrCodeSvg = await QRCode.toString(qrString, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
      color: {
        dark: '#1f2937',
        light: '#ffffff'
      }
    });

    // Set appropriate headers for SVG
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.status(200).send(qrCodeSvg);

  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate QR code' 
    });
  }
});

// Generate a verification token for security
function generateVerificationToken(ticketId: string, userId: string, eventId: string): string {
  const crypto = require('crypto');
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const data = `${ticketId}-${userId}-${eventId}-${Date.now()}`;
  return crypto.createHmac('sha256', secret).update(data).digest('hex').substring(0, 16);
}