# 🎓 Fullstack GPA & CGPA Calculator (Express + Vanilla JS)

A minimal full‑stack app where students can calculate **GPA per semester** and **overall CGPA**.
- Backend: **Node.js + Express**
- Frontend: **Vanilla HTML/CSS/JS** (served by Express, no build step)
- API:
  - `POST /api/gpa` → body: `{ courses: [{ credits, grade }] }`
  - `POST /api/cgpa` → body: `{ semesters: [{ gpa, credits }] }` **or** `{ semesters: [{ courses: [...] }] }`
  - `GET /api/grades` → default 4.0 grade scale mapping

## 🚀 Run locally
```bash
cd server
npm install
npm start
```
Open http://localhost:5000

## 🧮 Grade scale
Default 4.0 US scale with plus/minus:
A+/A=4.0, A-=3.7, B+=3.3, B=3.0, B-=2.7, C+=2.3, C=2.0, C-=1.7, D+=1.3, D=1.0, D-=0.7, F=0.0

You can change the scale in `server/gradeUtils.js` and the UI will reflect via `/api/grades`.

## 🧪 Examples
- **GPA** of courses [{credits:3, grade:"A"}, {credits:4, grade:"B+"}] → (3*4.0 + 4*3.3) / 7 = 3.600
- **CGPA** for semesters [{gpa:3.6, credits:16}, {gpa:3.2, credits:15}] → (3.6*16 + 3.2*15)/(31)=3.405

## 📁 Project structure
```text
cgpa-gpa-calculator-fullstack/
├─ server/
│  ├─ index.js
│  ├─ gradeUtils.js
│  └─ package.json
└─ public/
   ├─ index.html
   ├─ style.css
   └─ app.js
```

## 🔧 Notes
- No database required.
- Frontend calls backend APIs; you can also compute completely server‑side via `/api/cgpa` passing courses per semester.
- Safe input handling: ignores invalid rows (e.g., missing credits or unknown grade).
