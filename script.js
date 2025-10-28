const sheetId1 = "1YDZPzJmjANOxdzAhB9Z8M26gbwiu2ap2iqNZGq4qtIU"; // Foglio1: dati auto
const sheetId2 = "1YDZPzJmjANOxdzAhB9Z8M26gbwiu2ap2iqNZGq4qtIU"; // Foglio2: vetrina/news

const datiUrl = `https://opensheet.elk.sh/${sheetId1}/Foglio1`;
const vetrinaUrl = `https://opensheet.elk.sh/${sheetId2}/Foglio2`;

let datiAuto = [];
let filtroTipoChiave = "tutte"; // 🔹 nuovo filtro globale

let filtroRadiocomando = "tutti";

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

    // 🔴 Attiva visivamente i filtri predefiniti
    document.querySelector(`.filtro-btn.tutte`)?.classList.add("attivo");
    document.querySelector(`.filtro-radio-btn.tutti`)?.classList.add("attivo");

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
  fadeTo("marche-container");  document.getElementById("vetrina-container").style.display = "block";
  document.getElementById("filtro-container").style.display = "none";

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
  fadeTo("modelli-container");
  document.getElementById("anni-container").style.display = "none";
  document.getElementById("risultati-container").innerHTML = "";
  document.getElementById("vetrina-container").style.display = "none";
  document.getElementById("filtro-container").style.display = "block";

document.querySelector(".filtro-btn.tutte")?.style.setProperty("display", "inline-block");
document.querySelector(".filtro-radio-btn.tutti")?.style.setProperty("display", "inline-block");


  // Aggiungi linea separatrice sotto ai filtri
const filtroCont = document.getElementById("filtro-container");
// Rimuove la linea precedente (se già presente)
const lineaEsistente = filtroCont.querySelector(".linea-separatrice");
if (!lineaEsistente) {
  const linea = document.createElement("hr");
  linea.className = "linea-separatrice";
  filtroCont.appendChild(linea);
}

  const container = document.getElementById("modelli-container");
  container.innerHTML = "";
  container.setAttribute("data-marca", marca);


  const backBtn = document.createElement("button");
  backBtn.textContent = "⬅️ Torna alle Marche";
  backBtn.className = "btn-rettangolare modello-btn";

  backBtn.style.color = "red";

  backBtn.style.margin = "0px";
  backBtn.style.width = "120px";
  backBtn.style.height = "120px";
  backBtn.onclick = mostraMarche;
  container.appendChild(backBtn);

  

  const modelliFiltrati = datiAuto.filter(r => {
    const tipo = (r["Tipo Chiave"] || "").toLowerCase();
    const rcSilca = (r["Radiocomando Silca da Usare"] || "").trim();
    const rcXhorse = (r["Radiocomando Xhorse da Usare"] || "").trim();
    
    const matchMarca = r["Marca"] === marca;

    let matchTipo = true;
    if (filtroTipoChiave === "blade") {
      matchTipo = tipo.includes("tradizionale");
    } else if (filtroTipoChiave === "prossimità") {
      matchTipo = (
        tipo.includes("prox") ||
        tipo.includes("slot") ||
        tipo.includes("fobik") ||
        tipo.includes("keyless")
      );
    }

    let matchRadio = true;
    if (filtroRadiocomando === "silca") {
      matchRadio = rcSilca !== "";
    } else if (filtroRadiocomando === "compatibili") {
      matchRadio = rcXhorse !== "";
    }

    return matchMarca && matchTipo && matchRadio;
  });


if (modelliFiltrati.length === 0) {
  container.innerHTML += `
    <div style="color: white; text-align: center; font-size: 18px; padding: 20px;">
      ❌ Nessun Modello trovato con i filtri selezionati.<br><br>
      🔄 Prova a cambiare i filtri per visualizzare i modelli disponibili.
    </div>
  `;
  return;
}


  const modSet = new Set();
  modelliFiltrati.forEach(r => {
    const modello = r["Modello"];





    if (modello && !modSet.has(modello)) {
      modSet.add(modello);

      const btn = document.createElement("button");
      btn.textContent = modello;
      btn.className = "btn-rettangolare";
      btn.onclick = () => {
        container.setAttribute("data-modello", modello);
        mostraAnni(marca, modello);
      };
      container.appendChild(btn);
    }
  });
}
// 🔹 NUOVA FUNZIONE DI FILTRO
function filtroChiave(tipo) {
  filtroTipoChiave = tipo;

  // Evidenzia il pulsante attivo
  document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("attivo"));
