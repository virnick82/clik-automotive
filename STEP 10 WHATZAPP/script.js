
const sheetId1 = "1YDZPzJmjANOxdzAhB9Z8M26gbwiu2ap2iqNZGq4qtIU"; // Foglio1: dati auto
const sheetId2 = "1YDZPzJmjANOxdzAhB9Z8M26gbwiu2ap2iqNZGq4qtIU"; // Foglio2: vetrina/news

const datiUrl = `https://opensheet.elk.sh/${sheetId1}/Foglio1`;
const vetrinaUrl = `https://opensheet.elk.sh/${sheetId2}/Foglio2`;

let datiAuto = [];

async function caricaDati() {
  try {
    console.log("Caricamento dati...");
    const [resAuto, resVetrina] = await Promise.all([
      fetch(datiUrl),
      fetch(vetrinaUrl)
    ]);
    datiAuto = await resAuto.json();
    const datiVetrina = await resVetrina.json();

    mostraMarche(); // mostra la PWA centrale
    mostraVetrina(datiVetrina);
    mostraNews(datiVetrina);
    document.getElementById("app-container").style.display = "block";
  } catch (e) {
    console.error("Errore caricamento dati:", e);
  }
}

// ----------------------------- PWA CENTRALE -----------------------------

function mostraMarche() {
  const container = document.getElementById("marche-container");
  container.innerHTML = "";
  document.getElementById("modelli-container").style.display = "none";
  document.getElementById("anni-container").style.display = "none";
  document.getElementById("risultati-container").innerHTML = "";
  document.getElementById("marche-container").style.display = "flex";

  const mapMarche = {};
  datiAuto.forEach(r => {
    const marca = r["Marca"];
    const logo = r["Logo"];
    if (marca && logo && !mapMarche[marca]) {
      mapMarche[marca] = logo;
    }
  });

  Object.entries(mapMarche).forEach(([marca, logo]) => {
    const btn = document.createElement("button");
    btn.className = "marca-btn";
    btn.onclick = () => mostraModelli(marca);

    const img = document.createElement("img");
    img.src = logo;
    img.alt = marca;
    img.className = "logo-marca";

    const span = document.createElement("span");
    span.textContent = marca;

    btn.appendChild(img);
    btn.appendChild(span);
    container.appendChild(btn);
  });
}

function mostraModelli(marca) {
  document.getElementById("marche-container").style.display = "none";
  document.getElementById("modelli-container").style.display = "flex";
  document.getElementById("anni-container").style.display = "none";
  document.getElementById("risultati-container").innerHTML = "";

  const container = document.getElementById("modelli-container");
  container.innerHTML = "";

  const backBtn = document.createElement("button");
  backBtn.textContent = "⬅️ Torna alle Marche";
  backBtn.className = "btn-rettangolare";
  backBtn.onclick = mostraMarche;
  container.appendChild(backBtn);

  const modelli = datiAuto.filter(r => r["Marca"] === marca);
  const modSet = new Set();
  modelli.forEach(r => {
    const modello = r["Modello"];
    if (modello && !modSet.has(modello)) {
      modSet.add(modello);
      const btn = document.createElement("button");
      btn.textContent = modello;
      btn.className = "btn-rettangolare";
      btn.onclick = () => mostraAnni(marca, modello);
      container.appendChild(btn);
    }
  });
}

function mostraAnni(marca, modello) {
  document.getElementById("modelli-container").style.display = "none";
  document.getElementById("anni-container").style.display = "flex";
  document.getElementById("risultati-container").innerHTML = "";

  const container = document.getElementById("anni-container");
  container.innerHTML = "";

  const backBtn = document.createElement("button");
  backBtn.textContent = "⬅️ Indietro";
  backBtn.className = "btn-rettangolare";
  backBtn.onclick = () => mostraModelli(marca);
  container.appendChild(backBtn);

  const anni = datiAuto
    .filter(r => r["Marca"] === marca && r["Modello"] === modello)
    .map(r => ({ inizio: r["Anno Inizio"], fine: r["Anno Fine"] }));

  const anniUnici = new Set();
  anni.forEach(range => {
    const start = parseInt(range.inizio);
    const end = parseInt(range.fine);
    for (let a = start; a <= end; a++) {
      anniUnici.add(a);
    }
  });

  const anniOrdinati = Array.from(anniUnici).sort((a, b) => a - b);
  anniOrdinati.forEach(anno => {
    const btn = document.createElement("button");
    btn.textContent = anno;
    btn.className = "btn-rettangolare";
    btn.onclick = () => mostraRisultati(marca, modello, anno);
    container.appendChild(btn);
  });
}

