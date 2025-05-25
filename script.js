// Aktuelle Sprache festlegen
let currentLang = 'de';

// Funktion zum Laden der Sprachdatei
function loadLanguage(lang) {
  fetch(`data/lang_${lang}.json`)
    .then(res => res.json())
    .then(translations => {
      // Textlabels (z. B. Checkbox-Beschriftungen)
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) el.textContent = translations[key];
      });

      // Platzhaltertexte (z. B. Suchfeld)
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[key]) el.setAttribute('placeholder', translations[key]);
      });
    });
}

// Karte initialisieren
var map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -5
});

// Kartengröße anpassen (abhängig von Bildgröße)
var bounds = [[0, 0], [4000, 4000]];
var image = L.imageOverlay('img/mapfinal.png', bounds).addTo(map);
map.fitBounds(bounds);

// Ressourcen- und Marker-Layer definieren
const layers = {
  stein: L.layerGroup().addTo(map),
  holz: L.layerGroup().addTo(map),
  eisen: L.layerGroup().addTo(map),
  silber: L.layerGroup().addTo(map),
  bosse: L.layerGroup().addTo(map),
  specials: L.layerGroup().addTo(map)
};

// Marker aus JSON laden
fetch('data/markers.json')
  .then(res => res.json())
  .then(data => {
    data.forEach(marker => {
      const m = L.marker(marker.coords).bindPopup(`<b>${marker.name}</b><br>${marker.info}`);
      if (layers[marker.type]) {
        layers[marker.type].addLayer(m);
      }
    });
  });

// Checkbox-Filter für Ressourcenebenen
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

// Suchfunktion – Marker mit passendem Namen anzeigen
document.getElementById("search").addEventListener("input", e => {
  const val = e.target.value.toLowerCase();
  for (const group of Object.values(layers)) {
    group.eachLayer(marker => {
      const name = marker.getPopup().getContent().toLowerCase();
      if (name.includes(val)) {
        marker.openPopup();
      }
    });
  }
});

// Sprachumschalter
document.getElementById('lang-switcher').addEventListener('change', e => {
  currentLang = e.target.value;
  loadLanguage(currentLang);
});

// Initialsprache laden
loadLanguage(currentLang);
