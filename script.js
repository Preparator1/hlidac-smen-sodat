const API_BASE_URL = "https://api.sodat-notifications.workers.dev";

const subscribeTab = document.getElementById("tab-subscribe");
const unsubscribeTab = document.getElementById("tab-unsubscribe");
const subscribePanel = document.getElementById("panel-subscribe");
const unsubscribePanel = document.getElementById("panel-unsubscribe");

function switchTab(showUnsubscribe) {
  subscribeTab.classList.toggle("active", !showUnsubscribe);
  unsubscribeTab.classList.toggle("active", showUnsubscribe);
  subscribeTab.setAttribute("aria-selected", String(!showUnsubscribe));
  unsubscribeTab.setAttribute("aria-selected", String(showUnsubscribe));
  subscribePanel.hidden = showUnsubscribe;
  unsubscribePanel.hidden = !showUnsubscribe;
}

subscribeTab.addEventListener("click", () => switchTab(false));
unsubscribeTab.addEventListener("click", () => switchTab(true));

function checkedValues(containerId) {
  return [...document.querySelectorAll(`#${containerId} input:checked`)].map(input => input.value);
}

function optionalNumber(id) {
  const raw = document.getElementById(id).value.trim();
  return raw === "" ? null : Number(raw);
}

function feedback(id, text, kind = "error") {
  const el = document.getElementById(id);
  el.hidden = false;
  el.className = `feedback ${kind}`;
  el.textContent = text;
}

async function postToApi(path, payload) {
  if (!API_BASE_URL) 
    throw new Error("Formulář ještě není propojený s backendem.");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  let result = await response.json();

  if (!response.ok) 
    throw new Error(result.error || "Požadavek se nepodařilo odeslat. Zkus to znovu.");
  
  return result;
}

const subscribeForm = document.getElementById("subscribe-form");
subscribeForm.addEventListener("submit", async event => {
  event.preventDefault();

  const workCategories = checkedValues("work-categories");
  const days = checkedValues("days");
  const shifts = checkedValues("shifts");

  if (!workCategories.length || !days.length || !shifts.length) {
    feedback("subscribe-feedback", "Vyber alespoň jeden typ práce, den a část dne.");
    return;
  }

  const payload = {
    email: document.getElementById("email").value.trim().toLowerCase(),
    work_category: workCategories,
    location: document.getElementById("location").value,
    day_of_week: days,
    shift_type: shifts,
    age: document.getElementById("age").value,
    minimum_salary: optionalNumber("salary"),
    max_shift_duration: optionalNumber("duration"),
    criminal_record_jobs: document.getElementById("criminal").value,
    gender_preference: document.getElementById("gender").value,
    standby_shift: document.getElementById("standby").checked ? "yes" : "no"
  };

  const button = document.getElementById("subscribe-submit");
  button.disabled = true;

  try {
    await postToApi("/subscribe", payload);
    feedback("subscribe-feedback", "Hotovo! Zkontroluj svoji schránku s novými nabídkami.", "success");
    subscribeForm.reset();
  } catch (err) {
    feedback("subscribe-feedback", err.message);
  } finally {
    button.disabled = false;
  }

});

const unsubscribeForm = document.getElementById("unsubscribe-form");
unsubscribeForm.addEventListener("submit", async event => {
  event.preventDefault();

  const button = document.getElementById("unsubscribe-submit");
  button.disabled = true;

  try {
    await postToApi("/unsubscribe", { email: document.getElementById("unsubscribe-email").value.trim().toLowerCase() });
    feedback("unsubscribe-feedback", "Pokud je tato adresa přihlášená, přijde na ni odhlašovací odkaz.", "success");
    unsubscribeForm.reset();
  } catch (err) {
    feedback("unsubscribe-feedback", err.message);
  } finally {
    button.disabled = false;
  }

});
