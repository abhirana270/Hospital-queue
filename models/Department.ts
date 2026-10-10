import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  code: string;
  description: string;
  location: string;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Department: Model<IDepartment> =
  mongoose.models.Department ||
  mongoose.model<IDepartment>('Department', DepartmentSchema);

export default Department;
