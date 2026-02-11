const addBtn = document.getElementById("addActivity");
const list = document.getElementById("activityList");
const totalDisplay = document.getElementById("total");
const filterCategory = document.getElementById("filterCategory");

let activities = JSON.parse(localStorage.getItem("activities")) || [];

const emissionFactors = {
  transport: 0.21, // per km
  food: 2.5, // per meal
  energy: 0.5, // per kWh
};

function saveActivities() {
  localStorage.setItem("activities", JSON.stringify(activities));
}

function calculateCO2(category, amount) {
  return amount * emissionFactors[category];
}

function renderActivities() {
  list.innerHTML = "";
  let total = 0;

  const filter = filterCategory.value;

  const filtered =
    filter === "all"
      ? activities
      : activities.filter((a) => a.category === filter);

  filtered.forEach((activity) => {
    total += activity.co2;

    const li = document.createElement("li");
    li.textContent = `${activity.category} - ${
      activity.name
    } : ${activity.co2.toFixed(2)} kg CO₂`;
    list.appendChild(li);
  });

  totalDisplay.textContent = total.toFixed(2);
  updateChart();
}

addBtn.addEventListener("click", () => {
  const category = document.getElementById("category").value;
  const name = document.getElementById("activity").value;
  const amount = parseFloat(document.getElementById("amount").value);

  if (!name || !amount) return;

  const co2 = calculateCO2(category, amount);

  activities.push({ category, name, amount, co2 });

  saveActivities();
  renderActivities();
});

filterCategory.addEventListener("change", renderActivities);

function updateChart() {
  const totals = {
    transport: 0,
    food: 0,
    energy: 0,
  };

  activities.forEach((a) => {
    totals[a.category] += a.co2;
  });

  chart.data.datasets[0].data = [totals.transport, totals.food, totals.energy];

  chart.update();
}

const ctx = document.getElementById("chart");

const chart = new Chart(ctx, {
  type: "pie",
  data: {
    labels: ["Transport", "Food", "Energy"],
    datasets: [
      {
        data: [0, 0, 0],
      },
    ],
  },
});

renderActivities();
