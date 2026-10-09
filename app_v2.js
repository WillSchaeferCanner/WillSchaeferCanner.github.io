// Tunable settings -------------------------------------------------
// An assignment worth this fraction of the course (or more) counts as
// "maximum weight" before the other factors are applied.
const MAX_WEIGHT_FRACTION = 0.2;

// Grade adjustment: a low grade makes each assignment matter more,
// a high grade (a cushion) makes it matter a bit less.
const LOW_GRADE = 60;   // at or below this, multiplier is MAX_GRADE_MULT
const HIGH_GRADE = 95;  // at or above this, multiplier is MIN_GRADE_MULT
const MIN_GRADE_MULT = 0.8;
const MAX_GRADE_MULT = 1.2;
// -------------------------------------------------------------------

const form = document.getElementById("importance-form");
const errorEl = document.getElementById("error");
const resultEl = document.getElementById("result");
const scoreEl = document.getElementById("score");
const circleEl = document.getElementById("score-circle");
const labelEl = document.getElementById("label");
const detailsEl = document.getElementById("details");

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function gradeMultiplier(grade) {
  const t = clamp((grade - LOW_GRADE) / (HIGH_GRADE - LOW_GRADE), 0, 1);
  return MAX_GRADE_MULT - t * (MAX_GRADE_MULT - MIN_GRADE_MULT);
}

function calculateImportance(assignmentPoints, totalPoints, currentGrade, reassessFactor) {
  const weight = assignmentPoints / totalPoints;                 // share of the course
  const weightScore = Math.pow(clamp(weight / MAX_WEIGHT_FRACTION, 0, 1), 0.7);
  const raw = weightScore * reassessFactor * gradeMultiplier(currentGrade);
  const score = 1 + 9 * clamp(raw, 0, 1);                        // map to 1-10
  return { score, weight };
}

function describe(score) {
  if (score < 2.5) return { text: "Not very important", color: "#6b7280" };
  if (score < 4.5) return { text: "Low importance", color: "#0ea5e9" };
  if (score < 6.5) return { text: "Moderately important", color: "#d97706" };
  if (score < 8.5) return { text: "Very important", color: "#ea580c" };
  return { text: "Critical", color: "#dc2626" };
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const assignmentPoints = parseFloat(document.getElementById("assignment-points").value);
  const totalPoints = parseFloat(document.getElementById("total-points").value);
  const currentGrade = parseFloat(document.getElementById("current-grade").value);
  const reassessFactor = parseFloat(document.getElementById("reassess").value);

  errorEl.hidden = true;

  if ([assignmentPoints, totalPoints, currentGrade].some(Number.isNaN)) {
    return showError("Please fill in all of the number boxes.");
  }
  if (assignmentPoints < 0 || totalPoints <= 0 || currentGrade < 0) {
    return showError("Points and grade must be positive numbers (total points must be above 0).");
  }
  if (assignmentPoints > totalPoints) {
    return showError("The assignment can't be worth more points than the whole class.");
  }

  const { score, weight } = calculateImportance(
    assignmentPoints, totalPoints, currentGrade, reassessFactor
  );
  const rounded = Math.round(score * 10) / 10;
  const { text, color } = describe(score);

  scoreEl.textContent = Number.isInteger(rounded) ? rounded : rounded.toFixed(1);
  circleEl.style.background = color;
  labelEl.textContent = text;
  detailsEl.textContent =
    `This assignment is ${(weight * 100).toFixed(1)}% of your total course grade.`;
  resultEl.hidden = false;
});

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

document.getElementById("random-btn").addEventListener("click", () => {
  // Total course points: 200 to 2000, in steps of 50
  const total = randomInt(4, 40) * 50;
  // Assignment points: 5 up to 30% of the total, in steps of 5
  const assignment = randomInt(1, Math.floor((total * 0.3) / 5)) * 5;
  const grade = randomInt(50, 100);
  const select = document.getElementById("reassess");

  document.getElementById("total-points").value = total;
  document.getElementById("assignment-points").value = assignment;
  document.getElementById("current-grade").value = grade;
  select.selectedIndex = randomInt(0, select.options.length - 1);

  errorEl.hidden = true;
  resultEl.hidden = true;
});

function showError(message) {
  resultEl.hidden = true;
  errorEl.textContent = message;
  errorEl.hidden = false;
}
