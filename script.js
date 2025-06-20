document.addEventListener('DOMContentLoaded', () => {
  let translations = {}; // aktuelles Übersetzungsobjekt
  let currentLang = localStorage.getItem('lang') || 'de';

  // Leaflet-Karte initialisieren
  const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -5,
    zoomControl: false
  });

  const bounds = [[0, 0], [4000, 4000]];
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

  // Marker aus externer JSON-Datei laden und mit Sprache übersetzen
  function loadMarkers(lang) {
    fetch('data/markers.json')
      .then(res => res.json())
      .then(data => {
        // Alle Marker aus Layern entfernen
        Object.values(layers).forEach(layer => layer.clearLayers());

        data.forEach(marker => {
          const name = marker.name[lang] || marker.name['de'];
          const info = marker.info[lang] || marker.info['de'];
          const popup = `<b>${name}</b><br>${info}`;
          const m = L.marker(marker.coords).bindPopup(popup);
          if (layers[marker.type]) {
            layers[marker.type].addLayer(m);
          }
        });
      })
      .catch(err => console.error("Fehler beim Laden der Marker:", err));
  }

  // Sprache laden & UI-Texte aktualisieren
  function loadLanguage(lang) {
    fetch(`data/lang_${lang}.json`)
      .then(res => res.json())
      .then(translationsData => {
        translations = translationsData;

        // UI übersetzen
        document.querySelectorAll('[data-i18n]').forEach(el => {
          const key = el.getAttribute('data-i18n');
          if (translations[key]) el.textContent = translations[key];
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
          const key = el.getAttribute('data-i18n-placeholder');
          if (translations[key]) el.setAttribute('placeholder', translations[key]);
        });

        loadMarkers(lang); // Markertexte ebenfalls aktualisieren
      })
      .catch(err => console.error("Sprachdatei konnte nicht geladen werden:", err));
  }

  // Checkboxen zum Layer ein-/ausschalten
  document.querySelectorAll('#sidebar input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const layer = layers[cb.dataset.layer];
      if (cb.checked) {
        map.addLayer(layer);
      } else {
        map.removeLayer(layer);
      }
    });

    // Optionale Warnung im Dev-Tool vermeiden (kein Bug, nur Hinweis)
    if (!cb.id) cb.id = `cb-${cb.dataset.layer}`;
    if (!cb.name) cb.name = cb.id;
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

  // Initial laden
  loadLanguage(currentLang);
});
