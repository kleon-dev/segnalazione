
const EMAILJS_PUBLIC_KEY = "WOINqGL6nqkSRuonh";
const EMAILJS_SERVICE_ID = "service_27erxva";

const TEMPLATE_REP1 = "template_yndok7t";
const TEMPLATE_REP2 = "template_3yye4iw";
emailjs.init({
    publicKey: EMAILJS_PUBLIC_KEY
});

const form = document.getElementById("suggestion-form");
const submitButton = document.getElementById("submit-button");
const formStatus = document.getElementById("form-status");

const categoryInput = document.getElementById("category");
const priorityInput = document.getElementById("priority");
const messageInput = document.getElementById("message");
const replyEmailInput = document.getElementById("reply-email");
const privacyInput = document.getElementById("privacy");
const charCount = document.getElementById("char-count");

function setStatus(message, success = false) {
    formStatus.textContent = message;
    formStatus.style.color = success ? "#18794e" : "#b42318";
}
if (messageInput && charCount) {
    const updateCharCount = () => {
        charCount.textContent = messageInput.value.length;
    };

    messageInput.addEventListener("input", updateCharCount);
    updateCharCount();
}
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    if (!privacyInput.checked) {
        setStatus("Devi confermare l'informativa prima di inviare.");
        return;
    }

    const message = messageInput.value.trim();

    if (!message) {
        setStatus("Inserisci il testo della segnalazione.");
        messageInput.focus();
        return;
    }
    const templateParams = {
        category: categoryInput.value,
        priority: priorityInput.value,
        message: message,
        reply_email: replyEmailInput.value.trim() || "Non fornita",
        submitted_at: new Date().toLocaleString("it-IT", {
            dateStyle: "short",
            timeStyle: "short"
        })
    };

    submitButton.disabled = true;
    submitButton.textContent = "Invio in corso...";
    setStatus("Invio delle segnalazioni in corso...");

    try {
        const results = await Promise.allSettled([
            emailjs.send(
                EMAILJS_SERVICE_ID,
                TEMPLATE_REP1,
                templateParams
            ),
            emailjs.send(
                EMAILJS_SERVICE_ID,
                TEMPLATE_REP2,
                templateParams
            )
        ]);

        const firstSent = results[0].status === "fulfilled";
        const secondSent = results[1].status === "fulfilled";

        if (firstSent && secondSent) {
            setStatus("Segnalazione inviata a entrambi i rappresentanti.", true);
            form.reset();

            if (charCount) {
                charCount.textContent = "0";
            }
        } else if (firstSent || secondSent) {
            const sentTo = firstSent
                ? "il primo rappresentante"
                : "il secondo rappresentante";

            const failedFor = firstSent
                ? "il secondo rappresentante"
                : "il primo rappresentante";

            setStatus(
                `Email inviata a ${sentTo}, ma l'invio a ${failedFor} non è riuscito. Non reinviare subito: potresti duplicare la prima email.`
            );

            console.error("Risultati EmailJS:", results);
        } else {
            setStatus(
                "Invio non riuscito per entrambi i rappresentanti. Controlla la configurazione e riprova."
            );

            console.error("Errori EmailJS:", results);
        }
    } catch (error) {
        console.error("Errore durante l'invio:", error);
        setStatus("Si è verificato un errore imprevisto.");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Invia segnalazione";
    }
});
