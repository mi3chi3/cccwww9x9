const calendar = document.getElementById("calendar");
const modal = document.getElementById("modal");
const saveBtn = document.getElementById("save");
const cancelBtn = document.getElementById("cancel");
const trashSelect = document.getElementById("trashSelect");
const monthLabel = document.getElementById("monthLabel");

let currentMonth = new Date().getMonth() + 1;
let currentYear = new Date().getFullYear();

let selectedDay = null;
let selectedColor = "#E8A0B8"; // ←復活

let events = JSON.parse(localStorage.getItem("events")) || {};
let trashOverrides = JSON.parse(localStorage.getItem("trash")) || {};

function getKey() {
  return `${currentYear}-${currentMonth}`;
}

// 👇 色選択（重要）
document.querySelectorAll(".color").forEach(el => {
  el.addEventListener("click", () => {
    document.querySelectorAll(".color").forEach(c => c.classList.remove("selected"));
    el.classList.add("selected");
    selectedColor = el.dataset.color;
  });
});

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
      t.textContent = trash;
      day.appendChild(t);
    }

    // イベント表示
    if (events[key]?.[i]) {
      events[key][i].forEach(e => {
        const ev = document.createElement("div");
        ev.className = "event";
        ev.style.background = e.color;
        ev.textContent = e.title;
        day.appendChild(ev);
      });
    }

    // ダブルタップ対応
    let lastTap = 0;
    day.addEventListener("touchend", () => {
      const now = Date.now();
      if (now - lastTap < 300) {
        selectedDay = i;
        modal.classList.remove("hidden");
      }
      lastTap = now;
    });

    day.ondblclick = () => {
      selectedDay = i;
      modal.classList.remove("hidden");
    };

    calendar.appendChild(day);
  }
}

// 保存
saveBtn.onclick = () => {
  if (!selectedDay) return;

  const key = getKey();

  if (!events[key]) events[key] = {};
  if (!events[key][selectedDay]) events[key][selectedDay] = [];

  events[key][selectedDay].push({
    title: "予定",
    color: selectedColor
  });

  const tKey = `${key}-${selectedDay}`;
  if (trashSelect.value === "") {
    delete trashOverrides[tKey];
  } else {
    trashOverrides[tKey] = trashSelect.value;
  }

  localStorage.setItem("events", JSON.stringify(events));
  localStorage.setItem("trash", JSON.stringify(trashOverrides));

  modal.classList.add("hidden");
  renderCalendar();
};

cancelBtn.onclick = () => modal.classList.add("hidden");

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