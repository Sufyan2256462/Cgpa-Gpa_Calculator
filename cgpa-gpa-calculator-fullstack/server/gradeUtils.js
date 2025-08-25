// Mapping for a standard 4.0 scale with +/-
export const defaultGradeScale = {
  "A+": 4.0,
  "A": 4.0,
  "A-": 3.7,
  "B+": 3.3,
  "B": 3.0,
  "B-": 2.7,
  "C+": 2.3,
  "C": 2.0,
  "C-": 1.7,
  "D+": 1.3,
  "D": 1.0,
  "D-": 0.7,
  "F": 0.0
};

export function toNumber(val, fallback = 0) {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

export function calculateGPA(courses, gradeScale = defaultGradeScale) {
  // courses: [{credits, grade}] - grade can be string (A, B+) or number on 4.0
  let totalQP = 0;
  let totalCredits = 0;

  for (const c of courses || []) {
    const credits = toNumber(c.credits, 0);
    if (credits <= 0) continue;

    let gp = null;
    if (typeof c.grade === "string") {
      const g = c.grade.trim().toUpperCase();
      gp = gradeScale[g];
      if (gp == null) {
        // try numeric from string
        const parsed = Number(g);
        gp = Number.isFinite(parsed) ? parsed : null;
      }
    } else if (typeof c.grade === "number") {
      gp = c.grade;
    }

    if (gp == null || !Number.isFinite(gp)) continue;
    totalQP += gp * credits;
    totalCredits += credits;
  }

  const gpa = totalCredits > 0 ? totalQP / totalCredits : 0;
  return { gpa: Number(gpa.toFixed(3)), totalCredits };
}

export function calculateCGPA(payload, gradeScale = defaultGradeScale) {
  // Supports two payload shapes:
  // 1) { semesters: [{ gpa, credits }, ...] }
  // 2) { semesters: [{ courses: [{credits, grade}, ...] }, ...] }
  const semesters = payload?.semesters || [];
  let totalQP = 0;
  let totalCredits = 0;

  for (const s of semesters) {
    if (Array.isArray(s.courses)) {
      const { gpa, totalCredits: cr } = calculateGPA(s.courses, gradeScale);
      totalQP += gpa * cr;
      totalCredits += cr;
    } else {
      const gpa = toNumber(s.gpa, 0);
      const cr = toNumber(s.credits, 0);
      if (cr > 0 && Number.isFinite(gpa)) {
        totalQP += gpa * cr;
        totalCredits += cr;
      }
    }
  }

  const cgpa = totalCredits > 0 ? totalQP / totalCredits : 0;
  return { cgpa: Number(cgpa.toFixed(3)), totalCredits };
}
