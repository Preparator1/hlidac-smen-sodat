const API_BASE_URL = "https://api.sodat-notifications.workers.dev";

const params = new URLSearchParams(window.location.search);
const token = params.get("token");

const button = document.getElementById("confirm-button");
const feedback = document.getElementById("feedback");

function showFeedback(message, kind) {
    feedback.hidden = false;
    feedback.className = `feedback ${kind}`;
    feedback.textContent = message;
}

if (!token) {
    button.disabled = true;
    feedback.textContent = "Neplatný potvrzovací odkaz.";
}

button.addEventListener("click", async () => {
    button.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/confirm-subscribe`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ token })
        });

        if (!response.ok) {
            throw new Error("Potvrzení se nepodařilo.");
        }

        showFeedback("Žádost o potvrzení byla přijata. Odběr bude aktivován po jejím zpracování.", "success");
    } catch (error) {
        showFeedback("Nepodařilo se spojit se serverem. Zkus to prosím znovu.", "error");
        button.disabled = false;
    }
});