document.querySelector(`.filtro-btn[data-radio='${tipo}']`)?.classList.add("attivo");
  const modelliContainer = document.getElementById("modelli-container");
  const anniContainer = document.getElementById("anni-container");
  const risultatiContainer = document.getElementById("risultati-container");

  const marca = modelliContainer?.getAttribute("data-marca") || anniContainer?.getAttribute("data-marca");
  const modello = anniContainer?.getAttribute("data-modello");
  const anno = risultatiContainer?.getAttribute("data-anno");

  if (modelliContainer?.style.display === "flex" && marca) {
    mostraModelli(marca);
  } else if (anniContainer?.style.display === "flex" && marca && modello) {
    mostraAnni(marca, modello);
  } else if (risultatiContainer?.style.display === "block" && marca && modello && anno) {
    mostraRisultati(marca, modello, parseInt(anno));
  }
}


function applicaFiltroRadiocomando(tipo) {
  filtroRadiocomando = tipo;

  document.querySelectorAll(".filtro-radio-btn").forEach(b => b.classList.remove("attivo"));
  document.querySelector(`.filtro-radio-btn[onclick*="${tipo}"]`)?.classList.add("attivo");

  const modelliContainer = document.getElementById("modelli-container");
  const anniContainer = document.getElementById("anni-container");
  const risultatiContainer = document.getElementById("risultati-container");

  const marca = modelliContainer?.getAttribute("data-marca") || anniContainer?.getAttribute("data-marca");
  const modello = anniContainer?.getAttribute("data-modello");
  const anno = risultatiContainer?.getAttribute("data-anno");

  if (modelliContainer?.style.display === "flex" && marca) {
    mostraModelli(marca);
  } else if (anniContainer?.style.display === "flex" && marca && modello) {
    mostraAnni(marca, modello);
  } else if (risultatiContainer?.style.display === "block" && marca && modello && anno) {
    mostraRisultati(marca, modello, parseInt(anno));
  }
}

