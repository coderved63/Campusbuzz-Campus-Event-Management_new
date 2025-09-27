import mongoose, { Schema, Document } from 'mongoose';
import { ICategory } from '@/types';

export interface ICategoryDocument extends ICategory, Document {}

const CategorySchema: Schema<ICategoryDocument> = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    default: '🎉'
  },
  color: {
    type: String,
    default: '#4F46E5'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Category || mongoose.model<ICategoryDocument>('Category', CategorySchema);