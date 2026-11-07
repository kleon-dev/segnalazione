
const EMAILJS_PUBLIC_KEY = "WOINqGL6nqkSRuonh";
const EMAILJS_SERVICE_ID = "service_27erxva";
const TEMPLATE_REP1 = "template_yndok7t";

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
    setStatus("Invio della segnalazione in corso...");

    try {
        await emailjs.send(
            EMAILJS_SERVICE_ID,
            TEMPLATE_REP1,
            templateParams
        );

        setStatus("Segnalazione inviata correttamente!", true);

        form.reset();

        if (charCount) {
            charCount.textContent = "0";
        }

    } catch (error) {
        console.error("Errore EmailJS:", error);
        setStatus("Invio non riuscito. Controlla la configurazione e riprova.");

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Invia segnalazione";
    }
});
