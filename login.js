// ✅ URL unico della tua Web App Google Apps Script
// (stesso usato per il login e per la scadenza)
const GAS_URL = "https://script.google.com/macros/s/AKfycbybAoagGft7hu3pxf2ZDgFZ2gBVHfwY49p8qUN8oU3yv9ciuQq-jva0EXcnv_3NawZP/exec";

// ================================================================
// FUNZIONE DI VERIFICA CODICE CLIENTE
// ================================================================
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

  // 👉 Invio richiesta al GAS
  fetch(`${GAS_URL}?codice=${codice}&device=${deviceId}`)
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

        // 🔹 Riabilita i click dopo l’accesso
        document.body.classList.remove("login-attivo");

        // 🔹 Mostra il menu in alto a destra
        document.getElementById("menu-wrapper").style.display = "block";

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

// ================================================================
// AUTO LOGIN SE CODICE GIÀ SALVATO
// ================================================================
window.addEventListener("DOMContentLoaded", () => {
  const codiceSalvato = localStorage.getItem("codiceAutorizzato");

  if (codiceSalvato) {
    // Accesso automatico
    document.getElementById("login-container").style.display = "none";
    document.getElementById("app-container").style.display = "block";
    document.getElementById("filtro-container").style.display = "block";
    document.getElementById("vetrina-container").style.display = "block";
    document.getElementById("news-container").style.display = "block";

    // 🔹 Mostra il menu a tendina anche in caso di auto-login
    document.getElementById("menu-wrapper").style.display = "block";

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

    // 🔹 Disabilita tutti i click sotto il login
    document.body.classList.add("login-attivo");
  }
});

// ================================================================
// MENU A TENDINA (Preferiti / Scadenza / Logout)
// ================================================================

// 🔹 Funzione Logout
function logout() {
  localStorage.removeItem("codiceAutorizzato");
  location.reload();
}

// 🔹 Gestione apertura/chiusura menu
const menuWrapper = document.getElementById("menu-wrapper");
const menuToggle = document.getElementById("menu-toggle");

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    menuWrapper.classList.toggle("active");
  });

  // Chiude il menu cliccando fuori
  document.addEventListener("click", (e) => {
    if (!menuWrapper.contains(e.target)) {
      menuWrapper.classList.remove("active");
    }
  });
}

// 🔹 Mostra la scadenza abbonamento
function mostraScadenza() {
  const codice = localStorage.getItem("codiceAutorizzato");
  if (!codice) return alert("⚠️ Effettua prima il login.");

  fetch(`${GAS_URL}?tipo=scadenza&codice=${encodeURIComponent(codice)}`)
    .then(res => res.json())
    .then(data => {
      if (data.success && data.scadenza) {
        const dataPulita = new Date(data.scadenza).toLocaleDateString("it-IT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric"
});
alert(`📅 Il tuo abbonamento scade il: ${dataPulita}`);


      } else {
        alert("⚠️ Nessuna informazione di scadenza trovata.");
      }
    })
    .catch((err) => {
      console.error("Errore scadenza:", err);
      alert("❌ Errore durante il controllo della scadenza.");
    });
}