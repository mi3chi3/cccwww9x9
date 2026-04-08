const calendar = document.getElementById("calendar");
const modal = document.getElementById("modal");
const titleInput = document.getElementById("title");
const saveBtn = document.getElementById("save");
const cancelBtn = document.getElementById("cancel");
const trashSelect = document.getElementById("trashSelect");
const monthLabel = document.getElementById("monthLabel");

let db = window.db;
let fDoc = window.fDoc;
let fSet = window.fSet;
let fGet = window.fGet;

let currentMonth = new Date().getMonth() + 1;
let currentYear = new Date().getFullYear();

let selectedDay = null;
let selectedColor = "#E8A0B8";

let events = {};
let trashOverrides = {};

function getKey() {
  return `${currentYear}-${currentMonth}`;
}

document.querySelectorAll(".color").forEach(el => {
  el.onclick = () => {
    document.querySelectorAll(".color").forEach(c => c.classList.remove("selected"));
    el.classList.add("selected");
    selectedColor = el.dataset.color;
  };
});

function getTrash(day, weekday) {
  const week = Math.ceil(day / 7);

  if (weekday === 1) return "♻️";
  if (weekday === 2 || weekday === 4) return "🔥";

  if (weekday === 3) {
    if (week === 1 || week === 3) return "🍾🥫";
    if (week === 2 || week === 4) return "🔋🪥";
  }

  if (weekday === 5) {
    if (week === 2) return "👔";
    if (week === 4) return "📦";
  }

  return "";
}

async function loadData() {
  const ref = fDoc(db, "calendar", "shared");
  const snap = await fGet(ref);

  if (snap.exists()) {
    const data = snap.data();
    events = data.events || {};
    trashOverrides = data.trashOverrides || {};
  }
}

async function saveData() {
  await fSet(fDoc(db, "calendar", "shared"), {
    events,
    trashOverrides
  });
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

    if (events[key]?.[i]) {
      events[key][i].forEach((e, index) => {
        const ev = document.createElement("div");
        ev.className = "event";
        ev.style.background = e.color;
        ev.textContent = e.title;

        ev.onclick = async (event) => {
          event.stopPropagation();
          if (!confirm("削除する？")) return;

          events[key][i].splice(index, 1);
          await saveData();
          renderCalendar();
        };

        day.appendChild(ev);
      });
    }

    day.ondblclick = () => {
      selectedDay = i;
      modal.classList.remove("hidden");
    };

    calendar.appendChild(day);
  }
}

saveBtn.onclick = async () => {
  const key = getKey();
  const tKey = `${key}-${selectedDay}`;
  const title = titleInput.value.trim();

  if (title !== "") {
    if (!events[key]) events[key] = {};
    if (!events[key][selectedDay]) events[key][selectedDay] = [];

    events[key][selectedDay].push({
      title,
      color: selectedColor
    });
  }

  if (trashSelect.value === "") {
    delete trashOverrides[tKey];
  } else {
    trashOverrides[tKey] = trashSelect.value;
  }

  await saveData();
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

(async () => {
  await loadData();
  renderCalendar();
})();