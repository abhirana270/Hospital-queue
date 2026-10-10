import { NextResponse } from 'next/server';
import { HospitalStore } from '@/lib/data-store';
import { callDSAEngine } from '@/lib/dsa-bridge';

// GET: Returns normal consultation queue formatted by C++ Linked List Queue
export async function GET() {
  try {
    const allPatients = await HospitalStore.getPatients();
    const waitingNormal = allPatients.filter(
      (p) => p.queueStatus === 'Waiting' && (p.emergencyLevel === 'Normal' || p.emergencyLevel === 'Moderate')
    );

    // Call C++ Queue engine to build and order linked list
    const dsaPayload = {
      patients: waitingNormal.map((p) => ({
        patientId: p.patientId,
        name: p.name,
        age: p.age,
        emergencyLevel: p.emergencyLevel,
        department: p.department,
        arrivalTimestamp: new Date(p.arrivalTime).getTime(),
      })),
    };

    const dsaRes = await callDSAEngine('queue', 'display', dsaPayload);

    return NextResponse.json({
      success: true,
      dsaEngine: 'C++ Linked List Queue',
      complexity: {
        enqueue: 'O(1)',
        dequeue: 'O(1)',
        peek: 'O(1)',
      },
      queueData: dsaRes.data || { queueLength: 0, visualization: '', patients: [] },
      executionTimeMs: dsaRes.executionTimeMs,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Actions - "dequeue" (call next patient) or "remove" (cancel/reposition)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, patientId } = body;

    const allPatients = await HospitalStore.getPatients();
    const waitingNormal = allPatients.filter(
      (p) => p.queueStatus === 'Waiting' && (p.emergencyLevel === 'Normal' || p.emergencyLevel === 'Moderate')
    );

    if (action === 'dequeue') {
      const dsaPayload = {
        patients: waitingNormal.map((p) => ({
          patientId: p.patientId,
          name: p.name,
          age: p.age,
          emergencyLevel: p.emergencyLevel,
          department: p.department,
          arrivalTimestamp: new Date(p.arrivalTime).getTime(),
        })),
      };

      const dsaRes = await callDSAEngine('queue', 'dequeue', dsaPayload);
      if (dsaRes.success && dsaRes.data?.dequeued) {
        const dequeuedId = dsaRes.data.dequeued.patientId;
        await HospitalStore.updatePatientStatus(dequeuedId, 'InConsultation');
      }

      return NextResponse.json({
        success: true,
        message: 'Patient dequeued and admitted to consultation',
        result: dsaRes.data,
      });
    }

    if (action === 'remove' && patientId) {
      await HospitalStore.updatePatientStatus(patientId, 'Cancelled');
      return NextResponse.json({ success: true, message: `Patient ${patientId} removed from queue` });
    }

    return NextResponse.json({ success: false, error: 'Invalid queue action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
