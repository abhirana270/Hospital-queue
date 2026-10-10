import { NextResponse } from 'next/server';
import { HospitalStore } from '@/lib/data-store';

export async function GET() {
  try {
    const patients = await HospitalStore.getPatients();
    const doctors = await HospitalStore.getDoctors();
    const departments = await HospitalStore.getDepartments();

    const now = Date.now();
    const waitingPatients = patients.filter((p) => p.queueStatus === 'Waiting');
    const treatedPatients = patients.filter((p) => p.queueStatus === 'Treated');
    const inConsultation = patients.filter((p) => p.queueStatus === 'InConsultation');

    // Calculate wait times in minutes
    const waitTimes = waitingPatients.map((p) => {
      const arr = new Date(p.arrivalTime).getTime();
      return Math.max(0, Math.floor((now - arr) / 60000));
    });

    const avgWaitTimeMinutes =
      waitTimes.length > 0 ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length) : 0;
    const maxWaitTimeMinutes = waitTimes.length > 0 ? Math.max(...waitTimes) : 0;

    // Severity breakdown
    const criticalCount = waitingPatients.filter((p) => p.emergencyLevel === 'Critical').length;
    const seriousCount = waitingPatients.filter((p) => p.emergencyLevel === 'Serious').length;
    const moderateCount = waitingPatients.filter((p) => p.emergencyLevel === 'Moderate').length;
    const normalCount = waitingPatients.filter((p) => p.emergencyLevel === 'Normal').length;

    // Department load map
    const departmentLoad = departments.map((d) => ({
      code: d.code,
      name: d.name,
      waiting: waitingPatients.filter((p) => p.department.toUpperCase() === d.code.toUpperCase()).length,
      inConsultation: inConsultation.filter((p) => p.department.toUpperCase() === d.code.toUpperCase()).length,
      treated: treatedPatients.filter((p) => p.department.toUpperCase() === d.code.toUpperCase()).length,
    }));

    // Doctor utilization rate
    const availableDocs = doctors.filter((d) => d.isAvailable).length;
    const totalCapacity = doctors.reduce((acc, d) => acc + d.maxLoad, 0);
    const currentTotalLoad = doctors.reduce((acc, d) => acc + d.currentLoad, 0);
    const utilizationPercent = totalCapacity > 0 ? Math.round((currentTotalLoad / totalCapacity) * 100) : 0;

    return NextResponse.json({
      success: true,
      metrics: {
        totalPatients: patients.length,
        waitingPatients: waitingPatients.length,
        emergencyWaiting: criticalCount + seriousCount,
        normalWaiting: moderateCount + normalCount,
        inConsultation: inConsultation.length,
        treatedToday: treatedPatients.length,
        availableDoctors: availableDocs,
        totalDoctors: doctors.length,
        avgWaitTimeMinutes,
        maxWaitTimeMinutes,
        utilizationPercent,
      },
      severityBreakdown: {
        Critical: criticalCount,
        Serious: seriousCount,
        Moderate: moderateCount,
        Normal: normalCount,
      },
      departmentLoad,
      dsaEngineStatus: {
        linkedListQueue: 'Active (O(1))',
        binaryHeap: 'Active (O(log n))',
        hashTable: 'Active (O(1) avg)',
        bstRecords: 'Active (O(log n) avg)',
        graphNavigation: 'Active (Dijkstra/BFS)',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
