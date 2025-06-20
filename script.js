// Aktuelle Sprache festlegen und Texte übersetzen
function loadLanguage(lang) {
  fetch(`data/lang_${lang}.json`)
    .then(res => res.json())
    .then(translations => {
      // Textlabels (z.B. Checkbox-Beschriftungen)
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) el.textContent = translations[key];
      });

      // Platzhalter (z.B. Suchfeld)
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[key]) el.setAttribute('placeholder', translations[key]);
      });
    })
    .catch(err => console.error("Sprachdatei konnte nicht geladen werden:", err));
}

// Initialsprache aus localStorage oder Standard 'de'
let currentLang = localStorage.getItem('lang') || 'de';
loadLanguage(currentLang);

// Karte initialisieren — nur einmal!
var map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -5,
  zoomControl: false
});

var bounds = [[0, 0], [4000, 4000]];
var image = L.imageOverlay('img/mapfinal.png', bounds).addTo(map);
map.fitBounds(bounds);

L.control.zoom({ position: 'topright' }).addTo(map);

// Layer-Gruppen für Marker
const layers = {
  stein: L.layerGroup().addTo(map),
  holz: L.layerGroup().addTo(map),
  eisen: L.layerGroup().addTo(map),
  silber: L.layerGroup().addTo(map),
  bosse: L.layerGroup().addTo(map),
  specials: L.layerGroup().addTo(map)
};

// Beispielmarker (Koordinaten anpassen)
const exampleMarkers = [
  { coords: [1000, 1000], name: "Stein 1", type: "stein", info: "Steinressource" },
  { coords: [1200, 1100], name: "Holz 1", type: "holz", info: "Holzressource" },
  { coords: [1300, 1400], name: "Boss 1", type: "bosse", info: "Boss Location" }
];

// Marker hinzufügen
exampleMarkers.forEach(marker => {
  const m = L.marker(marker.coords).bindPopup(`<b>${marker.name}</b><br>${marker.info}`);
  layers[marker.type].addLayer(m);
});

// Checkbox-Listener zum Layer ein-/ausschalten
document.querySelectorAll('#controls input[type="checkbox"]').forEach(cb => {
  cb.addEventListener('change', () => {
    const layer = layers[cb.dataset.layer];
    if (cb.checked) {
      map.addLayer(layer);
    } else {
      map.removeLayer(layer);
    }
  });
});

// Sprachwechsel über Dropdown mit Speicherung und Aktualisierung der Texte
document.getElementById('lang-switcher').value = currentLang;  // Auswahl passend setzen
document.getElementById('lang-switcher').addEventListener('change', (e) => {
  const selectedLang = e.target.value;
  localStorage.setItem('lang', selectedLang);
  loadLanguage(selectedLang);
});
