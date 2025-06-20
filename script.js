document.addEventListener('DOMContentLoaded', () => {
  let translations = {};
  let currentLang = localStorage.getItem('lang') || 'de';
  const layers = {};
  let allMarkers = [];

  // Sprachdatei laden und UI + Marker aktualisieren
  function loadLanguage(lang) {
    fetch(`data/lang_${lang}.json`)
      .then(res => res.json())
      .then(data => {
        translations = data;
        translateUI();
        updateMarkers();
      })
      .catch(err => console.error("Sprachdatei konnte nicht geladen werden:", err));
  }

  // UI-Texte aktualisieren
  function translateUI() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[key]) el.textContent = translations[key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (translations[key]) el.setAttribute('placeholder', translations[key]);
    });

    // Checkbox-Labels übersetzen
    document.querySelectorAll('#sidebar label').forEach(label => {
      const layer = label.querySelector('input')?.dataset.layer;
      if (layer && translations[`label_${layer}`]) {
        label.querySelector('span').textContent = translations[`label_${layer}`];
      }
    });
  }

  // Karte initialisieren
  const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -5,
    zoomControl: false
  });
  const bounds = [[0, 0], [4000, 4000]];
  L.imageOverlay('img/mapfinal.png', bounds).addTo(map);
  map.fitBounds(bounds);
  L.control.zoom({ position: 'topright' }).addTo(map);

  // Marker aus externer JSON laden
  function loadMarkers() {
    fetch('data/markers.json')
      .then(res => res.json())
      .then(data => {
        allMarkers = data;

        // Alle Typen erkennen & Layer + Checkboxen erstellen
        const uniqueTypes = [...new Set(allMarkers.map(m => m.type))];
        const sidebar = document.getElementById('sidebar');

        uniqueTypes.forEach(type => {
          // Layer anlegen
          layers[type] = L.layerGroup().addTo(map);

          // Checkbox erzeugen
          const label = document.createElement('label');
          const input = document.createElement('input');
          input.type = 'checkbox';
          input.dataset.layer = type;
          input.checked = true;
          input.id = `chk-${type}`;
          input.name = type;

          input.addEventListener('change', () => {
            if (input.checked) {
              map.addLayer(layers[type]);
            } else {
              map.removeLayer(layers[type]);
            }
          });

          const span = document.createElement('span');
          span.setAttribute('data-i18n', `label_${type}`);
          span.textContent = translations[`label_${type}`] || type;

          label.appendChild(input);
          label.appendChild(span);
          sidebar.appendChild(label);
        });

        updateMarkers();
        translateUI();
      })
      .catch(err => console.error("Markerdatei konnte nicht geladen werden:", err));
  }

  // Marker mit Übersetzungen aktualisieren
  function updateMarkers() {
    Object.values(layers).forEach(layer => layer.clearLayers());

    allMarkers.forEach(marker => {
      const name = translations[marker.nameKey] || marker.nameKey;
      const info = translations[marker.infoKey] || marker.infoKey;
      const m = L.marker(marker.coords).bindPopup(`<b>${name}</b><br>${info}`);
      layers[marker.type]?.addLayer(m);
    });
  }

  // Sprachumschaltung
  const langSwitcher = document.getElementById('lang-switcher');
  langSwitcher.value = currentLang;
  langSwitcher.addEventListener('change', e => {
    currentLang = e.target.value;
    localStorage.setItem('lang', currentLang);
    loadLanguage(currentLang);
  });

  // Initial laden
  loadMarkers();
  loadLanguage(currentLang);
});
