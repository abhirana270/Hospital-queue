import fs from 'fs';
import path from 'path';
import connectDB from './db';
import Patient, { IPatient } from '@/models/Patient';
import Doctor, { IDoctor } from '@/models/Doctor';
import Department, { IDepartment } from '@/models/Department';

export interface PatientData {
  _id?: string;
  patientId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  symptoms: string[];
  emergencyLevel: 'Critical' | 'Serious' | 'Moderate' | 'Normal';
  department: string; // Department Code or Name
  arrivalTime: string;
  assignedDoctor?: string | null;
  priorityScore: number;
  queueStatus: 'Waiting' | 'InConsultation' | 'Treated' | 'Cancelled';
}

export interface DoctorData {
  doctorId: string;
  name: string;
  specialization: string;
  department: string;
  isAvailable: boolean;
  currentLoad: number;
  maxLoad: number;
}

export interface DepartmentData {
  code: string;
  name: string;
  description: string;
  location: string;
}

// Fallback JSON-backed storage file
const DATA_FILE = path.join(process.cwd(), 'database', 'hospital-store.json');

interface LocalStore {
  patients: PatientData[];
  doctors: DoctorData[];
  departments: DepartmentData[];
}

const defaultDepartments: DepartmentData[] = [
  { code: 'ER', name: 'Emergency Department', description: 'Immediate trauma and acute critical care', location: 'Ground Floor, Building A' },
  { code: 'RAD', name: 'Radiology & Imaging', description: 'X-Ray, CT Scan, MRI Diagnostics', location: 'Ground Floor East, Building A' },
  { code: 'GEN', name: 'General Medicine', description: 'Outpatient consultations and general health checks', location: 'Ground Floor, Building B' },
  { code: 'CARD', name: 'Cardiology', description: 'Heart care, ECG, cardiac ICU', location: '2nd Floor, Building B' },
  { code: 'NEUR', name: 'Neurology', description: 'Brain, nervous system, stroke care', location: '3rd Floor, Building B' },
  { code: 'ORTH', name: 'Orthopedics', description: 'Bone, joint, spine, and fracture management', location: 'Ground Floor, Building C' },
  { code: 'PED', name: 'Pediatrics', description: 'Infant, child, and adolescent healthcare', location: '2nd Floor, Building C' },
];

const defaultDoctors: DoctorData[] = [
  { doctorId: 'DOC101', name: 'Dr. Sarah Jenkins', specialization: 'Emergency Physician', department: 'ER', isAvailable: true, currentLoad: 1, maxLoad: 5 },
  { doctorId: 'DOC102', name: 'Dr. Robert Chen', specialization: 'Cardiologist', department: 'CARD', isAvailable: true, currentLoad: 0, maxLoad: 4 },
  { doctorId: 'DOC103', name: 'Dr. Priya Sharma', specialization: 'General Physician', department: 'GEN', isAvailable: true, currentLoad: 2, maxLoad: 6 },
  { doctorId: 'DOC104', name: 'Dr. Marcus Vance', specialization: 'Orthopedic Surgeon', department: 'ORTH', isAvailable: true, currentLoad: 1, maxLoad: 4 },
  { doctorId: 'DOC105', name: 'Dr. Elena Rostova', specialization: 'Neurologist', department: 'NEUR', isAvailable: false, currentLoad: 3, maxLoad: 3 },
  { doctorId: 'DOC106', name: 'Dr. David Kim', specialization: 'Pediatrician', department: 'PED', isAvailable: true, currentLoad: 0, maxLoad: 5 },
];

