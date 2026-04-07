const calendar = document.getElementById("calendar");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const titleInput = document.getElementById("title");
const saveBtn = document.getElementById("save");
const cancelBtn = document.getElementById("cancel");
const monthLabel = document.getElementById("monthLabel");

let currentMonth = 4;
let currentYear = 2026;

let selectedDay = null;
let selectedColor = "#E8A0B8";

let events = JSON.parse(localStorage.getItem("events")) || {};

function getKey() {
  return `${currentYear}-${currentMonth}`;
}

function closeModal() {
  modal.classList.add("hidden");
  titleInput.value = "";
}

function renderCalendar() {
  calendar.innerHTML = "";
  monthLabel.innerText = `${currentYear}年${currentMonth}月`;

  const firstDay = (new Date(currentYear, currentMonth - 1, 1).getDay() + 6) % 7;
  const lastDate = new Date(currentYear, currentMonth, 0).getDate();

  const key = getKey();
  const monthEvents = events[key] || {};

  for (let i = 0; i < firstDay; i++) {
    calendar.appendChild(document.createElement("div"));
  }

  for (let i = 1; i <= lastDate; i++) {
    const day = document.createElement("div");
    day.className = "day";
    day.innerHTML = `<div>${i}</div>`;

    day.ondblclick = () => {
      selectedDay = i;
      modal.classList.remove("hidden");
    };

    let tap = 0;
    day.addEventListener("touchend", () => {
      tap++;
      setTimeout(() => tap = 0, 300);
      if (tap === 2) {
        selectedDay = i;
        modal.classList.remove("hidden");
      }
    });

    if (monthEvents[i]) {
      monthEvents[i].forEach((e, index) => {
        const eventDiv = document.createElement("div");
        eventDiv.className = "event";
        eventDiv.style.background = e.color;
        eventDiv.innerText = e.title;

        eventDiv.onclick = (ev) => {
          ev.stopPropagation();
          if (!confirm("削除する？")) return;

          monthEvents[i].splice(index, 1);
          events[key] = monthEvents;
          localStorage.setItem("events", JSON.stringify(events));
          renderCalendar();
        };

        day.appendChild(eventDiv);
      });
    }

    calendar.appendChild(day);
  }
}

// 色選択
document.querySelectorAll(".color").forEach(c => {
  c.onclick = () => {
    document.querySelectorAll(".color").forEach(el =>
      el.classList.remove("selected")
    );
    c.classList.add("selected");
    selectedColor = c.style.background;
  };
});

// 保存
saveBtn.onclick = () => {
  if (!selectedDay) return;

  const key = getKey();

  if (!events[key]) events[key] = {};
  if (!events[key][selectedDay]) events[key][selectedDay] = [];

  events[key][selectedDay].push({
    title: titleInput.value,
    color: selectedColor
  });

  localStorage.setItem("events", JSON.stringify(events));

  closeModal();
  renderCalendar();
};

// 戻るボタン
cancelBtn.onclick = closeModal;

// モーダル外クリックで閉じる
modal.onclick = (e) => {
  if (e.target === modal) closeModal();
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