function mostraRisultati(marca, modello, anno) {
  document.getElementById("anni-container").style.display = "none";
  const container = document.getElementById("risultati-container");
  container.style.display = "block";
  container.innerHTML = "";

  container.scrollTo({ top: 0, behavior: 'instant' });

  const backBtn = document.createElement("button");
  backBtn.id = "btn-indietro-risultato";
  backBtn.textContent = "⬅️ Torna alla Scelta Anno";
  backBtn.onclick = () => mostraAnni(marca, modello);
  container.appendChild(backBtn);

  const risultati = datiAuto.filter(r =>
    r["Marca"] === marca &&
    r["Modello"] === modello &&
    parseInt(r["Anno Inizio"]) <= anno &&
    parseInt(r["Anno Fine"]) >= anno
  );

  risultati.forEach(r => {
    const div = document.createElement("div");
    div.style = "background: #222; margin:8px; padding:10px; border-radius:8px; text-align: left;";
    // Aggiungi qui **tutte le colonne** che vuoi visualizzare
   div.innerHTML = `
  <div style="color:red; font-weight:bold;">${r.Marca} ${r.Modello}</div>
  <div style="margin-top:6px;"><span class="label-rossa">Anno:</span> ${r["Anno Inizio"]} - ${r["Anno Fine"]}<br>
  <div style="margin-top:6px;"><span class="label-rossa">Tipo Chiave:</span> ${r["Tipo Chiave"]}<br>
  <div style="margin-top:6px;"><span class="label-rossa">Transponder:</span> ${r.Transponder}<br>
  <div style="margin-top:6px;"><span class="label-rossa">Transponder Clonabile:</span> ${r["Transponder Clonabile"]}<br>
  <div style="margin-top:6px;"><span class="label-rossa">Transponder Programmabile Con Diagnostico:</span> ${r["Transponder Programmabile Con Diagnostico"]}<br>
  <div style="margin-top:6px;"><span class="label-rossa">Radiocomando Programmabile Con Diagnostico:</span> ${r["Radiocomando Programmabile Con Diagnostico"]}<br>
  <div style="margin-top:6px;"><span class="label-rossa">Pin Rilevabile:</span> ${r["Pin Rilevabile"]}<br>
  <div style="margin-top:6px;"><span class="label-rossa">Pin Necessario Per La Programmazione:</span> ${r["Pin Necessario Per La Programmazione"]}<br>
  <div style="margin-top:6px;"><span class="label-rossa">Metodo di Programmazione:</span> ${r["Metodo di Programmazione"]}<br>
  <div style="margin-top:6px;"><span class="label-rossa">Richiesta Precodifica:</span> ${r["Richiesta Precodifica"]}<br>
  <div style="margin-top:6px;"><span class="label-rossa">Situazione Tutte Chiavi Perse:</span> ${r["Situazione Tutte Chiavi Perse"]}<br>
  <div style="margin-top:6px;"><span class="label-rossa">Scheda Xhorse da Usare:</span> ${r["Scheda Xhorse da Usare"]}<br>
  <div style="margin-top:6px;"><span class="label-rossa">Radiocomando Xhorse da Usare:</span> ${r["Radiocomando Xhorse da Usare"]}<br>
  <div style="margin-top:6px;"><span class="label-rossa">Note e Suggerimenti:</span> ${r["Note e Suggerimenti"] || ""}
`;
    container.appendChild(div);
  });
}
// --------------------------- VETRINA + NEWS -----------------------------


function mostraVetrina(dati) {
  const cont = document.getElementById("vetrina-container");
  cont.innerHTML = "";

  const slides = dati.filter(r => r.Tipo === "Vetrina");
  if (slides.length === 0) return;

  let current = 0;

  const slideWrapper = document.createElement("div");
  slideWrapper.className = "vetrina-slide fade";  // 👈 aggiunto "fade"
  cont.appendChild(slideWrapper);

  function aggiornaSlide() {
    slideWrapper.classList.remove("fade");
    void slideWrapper.offsetWidth; // 🪄 forza reflow per riattivare animazione
    slideWrapper.classList.add("fade");

    const slide = slides[current];
    slideWrapper.innerHTML = "";

    const divContenuto = document.createElement("div");
    divContenuto.className = "vetrina-slide-content";

    const testoBox = document.createElement("div");
    testoBox.className = "vetrina-text";
    testoBox.innerHTML = `
      <div class="vetrina-titolo">${slide.Titolo}</div>
      <div class="vetrina-testo">${slide.Testo}</div>
    `;

    const img = document.createElement("img");
    img.src = slide["Immagine URL"];
    img.alt = slide.Titolo;
    img.className = "vetrina-img";

    if (slide.Link) {
      const link = document.createElement("a");
      link.href = slide.Link;
      link.target = "_blank";
      link.appendChild(img);
      divContenuto.appendChild(link);
    } else {
      divContenuto.appendChild(img);
    }

    divContenuto.prepend(testoBox);
    slideWrapper.appendChild(divContenuto);

    current = (current + 1) % slides.length;
  }

  aggiornaSlide();
  setInterval(aggiornaSlide, 8000);
}


function mostraNews(dati) {
  const cont = document.getElementById("news-container");
  const news = dati.filter(r => r.Tipo === "News");
  const testo = news.map(n => n.Titolo).join(" • ");

  cont.innerHTML = `
    <span class="news-label">&nbsp;&nbsp;📰 News:</span>
    <div class="news-marquee">${testo}</div>
  `;
}

window.onload = caricaDati;