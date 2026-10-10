import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDoctor extends Document {
  doctorId: string;
  name: string;
  specialization: string;
  department: mongoose.Types.ObjectId;
  isAvailable: boolean;
  currentLoad: number;
  maxLoad: number;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    doctorId: {
      type: String,
      required: [true, 'Doctor ID is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    currentLoad: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxLoad: {
      type: Number,
      default: 5,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

const Doctor: Model<IDoctor> =
  mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema);

export default Doctor;
