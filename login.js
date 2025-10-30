const URL_VERIFICA = "https://script.google.com/macros/library/d/1C5rqIzNC0v2g8vIWsU8i03IWTMo6R_EBzKSNsVrOpPOzDXtnprwJCpy6/9";

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
        caricaDati(); // carica i dati solo dopo login
      } else {
        document.getElementById("errore-codice").style.display = "block";
      }
    })
    .catch(err => {
      console.error("Errore verifica codice:", err);
      document.getElementById("errore-codice").style.display = "block";
    });
}

// 🔓 Al primo caricamento controlla se il codice è già stato salvato nel localStorage
window.addEventListener("DOMContentLoaded", () => {
  const codiceSalvato = localStorage.getItem("codiceAutorizzato");
  if (codiceSalvato) {
    document.getElementById("login-container").style.display = "none";
    document.getElementById("app-container").style.display = "block";
    caricaDati();
  } else {
    document.getElementById("login-container").style.display = "block";
    document.getElementById("app-container").style.display = "none";
  }
});