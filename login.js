const URL_VERIFICA = "https://script.google.com/macros/s/AKfycbxEj4X_zN-FNqycMA8gxuJ5pOPaLhe0qrDErTYjokGZg8sSps0dj-5n_W7SRevGQQ/exec";

function verificaCodice() {
  const codice = document.getElementById("codice-input").value.trim().toUpperCase();
  if (!codice) return;

  fetch(`${URL_VERIFICA}?codice=${codice}`)
    .then(r => r.json())
    .then(dati => {
      if (dati.success) {
        localStorage.setItem("codiceAutorizzato", codice);
        document.getElementById("login-container").style.display = "none";
        document.getElementById("app-container").style.display = "block";
        document.getElementById("filtro-container").style.display = "block";
        caricaDati(); // se presente
      } else {
        document.getElementById("errore-codice").style.display = "block";
      }
    })
    .catch(err => {
      console.error("Errore fetch codice:", err);
      document.getElementById("errore-codice").style.display = "block";
    });
}

// Controlla se codice già autorizzato
window.addEventListener("DOMContentLoaded", () => {
  const codiceSalvato = localStorage.getItem("codiceAutorizzato");
  if (codiceSalvato) {
    document.getElementById("login-container").style.display = "none";
    document.getElementById("app-container").style.display = "block";
    document.getElementById("filtro-container").style.display = "block";
    caricaDati(); // carica app normalmente
  } else {
    document.getElementById("login-container").style.display = "flex";
    document.getElementById("app-container").style.display = "none";
    document.getElementById("filtro-container").style.display = "none";
  }
});

