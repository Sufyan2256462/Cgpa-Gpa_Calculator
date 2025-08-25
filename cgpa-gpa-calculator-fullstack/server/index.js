import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { defaultGradeScale, calculateGPA, calculateCGPA } from "./gradeUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- API routes ---
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.get("/api/grades", (_req, res) => {
  res.json({ scale: defaultGradeScale });
});

app.post("/api/gpa", (req, res) => {
  try {
    const { courses, gradeScale } = req.body || {};
    const result = calculateGPA(courses, gradeScale || defaultGradeScale);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "Invalid payload" });
  }
});

app.post("/api/cgpa", (req, res) => {
  try {
    const { gradeScale, ...payload } = req.body || {};
    const result = calculateCGPA(payload, gradeScale || defaultGradeScale);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "Invalid payload" });
  }
});

// Serve static frontend
app.use(express.static(path.join(__dirname, "..", "public")));
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
