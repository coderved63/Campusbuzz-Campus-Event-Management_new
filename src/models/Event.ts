import mongoose, { Schema, Document } from 'mongoose';
import { IEvent } from '@/types';

export interface IEventDocument extends IEvent, Document {}

const EventSchema: Schema<IEventDocument> = new Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: false },
  host: { type: String, required: true },
  isApproved: { type: Boolean, default: false },
  // Enhanced fields for complete event management
  capacity: { type: Number, default: 100 },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft' 
  },
  attendeesCount: { type: Number, default: 0 },
  tags: [{ type: String }],
  ticketTypes: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    quantity: { type: Number }
  }]
}, {
  timestamps: true
});

export default mongoose.models.Event || mongoose.model<IEventDocument>('Event', EventSchema);