import { NextResponse } from 'next/server';
import { HospitalStore, PatientData } from '@/lib/data-store';
import { calculatePriorityScore, callDSAEngine } from '@/lib/dsa-bridge';

// GET: List all patients, optional filters by department, status, emergencyLevel
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const status = searchParams.get('status');
    const emergencyLevel = searchParams.get('emergencyLevel');

    let patients = await HospitalStore.getPatients();

    if (department) {
      patients = patients.filter((p) => p.department.toLowerCase() === department.toLowerCase());
    }
    if (status) {
      patients = patients.filter((p) => p.queueStatus.toLowerCase() === status.toLowerCase());
    }
    if (emergencyLevel) {
      patients = patients.filter((p) => p.emergencyLevel.toLowerCase() === emergencyLevel.toLowerCase());
    }

    return NextResponse.json({ success: true, count: patients.length, patients });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Register a new patient
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, age, gender, phone, symptoms, emergencyLevel, department } = body;

    if (!name || age === undefined || !gender || !phone || !department) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, age, gender, phone, department' },
        { status: 400 }
      );
    }

    // Generate unique sequential Patient ID e.g. P109
    const existing = await HospitalStore.getPatients();
    let maxNum = 100;
    for (const p of existing) {
      const match = p.patientId.match(/^P(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
    const newPatientId = `P${maxNum + 1}`;

    const numAge = Number(age);
    const level = emergencyLevel || 'Normal';
    const arrivalTime = new Date().toISOString();

    // Calculate deterministic priority score via triage formula
    const priorityScore = calculatePriorityScore(level, numAge, arrivalTime);

    // Doctor Auto-Assignment: Least Current Load Strategy
    const doctors = await HospitalStore.getDoctors();
    const suitableDoctors = doctors.filter(
      (d) => d.isAvailable && d.department.toUpperCase() === department.toUpperCase() && d.currentLoad < d.maxLoad
    );

    let assignedDoctorId: string | null = null;
    if (suitableDoctors.length > 0) {
      // Sort by current load ascending (least loaded doctor gets patient)
      suitableDoctors.sort((a, b) => a.currentLoad - b.currentLoad);
      assignedDoctorId = suitableDoctors[0].doctorId;
      await HospitalStore.updateDoctorLoad(assignedDoctorId, 1);
    }

    const newPatient: PatientData = {
      patientId: newPatientId,
      name: name.trim(),
      age: numAge,
      gender,
      phone: phone.trim(),
      symptoms: Array.isArray(symptoms) ? symptoms : symptoms ? symptoms.split(',').map((s: string) => s.trim()) : [],
      emergencyLevel: level,
      department: department.toUpperCase(),
      arrivalTime,
      assignedDoctor: assignedDoctorId,
      priorityScore,
      queueStatus: 'Waiting',
    };

    await HospitalStore.savePatient(newPatient);

    // Call appropriate C++ engine for instant queue verification
    let dsaFeedback: any = {};
    if (level === 'Critical' || level === 'Serious') {
      const allWaiting = (await HospitalStore.getPatients()).filter(
        (p) => p.queueStatus === 'Waiting' && (p.emergencyLevel === 'Critical' || p.emergencyLevel === 'Serious')
      );
      const res = await callDSAEngine('priority_queue', 'display', {
        patients: allWaiting.map((p) => ({
          patientId: p.patientId,
          name: p.name,
          age: p.age,
          emergencyLevel: p.emergencyLevel,
          department: p.department,
          priorityScore: p.priorityScore,
          arrivalTimestamp: new Date(p.arrivalTime).getTime(),
        })),
      });
      dsaFeedback = {
        queueType: 'C++ Binary Heap Priority Queue',
        queueLength: res.data?.queueLength,
      };
    } else {
      const allWaiting = (await HospitalStore.getPatients()).filter(
        (p) => p.queueStatus === 'Waiting' && (p.emergencyLevel === 'Normal' || p.emergencyLevel === 'Moderate')
      );
      const res = await callDSAEngine('queue', 'display', {
        patients: allWaiting.map((p) => ({
          patientId: p.patientId,
          name: p.name,
          age: p.age,
          emergencyLevel: p.emergencyLevel,
          department: p.department,
          arrivalTimestamp: new Date(p.arrivalTime).getTime(),
        })),
      });
      dsaFeedback = {
        queueType: 'C++ Linked List Queue',
        queueLength: res.data?.queueLength,
        visualization: res.data?.visualization,
      };
    }

    return NextResponse.json({
      success: true,
      message: `Patient ${newPatientId} registered successfully`,
      patient: newPatient,
      dsaFeedback,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