function mostraAnni(marca, modello) {
  document.getElementById("modelli-container").style.display = "none";
  fadeTo("anni-container"); 

document.getElementById("filtro-container").style.display = "block";

document.querySelector(".filtro-btn.tutte")?.style.setProperty("display", "inline-block");
document.querySelector(".filtro-radio-btn.tutti")?.style.setProperty("display", "inline-block");


// Aggiungi linea separatrice sotto ai filtri
const filtroCont = document.getElementById("filtro-container");
const lineaEsistente = filtroCont.querySelector(".linea-separatrice");
if (!lineaEsistente) {
  const linea = document.createElement("hr");
  linea.className = "linea-separatrice";
  filtroCont.appendChild(linea);
}


  document.getElementById("risultati-container").innerHTML = "";
  document.getElementById("vetrina-container").style.display = "none";

  const container = document.getElementById("anni-container");
  container.innerHTML = "";

  container.setAttribute("data-marca", marca);
  container.setAttribute("data-modello", modello);


  const backBtn = document.createElement("button");
  backBtn.textContent = "⬅️ Indietro";
  backBtn.className = "btn-rettangolare";

  backBtn.style.color = "red";
  
  backBtn.onclick = () => mostraModelli(marca);
  container.appendChild(backBtn);


  const risultatiFiltrati = datiAuto.filter(r => {
    const tipo = (r["Tipo Chiave"] || "").toLowerCase();
    const rcSilca = (r["Radiocomando Silca da Usare"] || "").trim();
    const rcXhorse = (r["Radiocomando Xhorse da Usare"] || "").trim();

    const matchMarca = r["Marca"] === marca;
    const matchModello = r["Modello"] === modello;

    let matchTipo = true;
    if (filtroTipoChiave === "blade") {
      matchTipo = tipo.includes("tradizionale");
    } else if (filtroTipoChiave === "prossimità") {
      matchTipo = (
        tipo.includes("prox") ||
        tipo.includes("slot") ||
        tipo.includes("fobik") ||
        tipo.includes("keyless")
      );
    }

    let matchRadio = true;
    if (filtroRadiocomando === "silca") {
      matchRadio = rcSilca !== "";
    } else if (filtroRadiocomando === "compatibili") {
      matchRadio = rcXhorse !== "";
    }

    return matchMarca && matchModello && matchTipo && matchRadio;
  });

  const anniUnici = new Set();
  risultatiFiltrati.forEach(range => {
    const start = parseInt(range["Anno Inizio"]);
    const end = parseInt(range["Anno Fine"]);
    for (let a = start; a <= end; a++) {
      anniUnici.add(a);
    }
  });

  const anniOrdinati = Array.from(anniUnici).sort((a, b) => a - b);


if (anniOrdinati.length === 0) {
  container.innerHTML += `
    <div style="color: white; text-align: center; font-size: 18px; padding: 20px;">
      ❌ Nessun Risultato disponibile con i filtri selezionati.<br><br>
      🔄 Prova a cambiare i filtri per visualizzare gli anni disponibili.
    </div>
  `;
  return;
}


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
  document.getElementById("vetrina-container").style.display = "none";
  document.getElementById("filtro-container").style.display = "block";


// 🔴 Nasconde i pulsanti Blade & Prossimità + Silca & Clik Automotive nella schermata risultati
const bladeProxBtn = document.querySelector(".filtro-btn.tutte");
if (bladeProxBtn) bladeProxBtn.style.display = "none";

const silcaClikBtn = document.querySelector(".filtro-radio-btn.tutti");
if (silcaClikBtn) silcaClikBtn.style.display = "none";


  const container = document.getElementById("risultati-container");
  fadeTo("risultati-container");
  container.innerHTML = "";





const backBtn = document.createElement("button");
  backBtn.id = "btn-indietro-risultato";
  backBtn.textContent = "⬅️ Torna alla Scelta Anno";
  backBtn.style.color = "white";
  backBtn.onclick = () => mostraAnni(marca, modello);
  container.appendChild(backBtn);




// Trova il primo risultato valido per ricavare l'immagine    FOTO NEL RISULTATO FINALE
const risultatoConFoto = datiAuto.find(r => 
  r["Marca"] === marca &&
  r["Modello"] === modello &&
  parseInt(r["Anno Inizio"]) <= anno &&
  parseInt(r["Anno Fine"]) >= anno &&
  ((filtroTipoChiave === "tutte") ||
    (filtroTipoChiave === "blade" && (r["Tipo Chiave"] || "").toLowerCase().includes("tradizionale")) ||
    (filtroTipoChiave === "prossimità" && (
      (r["Tipo Chiave"] || "").toLowerCase().includes("prox") ||
      (r["Tipo Chiave"] || "").toLowerCase().includes("slot") ||
      (r["Tipo Chiave"] || "").toLowerCase().includes("fobik") ||
      (r["Tipo Chiave"] || "").toLowerCase().includes("keyless")
    ))
  ) &&
  ((filtroRadiocomando === "tutti") ||
   (filtroRadiocomando === "silca" && r["Radiocomando Silca da Usare"] && r["Radiocomando Silca da Usare"] !== "—") ||
   (filtroRadiocomando === "compatibili" && r["Radiocomando Xhorse da Usare"] && r["Radiocomando Xhorse da Usare"] !== "—"))
);

const immagini = [];

if (risultatoConFoto) {
  if (risultatoConFoto["Foto Chiave"]) {
    immagini.push({
      titolo: "📸&nbsp;&nbsp;Foto Chiave",
      url: risultatoConFoto["Foto Chiave"],
      alt: "Chiave originale"
    });
  }

  if (risultatoConFoto["Foto OBD"]) {
    immagini.push({
      titolo: "📍&nbsp;&nbsp;Foto Posizione OBD",
      url: risultatoConFoto["Foto OBD"],
      alt: "Posizione OBD"
    });
  }
}

if (immagini.length > 0) {
  const fotoWrapper = document.createElement("div");
  fotoWrapper.style.textAlign = "center";
  fotoWrapper.style.margin = "12px 0";

  let indice = 0;

  const titolo = document.createElement("div");
  titolo.innerHTML = immagini[indice].titolo;
  titolo.style.color = "white";
  titolo.style.fontWeight = "bold";
  titolo.style.marginBottom = "6px";
  titolo.style.fontSize = "16px";



  const img = document.createElement("img");
img.src = immagini[indice].url;
img.alt = immagini[indice].alt;
img.style.opacity = "0";
img.style.transition = "opacity 0.5s ease-in-out";
img.onload = () => {
  img.style.opacity = "1";
};

// ✅ Imposta dimensioni fisse 250x250 e centratura
img.style.width = "250px";
img.style.height = "250px";
img.style.objectFit = "contain"; // Contenimento senza distorsione
img.style.backgroundColor = "transparent"; // oppure "#111" se vuoi fondo scuro
img.style.display = "block";
img.style.margin = "0 auto 16px auto";
img.style.borderRadius = "8px";
img.style.boxShadow = "0 2px 8px rgba(0,0,0,0.5)";


// Clic su immagine per ingrandire
img.style.cursor = "zoom-in";
img.onclick = () => {
  const overlay = document.getElementById("zoom-overlay");
  const zoomImg = document.getElementById("zoom-img");
  zoomImg.src = img.src;
  overlay.style.display = "flex";
};


  // Freccia sinistra
// Pulsante sinistro
const frecciaSx = document.createElement("img");
frecciaSx.src = "frecciasx.png";  // metti qui il tuo path corretto
frecciaSx.alt = "Indietro";
frecciaSx.style.width = "40px";
frecciaSx.style.cursor = "pointer";
frecciaSx.style.marginRight = "12px";
frecciaSx.onclick = () => {
  indice = (indice - 1 + immagini.length) % immagini.length;
  aggiornaImmagine();
};

// Pulsante destro
const frecciaDx = document.createElement("img");
frecciaDx.src = "frecciadx.png";  // metti qui il tuo path corretto
frecciaDx.alt = "Avanti";
frecciaDx.style.width = "40px";
frecciaDx.style.cursor = "pointer";
frecciaDx.style.marginLeft = "12px";
frecciaDx.onclick = () => {
  indice = (indice + 1) % immagini.length;
  aggiornaImmagine();
};


  const navigazione = document.createElement("div");
  navigazione.style.display = "flex";
  navigazione.style.justifyContent = "center";
  navigazione.style.alignItems = "center";
  navigazione.appendChild(frecciaSx);
  navigazione.appendChild(img);
  navigazione.appendChild(frecciaDx);

  function aggiornaImmagine() {
    titolo.innerHTML = immagini[indice].titolo;
    img.style.opacity = "0";
    img.src = immagini[indice].url;
    img.alt = immagini[indice].alt;
    setTimeout(() => {
      img.style.opacity = "1";
    }, 50);
  }

  fotoWrapper.appendChild(titolo);
  fotoWrapper.appendChild(navigazione);


// Se ci sono note, aggiungi icona megafono e popup
if (risultatoConFoto && risultatoConFoto["Note e Suggerimenti"] && risultatoConFoto["Note e Suggerimenti"].trim() !== "") {
  fotoWrapper.style.position = "relative";

  const noteBtn = document.createElement("img");
  noteBtn.src = "note.png"; // 👉 metti qui il path corretto del PNG trasparente
  noteBtn.alt = "Note disponibili";
  noteBtn.style.width = "160px";
  noteBtn.style.height = "110px";
  noteBtn.style.top = "220px";
  noteBtn.style.left = "240px";
  noteBtn.style.filter = "drop-shadow(1px 1px 3px rgba(0,0,0,0.6))";
  noteBtn.style.position = "absolute";
  noteBtn.style.bottom = "12px";
  noteBtn.style.right = "0px";
  noteBtn.style.cursor = "pointer";
  noteBtn.style.transition = "transform 0.2s ease";
  noteBtn.style.zIndex = "10";
  noteBtn.classList.add("attira-attenzione-glow");
  noteBtn.onmouseover = () => noteBtn.style.transform = "scale(1.15)";
  noteBtn.onmouseout = () => noteBtn.style.transform = "scale(1)";

  const popup = document.createElement("div");
  popup.innerHTML = risultatoConFoto["Note e Suggerimenti"];
  popup.style.position = "absolute";
  popup.style.bottom = "60px";
  popup.style.right = "16px";
  popup.style.background = "#222";
  popup.style.color = "#fff";
  popup.style.padding = "10px";
  popup.style.borderRadius = "8px";
  popup.style.boxShadow = "0 4px 10px rgba(0,0,0,0.5)";
  popup.style.display = "none";

  popup.style.width = "320px";  // maggiore larghezza
  popup.style.maxWidth = "90%"; // non superare quasi tutta la larghezza su dispositivi piccoli
  popup.style.maxHeight = "70vh"; // altezza massima, usare unità viewport per adattarsi meglio
  popup.style.overflowY = "auto"; // se il contenuto è lungo far scorrere
  popup.style.fontSize = "18px";  // un po’ più grande il testo
  popup.style.padding = "16px";    // più spazioso

  popup.style.zIndex = "999";

  noteBtn.onclick = (e) => {
  e.stopPropagation(); // 👉 Evita che il click sull’icona venga visto come "fuori"
  popup.style.display = popup.style.display === "none" ? "block" : "none";

  if (popup.style.display === "block") {
    // Aggiungi listener una sola volta quando si apre
    const chiudiPopup = (event) => {
      if (!popup.contains(event.target) && !noteBtn.contains(event.target)) {
        popup.style.display = "none";
        document.removeEventListener("click", chiudiPopup);
      }
    };
    document.addEventListener("click", chiudiPopup);
  }
};

  // Chiudi il popup se clicchi fuori
  document.addEventListener("click", function(event) {
  const isClickInside = popup.contains(event.target) || noteBtn.contains(event.target);
  if (!isClickInside) {
    popup.style.display = "none";
  }
}, { once: true });


  fotoWrapper.appendChild(noteBtn);
  fotoWrapper.appendChild(popup);
}
  container.appendChild(fotoWrapper);
}
  


  container.setAttribute("data-marca", marca);
  container.setAttribute("data-modello", modello);
  container.setAttribute("data-anno", anno);  
  container.scrollTo({ top: 0, behavior: "instant" });

  

  const risultati = datiAuto.filter(r => {
  const tipo = (r["Tipo Chiave"] || "").toLowerCase();
  const rcSilca = (r["Radiocomando Silca da Usare"] || "").trim();
  const rcXhorse = (r["Radiocomando Xhorse da Usare"] || "").trim();

  const matchMarca = r["Marca"] === marca;
  const matchModello = r["Modello"] === modello;
  const matchAnno = parseInt(r["Anno Inizio"]) <= anno && parseInt(r["Anno Fine"]) >= anno;

  let matchTipo = true;
  if (filtroTipoChiave === "blade") {
    matchTipo = tipo === "radiocomando tradizionale";
  } else if (filtroTipoChiave === "prossimità") {
    matchTipo = (
      tipo.includes("prox") ||
      tipo.includes("slot") ||
      tipo.includes("fobik") ||
      tipo.includes("keyless")
    );
  }

  let matchRadio = true;
if (filtroRadiocomando === "silca") {
  matchRadio = rcSilca && rcSilca !== "—";
} else if (filtroRadiocomando === "compatibili") {
  matchRadio = rcXhorse && rcXhorse !== "—";
}

  return matchMarca && matchModello && matchAnno && matchTipo && matchRadio;
});

// 🔎 Se non ci sono risultati, mostra messaggio informativo
if (risultati.length === 0) {
  const messaggio = document.createElement("div");
  messaggio.innerHTML = `
    <div style="color: white; text-align: center; font-size: 18px; padding: 20px;">
      ❌ Nessun risultato trovato con i filtri selezionati.<br><br>
      🔄 Prova a cambiare i filtri per visualizzare le chiavi disponibili.
    </div>
  `;
  container.appendChild(messaggio);
  return; // 🔴 Interrompe la funzione per evitare altri errori
}


  risultati.forEach(r => {
    const div = document.createElement("div");
    div.style = "background: #222; margin:3px 3px 25px 3px; padding:10px; border-radius:8px; text-align: left;";
    div.innerHTML = `
<div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;">
  <div style="color:red; font-weight:bold; font-size: 1.5em; font-style: italic;">
    ${r.Marca} ${r.Modello}
  </div>
  <div style="color: gold; font-size: 1.1em; font-weight: bold; font-style: italic; margin-left: 8px;">
    <span style="color: red;">Facilità:</span>
    ${
      (() => {
        const valore = parseFloat(r["Facile"]);
        if (isNaN(valore)) return "★☆☆☆☆";
        if (valore > 4.0) return "★★★★★";
        if (valore > 3.0) return "★★★★☆";
        if (valore > 2.0) return "★★★☆☆";
        if (valore > 1.0) return "★★☆☆☆";
        return "★☆☆☆☆";
      })()
    }
  </div>
</div>
<div style="margin-top:6px;">
  <span class="label-rossa">Anno:</span> ${r["Anno Inizio"]} - ${r["Anno Fine"]}
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span class="label-rossa">VIN:</span> ${r["VIN / Versione"] || "—"}<br>
</div>  <div style="margin-top:6px;"><span class="label-rossa">Tipo Chiave:</span> ${r["Tipo Chiave"]}<br>
  <div style="margin-top:6px;"><span class="label-rossa">Transponder:</span> ${r.Transponder}<br>
  <hr style="border: 1; border-top: 1px solid #444; margin: 6px 0;">
   <div style="margin-top:6px;"><span class="label-rossa">Transponder Clonabile:</span> ${r["Transponder Clonabile"]}<br>
  <div style="margin-top:6px;"><span class="label-rossa">Transponder Program. Con Diagnostico:</span> ${r["Transponder Programmabile Con Diagnostico"]}<br>
  <div style="margin-top:6px;"><span class="label-rossa">Radiocomando Program. Con Diagnostico:</span> ${r["Radiocomando Programmabile Con Diagnostico"]}<br>
  <hr style="border: 1; border-top: 1px solid #444; margin: 6px 0;">

  <div style="margin-top:6px;"><span class="label-rossa">Pin Rilevabile:</span> ${r["Pin Rilevabile"]}<br>
  <div style="margin-top:6px;"><span class="label-rossa">Pin Necessario Per La Programmazione:</span> ${r["Pin Necessario Per La Programmazione"]}<br>
  <hr style="border: 1; border-top: 1px solid #444; margin: 6px 0;">

  <div style="margin-top:6px;"><span class="label-rossa">Metodo di Programmazione:</span> ${r["Metodo di Programmazione"]}<br>
  <hr style="border: 1; border-top: 1px solid #444; margin: 6px 0;">

  <div style="margintop:6px;"><span class="label-rossa">Richiesta Precodifica:</span> ${r["Richiesta Precodifica"]}<br>
  <hr style="border: 1; border-top: 1px solid #444; margin: 6px 0;">

  <div style="margin-top:6px;"><span class="label-rossa">Situazione Tutte Chiavi Perse:</span> ${r["Situazione Tutte Chiavi Perse"]}<br>
  <hr style="border: 1; border-top: 1px solid #444; margin: 6px 0;">




  ${
  filtroRadiocomando === "silca"
    ? `<div style="margin-top:6px;"><span class="label-rossa">Radiocomando Silca da Usare:</span> ${r["Radiocomando Silca da Usare"] || "—"}</div>`
    : filtroRadiocomando === "compatibili"
      ? `
<div style="margin-top:6px;"><span class="label-rossa">Scheda Xhorse da Usare:</span> ${r["Scheda Xhorse da Usare"]}<br>
<div style="margin-top:6px;"><span class="label-rossa">Radiocomando Clik Automotive da Usare:</span> ${r["Radiocomando Xhorse da Usare"]}<br>`
      : `
<div style="margin-top:6px;"><span class="label-rossa">Radiocomando Silca da Usare:</span> ${r["Radiocomando Silca da Usare"]}<br>
<div style="margin-top:6px;"><span class="label-rossa">Scheda Xhorse da Usare:</span> ${r["Scheda Xhorse da Usare"]}<br>
<div style="margin-top:6px;"><span class="label-rossa">Radiocomando Clik Automotive da Usare:</span> ${r["Radiocomando Xhorse da Usare"]}<br>`
}


    `;
    container.appendChild(div);
  });




// 👉 AGGIUNGI QUESTO BLOCCO QUI PER AGGIUNGERE LO SPAZIO DOP I RISULTATI
  const spazioFinale = document.createElement("div");
  spazioFinale.style.height = "100px";
  container.appendChild(spazioFinale);
}

// --------------------------- VETRINA + NEWS -----------------------------

function mostraVetrina(dati) {
  const cont = document.getElementById("vetrina-container");
  cont.innerHTML = "";
  const slides = dati.filter(r => r.Tipo === "Vetrina");
  if (slides.length === 0) return;

  let current = 0;
  const slideWrapper = document.createElement("div");
  slideWrapper.className = "vetrina-slide fade";
  cont.appendChild(slideWrapper);

  function aggiornaSlide() {
    slideWrapper.classList.remove("fade");
    void slideWrapper.offsetWidth;
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

function fadeTo(idToShow) {
  const sezioni = ["marche-container", "modelli-container", "anni-container", "risultati-container"];
  sezioni.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === idToShow) {
        el.classList.add("fade-container");
        el.style.opacity = 0;
        el.style.display = id === "risultati-container" ? "block" : "flex";
        requestAnimationFrame(() => {
          el.style.transition = "opacity 0.4s ease";
          el.style.opacity = 1;
        });
      } else {
        el.style.display = "none";
      }
    }
  });


// Chiudi zoom cliccando sulla X
document.getElementById("zoom-close").onclick = () => {
  document.getElementById("zoom-overlay").style.display = "none";
};


}


window.onload = caricaDati;