const defaultPatients: PatientData[] = [
  {
    patientId: 'P101',
    name: 'James Wilson',
    age: 68,
    gender: 'Male',
    phone: '555-0111',
    symptoms: ['Chest pain', 'Shortness of breath'],
    emergencyLevel: 'Critical',
    department: 'ER',
    arrivalTime: new Date(Date.now() - 45 * 60000).toISOString(),
    assignedDoctor: 'DOC101',
    priorityScore: 0.5,
    queueStatus: 'Waiting',
  },
  {
    patientId: 'P102',
    name: 'Maria Garcia',
    age: 42,
    gender: 'Female',
    phone: '555-0122',
    symptoms: ['Severe migraine', 'Dizziness'],
    emergencyLevel: 'Serious',
    department: 'NEUR',
    arrivalTime: new Date(Date.now() - 35 * 60000).toISOString(),
    assignedDoctor: null,
    priorityScore: 1.8,
    queueStatus: 'Waiting',
  },
  {
    patientId: 'P103',
    name: 'Arthur Pendelton',
    age: 72,
    gender: 'Male',
    phone: '555-0133',
    symptoms: ['Suspected arm fracture', 'Swelling'],
    emergencyLevel: 'Moderate',
    department: 'ORTH',
    arrivalTime: new Date(Date.now() - 25 * 60000).toISOString(),
    assignedDoctor: 'DOC104',
    priorityScore: 2.7,
    queueStatus: 'Waiting',
  },
  {
    patientId: 'P104',
    name: 'Emily Davis',
    age: 26,
    gender: 'Female',
    phone: '555-0144',
    symptoms: ['Mild fever', 'Sore throat'],
    emergencyLevel: 'Normal',
    department: 'GEN',
    arrivalTime: new Date(Date.now() - 50 * 60000).toISOString(),
    assignedDoctor: 'DOC103',
    priorityScore: 3.7,
    queueStatus: 'Waiting',
  },
  {
    patientId: 'P105',
    name: 'Liam Johnson',
    age: 4,
    gender: 'Male',
    phone: '555-0155',
    symptoms: ['High fever', 'Persistent cough'],
    emergencyLevel: 'Serious',
    department: 'PED',
    arrivalTime: new Date(Date.now() - 20 * 60000).toISOString(),
    assignedDoctor: null,
    priorityScore: 1.7,
    queueStatus: 'Waiting',
  },
  {
    patientId: 'P106',
    name: 'Sophia Clark',
    age: 31,
    gender: 'Female',
    phone: '555-0166',
    symptoms: ['Routine annual medical checkup'],
    emergencyLevel: 'Normal',
    department: 'GEN',
    arrivalTime: new Date(Date.now() - 30 * 60000).toISOString(),
    assignedDoctor: 'DOC103',
    priorityScore: 3.8,
    queueStatus: 'Waiting',
  },
  {
    patientId: 'P107',
    name: 'Daniel Brown',
    age: 55,
    gender: 'Male',
    phone: '555-0177',
    symptoms: ['Acute abdominal pain'],
    emergencyLevel: 'Critical',
    department: 'ER',
    arrivalTime: new Date(Date.now() - 10 * 60000).toISOString(),
    assignedDoctor: null,
    priorityScore: 0.9,
    queueStatus: 'Waiting',
  },
  {
    patientId: 'P108',
    name: 'Olivia Martinez',
    age: 29,
    gender: 'Female',
    phone: '555-0188',
    symptoms: ['Joint sprain from sports'],
    emergencyLevel: 'Normal',
    department: 'ORTH',
    arrivalTime: new Date(Date.now() - 15 * 60000).toISOString(),
    assignedDoctor: null,
    priorityScore: 3.9,
    queueStatus: 'Waiting',
  },
];

function readLocalStore(): LocalStore {
  try {
    if (!fs.existsSync(path.dirname(DATA_FILE))) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading local hospital store, using defaults', err);
  }
  const initial: LocalStore = {
    patients: defaultPatients,
    doctors: defaultDoctors,
    departments: defaultDepartments,
  };
  writeLocalStore(initial);
  return initial;
}

function writeLocalStore(store: LocalStore) {
  try {
    if (!fs.existsSync(path.dirname(DATA_FILE))) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local hospital store', err);
  }
}

