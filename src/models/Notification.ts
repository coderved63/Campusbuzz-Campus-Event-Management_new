import mongoose, { Schema, Document } from 'mongoose';
import { INotification } from '@/types';

export interface INotificationDocument extends INotification, Document {}

const NotificationSchema: Schema<INotificationDocument> = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['event', 'ticket', 'system'],
    default: 'event'
  },
  read: {
    type: Boolean,
    default: false
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Notification || mongoose.model<INotificationDocument>('Notification', NotificationSchema);