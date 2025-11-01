// URL Google Apps Script per verifica codice cliente
const URL_VERIFICA = "https://script.google.com/macros/s/AKfycbybAoagGft7hu3pxf2ZDgFZ2gBVHfwY49p8qUN8oU3yv9ciuQq-jva0EXcnv_3NawZP/exec";

// Funzione di verifica codice
function verificaCodice() {
  const codiceInput = document.getElementById("codice-input");
  const codice = codiceInput.value.trim().toUpperCase();
  const erroreBox = document.getElementById("errore-login");

  if (!codice) {
    erroreBox.textContent = "⚠️ Inserisci un codice cliente";
    erroreBox.style.display = "block";
    return;
  }

  // 👉 CREA O RECUPERA L’ID UNIVOCO DEL DISPOSITIVO
  const deviceId = localStorage.getItem("deviceId") || crypto.randomUUID();
  localStorage.setItem("deviceId", deviceId);

  // Disabilita il pulsante durante la verifica
  const bottone = document.querySelector("#login-container button");
  bottone.disabled = true;
  bottone.textContent = "Verifica...";

  // 👉 AGGIUNGI IL DEVICE ID NELLA RICHIESTA
  fetch(`${URL_VERIFICA}?codice=${codice}&device=${deviceId}`)
    .then(response => response.json())
    .then(data => {
      bottone.disabled = false;
      bottone.textContent = "Accedi";

      if (data.success) {
        // ✅ Codice corretto
        localStorage.setItem("codiceAutorizzato", codice);

        // Nasconde il login e mostra l'app principale
        document.getElementById("login-container").style.display = "none";
        document.getElementById("app-container").style.display = "block";
        document.getElementById("filtro-container").style.display = "block";
        document.getElementById("vetrina-container").style.display = "block";
        document.getElementById("news-container").style.display = "block";

        // Carica i dati della PWA
        if (typeof caricaDati === "function") {
          caricaDati();
        } else {
          console.warn("⚠️ Funzione caricaDati() non trovata");
        }
      } else {
        // ❌ Codice errato o già usato su altro device
        erroreBox.textContent = data.message || "❌ Codice non valido";
        erroreBox.style.display = "block";
      }
    })
    .catch((err) => {
      console.error("Errore di connessione:", err);
      bottone.disabled = false;
      bottone.textContent = "Accedi";
      erroreBox.textContent = "❌ Errore di connessione";
      erroreBox.style.display = "block";
    });
}

// Al caricamento della pagina
window.addEventListener("DOMContentLoaded", () => {
  const codiceSalvato = localStorage.getItem("codiceAutorizzato");
  if (codiceSalvato) {
    // Accesso automatico
    document.getElementById("login-container").style.display = "none";
    document.getElementById("app-container").style.display = "block";
    document.getElementById("filtro-container").style.display = "block";
    document.getElementById("vetrina-container").style.display = "block";
    document.getElementById("news-container").style.display = "block";

    if (typeof caricaDati === "function") {
      caricaDati();
    }
  } else {
    // Mostra la schermata di login
    document.getElementById("login-container").style.display = "flex";
    document.getElementById("app-container").style.display = "none";
    document.getElementById("filtro-container").style.display = "none";
    document.getElementById("vetrina-container").style.display = "none";
    document.getElementById("news-container").style.display = "none";
  }
});

// Funzione logout
const logoutBtn = document.getElementById("logout-btn");

logoutBtn.addEventListener("click", () => {
  // 🔹 NON cancelliamo il deviceId, così resta lo stesso ID
  localStorage.removeItem("codiceAutorizzato");
  location.reload();
});

// Mostra il pulsante logout solo se loggato
window.addEventListener("DOMContentLoaded", () => {
  const codiceSalvato = localStorage.getItem("codiceAutorizzato");
  if (codiceSalvato) {
    logoutBtn.style.display = "block";
  } else {
    logoutBtn.style.display = "none";
  }
});