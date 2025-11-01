const URL_VERIFICA = "https://script.google.com/macros/s/AKfycbxjj7DT23-DCj5YY4ZtWGEPJI6g0OxhG84KQvKPHgNjo5Wyga_0_vc-VtdjraqXerDU/exec";

function verificaCodice() {
  const codice = document.getElementById("codice-input").value.trim().toUpperCase();
  if (!codice) return;

  fetch(`${URL_VERIFICA}?codice=${codice}`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Codice corretto → salva in localStorage e mostra l'app
        localStorage.setItem("codiceAutorizzato", codice);
        document.getElementById("login-container").style.display = "none";
        document.getElementById("app-container").style.display = "block";
        document.getElementById("filtro-container").style.display = "block";
        caricaDati(); // ← funzione già presente nel tuo script.js
      } else {
        document.getElementById("errore-login").innerText = "❌ Codice non valido";
        document.getElementById("errore-login").style.display = "block";
      }
    })
    .catch(() => {
      document.getElementById("errore-login").innerText = "❌ Errore di connessione";
      document.getElementById("errore-login").style.display = "block";
    });
}

// Al caricamento della pagina, controlla se il codice è già salvato
window.addEventListener("DOMContentLoaded", () => {
  const codiceSalvato = localStorage.getItem("codiceAutorizzato");
  if (codiceSalvato) {
    document.getElementById("login-container").style.display = "none";
    document.getElementById("app-container").style.display = "block";
    document.getElementById("filtro-container").style.display = "block";
    caricaDati();
  } else {
    document.getElementById("login-container").style.display = "flex";
    document.getElementById("app-container").style.display = "none";
    document.getElementById("filtro-container").style.display = "none";
  }
});