async function verificaCodice() {
  const codice = document.getElementById("codice-input").value.trim().toUpperCase();
  const erroreEl = document.getElementById("errore-codice");

  if (!codice) {
    erroreEl.textContent = "❌ Inserisci un codice";
    erroreEl.style.display = "block";
    return;
  }

  try {
    const url = `https://script.google.com/macros/s/AKfycbxEj4X_zN-FNqycMA8gxuJ5pOPaLhe0qrDErTYjokGZg8sSps0dj-5n_W7SRevGQQ/exec?codice=${codice}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.success) {
      // ✅ Codice valido: mostra l’app
      document.getElementById("login-container").style.display = "none";
      document.getElementById("app-container").style.display = "block";

      // (Opzionale) Salva il codice per evitare login al prossimo avvio
      localStorage.setItem("codiceAutenticato", codice);

    } else {
      erroreEl.textContent = "❌ Codice non valido";
      erroreEl.style.display = "block";
    }

  } catch (error) {
    console.error("Errore fetch codice:", error);
    erroreEl.textContent = "❌ Errore di connessione";
    erroreEl.style.display = "block";
  }
}

// 🔄 Se hai già fatto il login in passato
window.addEventListener("DOMContentLoaded", () => {
  const codiceSalvato = localStorage.getItem("codiceAutenticato");
  if (codiceSalvato) {
    document.getElementById("login-container").style.display = "none";
    document.getElementById("app-container").style.display = "block";
  }
});