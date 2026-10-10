import { NextResponse } from 'next/server';
import { HospitalStore, DoctorData } from '@/lib/data-store';

// GET: List doctors with load stats
export async function GET() {
  try {
    const doctors = await HospitalStore.getDoctors();
    return NextResponse.json({ success: true, count: doctors.length, doctors });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Add new doctor OR assign doctor to patient
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, name, specialization, department, maxLoad, patientId, doctorId } = body;

    // ACTION: Add New Doctor
    if (action === 'create' || (name && specialization && !patientId)) {
      if (!name || !specialization || !department) {
        return NextResponse.json(
          { success: false, error: 'Name, specialization, and department are required' },
          { status: 400 }
        );
      }

      const existingDocs = await HospitalStore.getDoctors();
      let maxNum = 100;
      for (const d of existingDocs) {
        const match = d.doctorId.match(/^DOC(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      }
      const newDoctorId = `DOC${maxNum + 1}`;

      const newDoc: DoctorData = {
        doctorId: newDoctorId,
        name: name.trim().startsWith('Dr.') ? name.trim() : `Dr. ${name.trim()}`,
        specialization: specialization.trim(),
        department: department.toUpperCase(),
        isAvailable: true,
        currentLoad: 0,
        maxLoad: Number(maxLoad) > 0 ? Number(maxLoad) : 5,
      };

      await HospitalStore.saveDoctor(newDoc);

      return NextResponse.json({
        success: true,
        message: `Doctor ${newDoc.name} (${newDoctorId}) registered successfully`,
        doctor: newDoc,
      });
    }

    // ACTION: Assign Doctor to Patient using Least Current Load Strategy
    if (!patientId) {
      return NextResponse.json({ success: false, error: 'patientId is required for assignment' }, { status: 400 });
    }

    const patient = await HospitalStore.getPatientById(patientId);
    if (!patient) {
      return NextResponse.json({ success: false, error: 'Patient not found' }, { status: 404 });
    }

    const doctors = await HospitalStore.getDoctors();
    let assignedDocId = doctorId;

    if (!assignedDocId) {
      // Auto-assign using Least Current Load Strategy
      const targetDept = department || patient.department;
      const suitable = doctors.filter(
        (d) => d.isAvailable && d.department.toUpperCase() === targetDept.toUpperCase() && d.currentLoad < d.maxLoad
      );

      if (suitable.length === 0) {
        return NextResponse.json(
          { success: false, error: `No available doctor in department ${targetDept} within capacity` },
          { status: 400 }
        );
      }

      // Sort by current load ascending
      suitable.sort((a, b) => a.currentLoad - b.currentLoad);
      assignedDocId = suitable[0].doctorId;
    }

    // Update old doctor load if reassigning
    if (patient.assignedDoctor && patient.assignedDoctor !== assignedDocId) {
      await HospitalStore.updateDoctorLoad(patient.assignedDoctor, -1);
    }

    // Update new doctor load
    await HospitalStore.updateDoctorLoad(assignedDocId, 1);

    patient.assignedDoctor = assignedDocId;
    await HospitalStore.savePatient(patient);

    const docObj = doctors.find((d) => d.doctorId === assignedDocId);

    return NextResponse.json({
      success: true,
      message: `Assigned patient ${patientId} to ${docObj?.name || assignedDocId} (Strategy: Least Current Load)`,
      patient,
      assignedDoctor: docObj,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
