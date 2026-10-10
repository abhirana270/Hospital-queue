import { NextResponse } from 'next/server';
import { callDSAEngine } from '@/lib/dsa-bridge';
import { HospitalStore } from '@/lib/data-store';

// GET: Returns list of departments and navigation network
export async function GET() {
  try {
    const departments = await HospitalStore.getDepartments();
    const dsaRes = await callDSAEngine('graph', 'list', {});

    return NextResponse.json({
      success: true,
      departments,
      graphNodes: dsaRes.data?.departments || [],
      algorithms: ['Dijkstra (Weighted Shortest Path)', 'BFS (Fewest Transfers)'],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Calculate route between two departments
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { startDepartment, targetDepartment, algorithm } = body;

    if (!startDepartment || !targetDepartment) {
      return NextResponse.json(
        { success: false, error: 'startDepartment and targetDepartment are required' },
        { status: 400 }
      );
    }

    const dsaPayload = {
      startDepartment: startDepartment.toUpperCase(),
      targetDepartment: targetDepartment.toUpperCase(),
      algorithm: algorithm === 'bfs' ? 'bfs' : 'dijkstra',
    };

    const dsaRes = await callDSAEngine('graph', 'navigate', dsaPayload);

    return NextResponse.json({
      success: true,
      dsaEngine: 'C++ Graph Adjacency List',
      algorithmUsed: algorithm === 'bfs' ? 'Breadth-First Search (BFS)' : 'Dijkstra Shortest Path',
      complexity: algorithm === 'bfs' ? 'O(V + E)' : 'O((V + E) log V)',
      navigation: dsaRes.data,
      executionTimeMs: dsaRes.executionTimeMs,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
