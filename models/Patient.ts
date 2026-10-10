import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPatient extends Document {
  patientId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  symptoms: string[];
  emergencyLevel: 'Critical' | 'Serious' | 'Moderate' | 'Normal';
  department: mongoose.Types.ObjectId;
  arrivalTime: Date;
  assignedDoctor: mongoose.Types.ObjectId | null;
  priorityScore: number;
  queueStatus: 'Waiting' | 'InConsultation' | 'Treated' | 'Cancelled';
}

const PatientSchema = new Schema<IPatient>(
  {
    patientId: {
      type: String,
      required: [true, 'Patient ID is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [0, 'Age cannot be negative'],
      max: [150, 'Age cannot exceed 150'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['Male', 'Female', 'Other'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    symptoms: {
      type: [String],
      default: [],
    },
    emergencyLevel: {
      type: String,
      required: true,
      enum: ['Critical', 'Serious', 'Moderate', 'Normal'],
      default: 'Normal',
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    arrivalTime: {
      type: Date,
      default: Date.now,
    },
    assignedDoctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      default: null,
    },
    priorityScore: {
      type: Number,
      default: 0,
    },
    queueStatus: {
      type: String,
      enum: ['Waiting', 'InConsultation', 'Treated', 'Cancelled'],
      default: 'Waiting',
    },
  },
  {
    timestamps: true,
  }
);

const Patient: Model<IPatient> =
  mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);

export default Patient;
