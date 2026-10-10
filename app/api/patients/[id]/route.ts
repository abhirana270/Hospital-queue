import { NextResponse } from 'next/server';
import { HospitalStore } from '@/lib/data-store';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const patient = await HospitalStore.getPatientById(params.id);
    if (!patient) {
      return NextResponse.json({ success: false, error: 'Patient not found' }, { status: 404 });
    }

    // Determine position in queue
    const allPatients = await HospitalStore.getPatients();
    const waitingSameQueue = allPatients.filter(
      (p) =>
        p.queueStatus === 'Waiting' &&
        (patient.emergencyLevel === 'Critical' || patient.emergencyLevel === 'Serious'
          ? p.emergencyLevel === 'Critical' || p.emergencyLevel === 'Serious'
          : p.emergencyLevel === 'Normal' || p.emergencyLevel === 'Moderate')
    );

    let position = -1;
    if (patient.queueStatus === 'Waiting') {
      if (patient.emergencyLevel === 'Critical' || patient.emergencyLevel === 'Serious') {
        waitingSameQueue.sort((a, b) => a.priorityScore - b.priorityScore);
      } else {
        waitingSameQueue.sort(
          (a, b) => new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime()
        );
      }
      position = waitingSameQueue.findIndex((p) => p.patientId === patient.patientId) + 1;
    }

    // Estimated waiting time: ~12 minutes per patient ahead
    const estimatedWaitMinutes = position > 0 ? (position - 1) * 12 : 0;

    return NextResponse.json({
      success: true,
      patient,
      queueInfo: {
        position: position > 0 ? position : 'Not in queue',
        estimatedWaitMinutes,
        queueType:
          patient.emergencyLevel === 'Critical' || patient.emergencyLevel === 'Serious'
            ? 'Emergency Priority Queue (Binary Heap)'
            : 'Normal Consultation Queue (Linked List)',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { status, priorityScore, assignedDoctor } = body;

    const patient = await HospitalStore.getPatientById(params.id);
    if (!patient) {
      return NextResponse.json({ success: false, error: 'Patient not found' }, { status: 404 });
    }

    if (status) {
      // If status changed to Treated or Cancelled, reduce doctor load
      if ((status === 'Treated' || status === 'Cancelled') && patient.assignedDoctor) {
        await HospitalStore.updateDoctorLoad(patient.assignedDoctor, -1);
      }
      await HospitalStore.updatePatientStatus(params.id, status);
      patient.queueStatus = status;
    }

    if (typeof priorityScore === 'number') {
      patient.priorityScore = priorityScore;
    }

    if (assignedDoctor !== undefined) {
      patient.assignedDoctor = assignedDoctor;
    }

    await HospitalStore.savePatient(patient);

    return NextResponse.json({ success: true, message: 'Patient updated', patient });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const patient = await HospitalStore.getPatientById(params.id);
    if (!patient) {
      return NextResponse.json({ success: false, error: 'Patient not found' }, { status: 404 });
    }

    if (patient.assignedDoctor) {
      await HospitalStore.updateDoctorLoad(patient.assignedDoctor, -1);
    }
    await HospitalStore.updatePatientStatus(params.id, 'Cancelled');

    return NextResponse.json({ success: true, message: `Patient ${params.id} cancelled` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
