import { execFile } from 'child_process';
import path from 'path';

export interface DSAResult<T = any> {
  success: boolean;
  data: T;
  error?: string;
  executionTimeMs?: number;
}

/**
 * Execute a C++ DSA engine binary with JSON input and parse JSON output.
 */
export async function callDSAEngine<T = any>(
  module: string,
  operation: string,
  input: Record<string, unknown>
): Promise<DSAResult<T>> {
  const startTime = Date.now();
  const isWindows = process.platform === 'win32';
  const ext = isWindows ? '.exe' : '';
  const binaryPath = path.join(
    process.cwd(),
    'dsa',
    module,
    `${module}${ext}`
  );

  const payload = JSON.stringify({ operation, ...input });

  return new Promise((resolve) => {
    const child = execFile(
      binaryPath,
      [],
      { timeout: 10000, maxBuffer: 4 * 1024 * 1024 },
      (error, stdout, stderr) => {
        const executionTimeMs = Date.now() - startTime;
        if (error) {
          resolve({
            success: false,
            data: {} as T,
            error: `DSA engine error (${module}/${operation}): ${error.message}. Stderr: ${stderr}`,
            executionTimeMs,
          });
          return;
        }

        try {
          const result = JSON.parse(stdout.trim());
          resolve({
            success: true,
            data: result as T,
            executionTimeMs,
          });
        } catch {
          resolve({
            success: false,
            data: {} as T,
            error: `Failed to parse DSA engine output: ${stdout}`,
            executionTimeMs,
          });
        }
      }
    );

    if (child.stdin) {
      child.stdin.write(payload);
      child.stdin.end();
    }
  });
}

/**
 * Deterministic Triage Scoring Formula (Specification Section 5.3)
 * Lower score = higher urgency in Binary Min-Heap Priority Queue.
 *
 * S = BaseSeverity - AgeBonus - WaitBonus
 * - Critical: 1.0, Serious: 2.0, Moderate: 3.0, Normal: 4.0
 * - Age bonus: 0.2 if age > 65 or age < 5
 * - Wait bonus: 0.1 for every 15 minutes waiting (max 0.5)
 * Clamped: [0.10, 4.00]
 */
export function calculatePriorityScore(
  emergencyLevel: 'Critical' | 'Serious' | 'Moderate' | 'Normal',
  age: number,
  arrivalTime: Date | string | number = new Date()
): number {
  let baseScore = 4.0;
  if (emergencyLevel === 'Critical') baseScore = 1.0;
  else if (emergencyLevel === 'Serious') baseScore = 2.0;
  else if (emergencyLevel === 'Moderate') baseScore = 3.0;
  else baseScore = 4.0;

  // Age factor: vulnerable populations given priority boost
  let ageBonus = 0.0;
  if (age >= 65 || age <= 5) {
    ageBonus = 0.2;
  }

  // Waiting time factor: urgency increases with prolonged wait
  const arrivalMs = new Date(arrivalTime).getTime();
  const waitMinutes = Math.max(0, Math.floor((Date.now() - arrivalMs) / (1000 * 60)));
  const waitBonus = Math.min(0.5, Math.floor(waitMinutes / 15) * 0.1);

  const finalScore = Math.max(0.1, Number((baseScore - ageBonus - waitBonus).toFixed(2)));
  return finalScore;
}
