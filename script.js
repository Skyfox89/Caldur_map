document.addEventListener('DOMContentLoaded', () => {
  let translations = {}; // aktuelles Übersetzungsobjekt

  // Funktion zum Laden der Sprache und Übersetzung der UI
  function loadLanguage(lang) {
    fetch(`data/lang_${lang}.json`)
      .then(res => res.json())
      .then(translationsData => {
        translations = translationsData;

        // UI-Texte übersetzen
        document.querySelectorAll('[data-i18n]').forEach(el => {
          const key = el.getAttribute('data-i18n');
          if (translations[key]) el.textContent = translations[key];
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
          const key = el.getAttribute('data-i18n-placeholder');
          if (translations[key]) el.setAttribute('placeholder', translations[key]);
        });

        updateMarkers(); // Marker-Popups mit neuen Texten aktualisieren
      })
      .catch(err => console.error("Sprachdatei konnte nicht geladen werden:", err));
  }

  // Initialsprache aus localStorage oder Standard 'de'
  let currentLang = localStorage.getItem('lang') || 'de';

  // Karte initialisieren
  var map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -5,
    zoomControl: false
  });

  var bounds = [[0, 0], [4000, 4000]];
  L.imageOverlay('img/mapfinal.png', bounds).addTo(map);
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

  // Marker-Daten mit Übersetzungs-Schlüsseln
  const exampleMarkers = [
    { coords: [1000, 1000], nameKey: "marker_stein_1", infoKey: "marker_stein_1_info", type: "stein" },
    { coords: [1200, 1100], nameKey: "marker_holz_1", infoKey: "marker_holz_1_info", type: "holz" },
    { coords: [2500, 2700], nameKey: "marker_bosse_1", infoKey: "marker_bosse_1_info", type: "bosse" }
  ];

  // Marker aktualisieren / neu erstellen mit Übersetzungen
  function updateMarkers() {
     console.log("Marker werden neu gesetzt mit aktuellen Übersetzungen:", translations);
    for (const layer of Object.values(layers)) {
      layer.clearLayers();
    }

    exampleMarkers.forEach(marker => {
      const name = translations[marker.nameKey] || marker.nameKey;
      const info = translations[marker.infoKey] || marker.infoKey;
      const m = L.marker(marker.coords).bindPopup(`<b>${name}</b><br>${info}`);
      layers[marker.type].addLayer(m);
    });
  }

  // Checkboxen ein-/ausschalten für Layer
  document.querySelectorAll('#sidebar input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const layer = layers[cb.dataset.layer];
      if (cb.checked) {
        map.addLayer(layer);
      } else {
        map.removeLayer(layer);
      }
    });
  });

  // Sprachwechsel Dropdown
  const langSwitcher = document.getElementById('lang-switcher');
  langSwitcher.value = currentLang;
  langSwitcher.addEventListener('change', e => {
    const selectedLang = e.target.value;
    localStorage.setItem('lang', selectedLang);
    currentLang = selectedLang;
    loadLanguage(selectedLang);
  });

  // Erstmalige Sprach-Ladung
  loadLanguage(currentLang);
});
