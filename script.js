const form = document.getElementById("form");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const errorEl = document.getElementById("error");
const list = document.getElementById("list");
const totalEl = document.getElementById("total");
const filterSelect = document.getElementById("filter");
const warnEl = document.getElementById("warn");
const catsEl = document.getElementById("cats");
const themeBtn = document.getElementById("theme");

const DAILY_BUDGET = 5000;
const naira = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" });


function load() {
  try {
    const saved = JSON.parse(localStorage.getItem("expenses"));
    return Array.isArray(saved) ? saved : [];
  } catch (e) {
    return [];
  }
}
let expenses = load();

function saveAndRender() {
  try { localStorage.setItem("expenses", JSON.stringify(expenses)); } catch (e) {}
  render();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}


function render() {
  list.innerHTML = "";
  let total = 0;
  let todayTotal = 0;
  const perCategory = {};

  for (const exp of expenses) {
    perCategory[exp.category] = (perCategory[exp.category] || 0) + exp.amount;
    if (exp.date === today()) todayTotal += exp.amount;
    if (filterSelect.value !== "All" && exp.category !== filterSelect.value) continue;

    const li = document.createElement("li");
    const text = document.createElement("span");
    text.textContent = `${exp.title} · ${exp.category} · ${naira.format(exp.amount)}`;
    if (exp.date) {
      const meta = document.createElement("small");
      meta.className = "meta";
      meta.textContent = exp.date;
      text.append(meta);
    }

    const del = document.createElement("button");
    del.textContent = "Delete";
    del.className = "delete";
    del.type = "button";
    del.dataset.id = exp.id;
    del.setAttribute("aria-label", `Delete ${exp.title}`);

    li.append(text, del);
    list.append(li);
    total += exp.amount;
  }

  if (!list.children.length) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No expenses to show yet.";
    list.append(empty);
  }

  totalEl.textContent = naira.format(total);

  catsEl.innerHTML = "";
  for (const [cat, sum] of Object.entries(perCategory)) {
    const chip = document.createElement("li");
    chip.textContent = `${cat}: ${naira.format(sum)}`;
    catsEl.append(chip);
  }

  warnEl.hidden = todayTotal <= DAILY_BUDGET;
  warnEl.textContent = `You’ve spent ${naira.format(todayTotal)} today, over your ${naira.format(DAILY_BUDGET)} daily budget.`;
}


form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  if (title === "" || !(amount > 0) || !Number.isFinite(amount)) {
    errorEl.textContent = "Enter a title and an amount above ₦0.";
    return;
  }
  errorEl.textContent = "";
  expenses.push({
    id: Date.now(),
    title,
    amount,
    category: categoryInput.value,
    date: today(),
  });
  saveAndRender();
  form.reset();
  titleInput.focus();
});


list.addEventListener("click", (event) => {
  if (!event.target.matches(".delete")) return;
  const id = Number(event.target.dataset.id);
  expenses = expenses.filter((exp) => exp.id !== id);
  saveAndRender();
});


filterSelect.addEventListener("change", render);


function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeBtn.textContent = theme === "dark" ? "Light mode" : "Dark mode";
}

let savedTheme = null;
try { savedTheme = localStorage.getItem("theme"); } catch (e) {}
applyTheme(savedTheme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

themeBtn.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch (e) {}
});

render();