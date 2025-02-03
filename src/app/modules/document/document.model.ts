import { model, Schema } from 'mongoose';
import { IDocument } from './document.interface';

const documentSchema = new Schema<IDocument>(
  {
    image: {
      type: [String],
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    document: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'delete'],
      default: 'active',
    },
    role: {
      type: String,
      enum: ['BUYER', 'AGENCY'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Document = model<IDocument>('Document', documentSchema);