export const HospitalStore = {
  getPatients: async (): Promise<PatientData[]> => {
    try {
      await connectDB();
      const docs = await Patient.find({}).sort({ arrivalTime: 1 }).lean();
      if (docs && docs.length > 0) {
        return docs.map((d: any) => ({
          _id: d._id?.toString(),
          patientId: d.patientId,
          name: d.name,
          age: d.age,
          gender: d.gender,
          phone: d.phone,
          symptoms: d.symptoms || [],
          emergencyLevel: d.emergencyLevel,
          department: d.department?.toString() || 'GEN',
          arrivalTime: d.arrivalTime?.toISOString?.() || d.arrivalTime || new Date().toISOString(),
          assignedDoctor: d.assignedDoctor?.toString() || null,
          priorityScore: d.priorityScore,
          queueStatus: d.queueStatus,
        }));
      }
    } catch {
      // Fallback to local store
    }
    const store = readLocalStore();
    return store.patients;
  },

  getPatientById: async (id: string): Promise<PatientData | null> => {
    try {
      await connectDB();
      const p = await Patient.findOne({ patientId: id }).lean();
      if (p) {
        return {
          _id: (p as any)._id?.toString(),
          patientId: (p as any).patientId,
          name: (p as any).name,
          age: (p as any).age,
          gender: (p as any).gender,
          phone: (p as any).phone,
          symptoms: (p as any).symptoms || [],
          emergencyLevel: (p as any).emergencyLevel,
          department: (p as any).department?.toString() || 'GEN',
          arrivalTime: (p as any).arrivalTime?.toISOString?.() || (p as any).arrivalTime,
          assignedDoctor: (p as any).assignedDoctor?.toString() || null,
          priorityScore: (p as any).priorityScore,
          queueStatus: (p as any).queueStatus,
        };
      }
    } catch {
      // Fallback
    }
    const store = readLocalStore();
    return store.patients.find((p) => p.patientId === id) || null;
  },

  savePatient: async (patient: PatientData): Promise<PatientData> => {
    try {
      await connectDB();
      const updated = await Patient.findOneAndUpdate(
        { patientId: patient.patientId },
        patient,
        { upsert: true, new: true }
      ).lean();
      if (updated) {
        return patient;
      }
    } catch {
      // Fallback
    }
    const store = readLocalStore();
    const idx = store.patients.findIndex((p) => p.patientId === patient.patientId);
    if (idx >= 0) {
      store.patients[idx] = patient;
    } else {
      store.patients.push(patient);
    }
    writeLocalStore(store);
    return patient;
  },

  updatePatientStatus: async (
    patientId: string,
    status: 'Waiting' | 'InConsultation' | 'Treated' | 'Cancelled'
  ): Promise<boolean> => {
    try {
      await connectDB();
      await Patient.updateOne({ patientId }, { queueStatus: status });
    } catch {
      // Fallback
    }
    const store = readLocalStore();
    const p = store.patients.find((x) => x.patientId === patientId);
    if (p) {
      p.queueStatus = status;
      writeLocalStore(store);
      return true;
    }
    return false;
  },

  getDoctors: async (): Promise<DoctorData[]> => {
    try {
      await connectDB();
      const docs = await Doctor.find({}).lean();
      if (docs && docs.length > 0) {
        return docs.map((d: any) => ({
          doctorId: d.doctorId,
          name: d.name,
          specialization: d.specialization,
          department: d.department?.toString() || 'GEN',
          isAvailable: d.isAvailable,
          currentLoad: d.currentLoad,
          maxLoad: d.maxLoad,
        }));
      }
    } catch {
      // Fallback
    }
    const store = readLocalStore();
    return store.doctors;
  },

  saveDoctor: async (doc: DoctorData): Promise<DoctorData> => {
    try {
      await connectDB();
      await Doctor.findOneAndUpdate({ doctorId: doc.doctorId }, doc, { upsert: true, new: true });
    } catch {
      // Fallback
    }
    const store = readLocalStore();
    const idx = store.doctors.findIndex((d) => d.doctorId === doc.doctorId);
    if (idx >= 0) {
      store.doctors[idx] = doc;
    } else {
      store.doctors.push(doc);
    }
    writeLocalStore(store);
    return doc;
  },

  updateDoctorLoad: async (doctorId: string, delta: number): Promise<void> => {
    try {
      await connectDB();
      await Doctor.updateOne({ doctorId }, { $inc: { currentLoad: delta } });
    } catch {
      // Fallback
    }
    const store = readLocalStore();
    const d = store.doctors.find((x) => x.doctorId === doctorId);
    if (d) {
      d.currentLoad = Math.max(0, d.currentLoad + delta);
      writeLocalStore(store);
    }
  },

  getDepartments: async (): Promise<DepartmentData[]> => {
    try {
      await connectDB();
      const depts = await Department.find({}).lean();
      if (depts && depts.length > 0) {
        return depts.map((dp: any) => ({
          code: dp.code,
          name: dp.name,
          description: dp.description || '',
          location: dp.location || '',
        }));
      }
    } catch {
      // Fallback
    }
    const store = readLocalStore();
    return store.departments;
  },

  resetDefaults: (): LocalStore => {
    const initial: LocalStore = {
      patients: defaultPatients,
      doctors: defaultDoctors,
      departments: defaultDepartments,
    };
    writeLocalStore(initial);
    return initial;
  },
};
