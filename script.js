const calendar = document.getElementById("calendar");
const modal = document.getElementById("modal");
const titleInput = document.getElementById("title");
const saveBtn = document.getElementById("save");
const cancelBtn = document.getElementById("cancel");
const trashSelect = document.getElementById("trashSelect");
const monthLabel = document.getElementById("monthLabel");

let currentMonth = new Date().getMonth() + 1;
let currentYear = new Date().getFullYear();

let selectedDay = null;

let trashOverrides = JSON.parse(localStorage.getItem("trash")) || {};

function getKey() {
  return `${currentYear}-${currentMonth}`;
}

// ゴミルール
function getTrash(day, weekday) {
  if (weekday === 2 || weekday === 4) return "🔥";
  if (weekday === 3) {
    const w = Math.ceil(day / 7);
    if (w === 1 || w === 3) return "🍾🥫";
    if (w === 2 || w === 4) return "🔋🪥";
    return "♻️";
  }
  if (weekday === 5) {
    const w = Math.ceil(day / 7);
    if (w === 2) return "👔";
    if (w === 4) return "📦";
  }
  return "";
}

function renderCalendar() {
  calendar.innerHTML = "";
  monthLabel.innerText = `${currentYear}年${currentMonth}月`;

  const firstDay = (new Date(currentYear, currentMonth - 1, 1).getDay() + 6) % 7;
  const lastDate = new Date(currentYear, currentMonth, 0).getDate();
  const today = new Date();
  const key = getKey();

  for (let i = 0; i < firstDay; i++) {
    calendar.appendChild(document.createElement("div"));
  }

  for (let i = 1; i <= lastDate; i++) {
    const day = document.createElement("div");
    day.className = "day";

    const dateEl = document.createElement("div");
    dateEl.className = "date";
    dateEl.innerText = i;

    // 今日判定
    if (
      i === today.getDate() &&
      currentMonth === today.getMonth() + 1 &&
      currentYear === today.getFullYear()
    ) {
      day.classList.add("today");
    }

    day.appendChild(dateEl);

    const date = new Date(currentYear, currentMonth - 1, i);
    const weekday = date.getDay();

    const override = trashOverrides[`${key}-${i}`];
    const trash = override !== undefined ? override : getTrash(i, weekday);

    if (trash) {
      const t = document.createElement("div");
      t.className = "trash";
      t.innerText = trash;
      day.appendChild(t);
    }

    day.ondblclick = () => {
      selectedDay = i;
      trashSelect.value = override || "";
      modal.classList.remove("hidden");
    };

    calendar.appendChild(day);
  }
}

// 保存
saveBtn.onclick = () => {
  const key = getKey();
  const tKey = `${key}-${selectedDay}`;

  if (trashSelect.value === "") {
    delete trashOverrides[tKey];
  } else {
    trashOverrides[tKey] = trashSelect.value;
  }

  localStorage.setItem("trash", JSON.stringify(trashOverrides));

  modal.classList.add("hidden");
  renderCalendar();
};

cancelBtn.onclick = () => modal.classList.add("hidden");

// モーダル外クリック
modal.onclick = (e) => {
  if (e.target === modal) modal.classList.add("hidden");
};

// 月移動
document.getElementById("prev").onclick = () => {
  currentMonth--;
  if (currentMonth < 1) {
    currentMonth = 12;
    currentYear--;
  }
  renderCalendar();
};

document.getElementById("next").onclick = () => {
  currentMonth++;
  if (currentMonth > 12) {
    currentMonth = 1;
    currentYear++;
  }
  renderCalendar();
};

renderCalendar();