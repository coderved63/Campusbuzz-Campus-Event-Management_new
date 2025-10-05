import mongoose, { Schema, Document } from 'mongoose';
import { ITicket } from '@/types';

export interface ITicketDocument extends ITicket, Document {}

const TicketSchema: Schema<ITicketDocument> = new Schema({
  userid: { type: String, required: true },
  eventid: { type: String, required: true },
  ticketDetails: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    eventname: { type: String, required: true },
    eventdate: { type: Date, required: true },
    eventtime: { type: String, required: true },
    ticketprice: { type: Number, required: true },
    qr: { type: String, required: false },
    qrData: { type: String, required: false }, // Store QR data for dynamic generation
  },
  count: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  verifiedAt: { type: Date },
  // Enhanced fields for better ticket management
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  event: { type: Schema.Types.ObjectId, ref: 'Event' },
  ticketType: { type: String, default: 'General' },
  quantity: { type: Number, default: 1 }
}, {
  timestamps: true
});

export default mongoose.models.Ticket || mongoose.model<ITicketDocument>('Ticket', TicketSchema);