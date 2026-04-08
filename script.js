const cal = document.getElementById("calendar");
const modal = document.getElementById("modal");
const titleInput = document.getElementById("title");

let db = window.db;
let fDoc = window.fDoc;
let fSet = window.fSet;
let fGet = window.fGet;

let month = new Date().getMonth()+1;
let year = new Date().getFullYear();

let selectedDay = null;
let color = "#E8A0B8";
let events = {};

function key(){ return `${year}-${month}` }

document.querySelectorAll(".color").forEach(c=>{
  c.onclick=()=>{
    document.querySelectorAll(".color").forEach(x=>x.classList.remove("selected"));
    c.classList.add("selected");
    color=c.getAttribute("data");
  }
});

async function load(){
  const snap = await fGet(fDoc(db,"calendar","shared"));
  if(snap.exists()){
    events = snap.data().events || {};
  }
}

async function save(){
  await fSet(fDoc(db,"calendar","shared"),{events});
}

function render(){
  cal.innerHTML="";
  document.getElementById("month").innerText=`${year}/${month}`;

  let first=(new Date(year,month-1,1).getDay()+6)%7;
  let last=new Date(year,month,0).getDate();
  let today=new Date();

  for(let i=0;i<first;i++) cal.appendChild(document.createElement("div"));

  for(let d=1;d<=last;d++){
    let div=document.createElement("div");
    div.className="day";
    div.innerText=d;

    if(d===today.getDate() && month===today.getMonth()+1) {
      div.classList.add("today");
    }

    if(events[key()]?.[d]){
      events[key()][d].forEach((e,i)=>{
        let ev=document.createElement("div");
        ev.className="event";
        ev.style.background=e.color;
        ev.innerText=e.title;

        ev.onclick=async (x)=>{
          x.stopPropagation();
          if(confirm("削除する？")){
            events[key()][d].splice(i,1);
            await save();
            render();
          }
        }

        div.appendChild(ev);
      });
    }

    div.ondblclick=()=>{
      selectedDay=d;
      modal.classList.remove("hidden");
    }

    cal.appendChild(div);
  }
}

document.getElementById("save").onclick=async ()=>{
  if(!selectedDay) return;

  if(!events[key()]) events[key()]={};
  if(!events[key()][selectedDay]) events[key()][selectedDay]=[];

  events[key()][selectedDay].push({
    title:titleInput.value,
    color
  });

  await save();
  modal.classList.add("hidden");
  render();
};

document.getElementById("close").onclick=()=>{
  modal.classList.add("hidden");
};

document.getElementById("prev").onclick=()=>{
  month--; if(month<1){month=12;year--;}
  render();
};

document.getElementById("next").onclick=()=>{
  month++; if(month>12){month=1;year++;}
  render();
};

(async ()=>{
  await load();
  render();
})();