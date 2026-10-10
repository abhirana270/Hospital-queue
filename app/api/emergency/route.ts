import { NextResponse } from 'next/server';
import { HospitalStore } from '@/lib/data-store';
import { callDSAEngine, calculatePriorityScore } from '@/lib/dsa-bridge';

// GET: Returns emergency triage queue ordered by C++ Binary Min-Heap
export async function GET() {
  try {
    const allPatients = await HospitalStore.getPatients();
    const waitingEmergency = allPatients.filter(
      (p) => p.queueStatus === 'Waiting' && (p.emergencyLevel === 'Critical' || p.emergencyLevel === 'Serious')
    );

    const dsaPayload = {
      patients: waitingEmergency.map((p) => ({
        patientId: p.patientId,
        name: p.name,
        age: p.age,
        emergencyLevel: p.emergencyLevel,
        department: p.department,
        priorityScore: p.priorityScore || calculatePriorityScore(p.emergencyLevel, p.age, p.arrivalTime),
        arrivalTimestamp: new Date(p.arrivalTime).getTime(),
      })),
    };

    const dsaRes = await callDSAEngine('priority_queue', 'display', dsaPayload);

    return NextResponse.json({
      success: true,
      dsaEngine: 'C++ Binary Heap Priority Queue (Min-Heap)',
      complexity: {
        insert: 'O(log n)',
        extractMin: 'O(log n)',
        peekMin: 'O(1)',
        reposition: 'O(log n)',
      },
      heapData: dsaRes.data || { queueLength: 0, patients: [], heapArray: [] },
      executionTimeMs: dsaRes.executionTimeMs,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Triage operations - "extract_min" (call highest priority patient) or "update_priority"
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, patientId, newScore } = body;

    const allPatients = await HospitalStore.getPatients();
    const waitingEmergency = allPatients.filter(
      (p) => p.queueStatus === 'Waiting' && (p.emergencyLevel === 'Critical' || p.emergencyLevel === 'Serious')
    );

    const dsaPayload = {
      patients: waitingEmergency.map((p) => ({
        patientId: p.patientId,
        name: p.name,
        age: p.age,
        emergencyLevel: p.emergencyLevel,
        department: p.department,
        priorityScore: p.priorityScore || calculatePriorityScore(p.emergencyLevel, p.age, p.arrivalTime),
        arrivalTimestamp: new Date(p.arrivalTime).getTime(),
      })),
    };

    if (action === 'extract_min') {
      const dsaRes = await callDSAEngine('priority_queue', 'extract_min', dsaPayload);
      if (dsaRes.success && dsaRes.data?.extracted) {
        const admittedId = dsaRes.data.extracted.patientId;
        await HospitalStore.updatePatientStatus(admittedId, 'InConsultation');
      }
      return NextResponse.json({
        success: true,
        message: 'Highest urgency patient admitted via Min-Heap extractMin',
        result: dsaRes.data,
      });
    }

    if (action === 'update_priority' && patientId && typeof newScore === 'number') {
      const dsaRes = await callDSAEngine('priority_queue', 'update_priority', {
        ...dsaPayload,
        patientId,
        newPriorityScore: newScore,
      });

      // Update patient priority score in store
      const p = await HospitalStore.getPatientById(patientId);
      if (p) {
        p.priorityScore = newScore;
        await HospitalStore.savePatient(p);
      }

      return NextResponse.json({
        success: true,
        message: `Priority score updated for ${patientId} and repositioned in Min-Heap in O(log n)`,
        result: dsaRes.data,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid emergency triage action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
