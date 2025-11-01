// URL Google Apps Script per verifica codice cliente
const URL_VERIFICA = "https://script.google.com/macros/s/AKfycbxjj7DT23-DCj5YY4ZtWGEPJI6g0OxhG84KQvKPHgNjo5Wyga_0_vc-VtdjraqXerDU/exec";

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

  // Disabilita il pulsante durante la verifica
  const bottone = document.querySelector("#login-container button");
  bottone.disabled = true;
  bottone.textContent = "Verifica...";

  fetch(`${URL_VERIFICA}?codice=${codice}`)
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
        // ❌ Codice errato
        erroreBox.textContent = "❌ Codice non valido";
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