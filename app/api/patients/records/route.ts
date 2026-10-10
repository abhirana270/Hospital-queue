import { NextResponse } from 'next/server';
import { HospitalStore } from '@/lib/data-store';
import { callDSAEngine } from '@/lib/dsa-bridge';

// GET /api/patients/records (optional search query ?id=P102)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchId = searchParams.get('id');

    const allPatients = await HospitalStore.getPatients();

    const dsaPayload = {
      patientId: searchId || '',
      patients: allPatients.map((p) => ({
        patientId: p.patientId,
        name: p.name,
        age: p.age,
        gender: p.gender,
        phone: p.phone,
        emergencyLevel: p.emergencyLevel,
        department: p.department,
        queueStatus: p.queueStatus,
        priorityScore: p.priorityScore,
      })),
    };

    const operation = searchId ? 'search' : 'inorder';
    const dsaRes = await callDSAEngine('bst', operation, dsaPayload);

    return NextResponse.json({
      success: true,
      dsaEngine: 'C++ Binary Search Tree (BST)',
      complexity: {
        search: 'O(log n) average',
        insert: 'O(log n) average',
        inorder: 'O(n) ordered traversal',
      },
      records: dsaRes.data,
      executionTimeMs: dsaRes.executionTimeMs,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
