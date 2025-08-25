const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const gradeSelectOptions = (scale) =>
  Object.entries(scale)
    .map(([k, v]) => `<option value="${k}">${k} (${v.toFixed(1)})</option>`)
    .join("");

async function fetchJSON(url, opts={}) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) throw new Error("Request failed");
  return res.json();
}

let gradeScale = {};
async function loadGradeScale() {
  const { scale } = await fetchJSON("/api/grades");
  gradeScale = scale;
  const grid = $("#grade-scale");
  grid.innerHTML = "";
  for (const [k, v] of Object.entries(scale)) {
    const pill = document.createElement("div");
    pill.className = "grade-pill";
    pill.innerHTML = `<span>${k}</span><strong>${Number(v).toFixed(1)}</strong>`;
    grid.appendChild(pill);
  }
}

function newSemester(title = "Semester") {
  const tmpl = $("#semester-template").content.cloneNode(true);
  const el = tmpl.querySelector(".semester");
  el.querySelector(".semester-title").textContent = title;
  const coursesEl = el.querySelector(".courses");
  const gradeOptionsHTML = gradeSelectOptions(gradeScale);

  const addCourse = () => {
    const ct = $("#course-template").content.cloneNode(true);
    const row = ct.querySelector(".course");
    const sel = row.querySelector(".course-grade");
    sel.innerHTML = gradeOptionsHTML;
    coursesEl.appendChild(row);
    row.querySelector(".remove-course").addEventListener("click", () => row.remove());
  };

  el.querySelector(".add-course").addEventListener("click", addCourse);
  el.querySelector(".remove-semester").addEventListener("click", () => el.remove());
  el.querySelector(".calc-sem-gpa").addEventListener("click", async () => {
    const payload = {
      courses: $$(" .course", el).map(row => ({
        name: $(".course-name", row).value.trim(),
        credits: Number($(".course-credits", row).value),
        grade: $(".course-grade", row).value
      }))
    };
    try {
      const res = await fetchJSON("/api/gpa", { method: "POST", body: JSON.stringify(payload) });
      $(".sem-gpa", el).textContent = `GPA: ${res.gpa} (Credits: ${res.totalCredits})`;
    } catch {
      $(".sem-gpa", el).textContent = "GPA: Error";
    }
  });

  // add one empty course row by default
  addCourse();
  return el;
}

function getSelectedSemester() {
  return $$(".semester").find(s => $(".select-semester", s)?.checked);
}

$("#add-semester").addEventListener("click", () => {
  $("#semesters").appendChild(newSemester(`Semester ${$$(".semester").length + 1}`));
});

$("#reset").addEventListener("click", () => {
  $("#semesters").innerHTML = "";
  $("#gpa-result").textContent = "GPA: —";
  $("#cgpa-result").textContent = "CGPA: —";
});

$("#calc-gpa").addEventListener("click", async () => {
  const sem = getSelectedSemester();
  if (!sem) {
    $("#gpa-result").textContent = "GPA: Select a semester radio button ↑";
    return;
  }
  const payload = {
    courses: $$(" .course", sem).map(row => ({
      name: $(".course-name", row).value.trim(),
      credits: Number($(".course-credits", row).value),
      grade: $(".course-grade", row).value
    }))
  };
  try {
    const res = await fetchJSON("/api/gpa", { method: "POST", body: JSON.stringify(payload) });
    $("#gpa-result").textContent = `GPA: ${res.gpa} (Credits: ${res.totalCredits})`;
  } catch {
    $("#gpa-result").textContent = "GPA: Error";
  }
});

$("#calc-cgpa").addEventListener("click", async () => {
  const semestersPayload = $$(".semester").map(sem => ({
    courses: $$(" .course", sem).map(row => ({
      credits: Number($(".course-credits", row).value),
      grade: $(".course-grade", row).value
    }))
  }));
  try {
    const res = await fetchJSON("/api/cgpa", { method: "POST", body: JSON.stringify({ semesters: semestersPayload }) });
    $("#cgpa-result").textContent = `CGPA: ${res.cgpa} (Credits: ${res.totalCredits})`;
  } catch {
    $("#cgpa-result").textContent = "CGPA: Error";
  }
});

// Initial load
loadGradeScale().then(() => {
  // Add two semesters by default
  $("#semesters").appendChild(newSemester("Semester 1"));
  $("#semesters").appendChild(newSemester("Semester 2"));
});
