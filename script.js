document.addEventListener('DOMContentLoaded', () => {
  let translations = {};
  let allMarkers = [];
  const layers = {};
  const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -5,
    zoomControl: false
  });

  const bounds = [[0, 0], [4000, 4000]];
  L.imageOverlay('img/mapfinal.png', bounds).addTo(map);
  map.fitBounds(bounds);
  L.control.zoom({ position: 'topright' }).addTo(map);

  let currentLang = localStorage.getItem('lang') || 'de';

  function loadLanguage(lang) {
    fetch(`data/lang_${lang}.json`)
      .then(res => res.json())
      .then(data => {
        translations = data;
        updateUI();
        updateMarkers();
      })
      .catch(err => console.error("Sprachdatei konnte nicht geladen werden:", err));
  }

  function updateUI() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[key]) el.textContent = translations[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (translations[key]) el.setAttribute('placeholder', translations[key]);
    });
  }

  function loadMarkers() {
    fetch('data/markers.json')
      .then(res => res.json())
      .then(data => {
        allMarkers = data;
        setupLayersAndCheckboxes();
        updateMarkers();
      })
      .catch(err => console.error("Marker-Datei konnte nicht geladen werden:", err));
  }

  function setupLayersAndCheckboxes() {
    const types = [...new Set(allMarkers.map(m => m.type))];
    const sidebar = document.getElementById('sidebar');

    types.forEach(type => {
      // Layer anlegen
      layers[type] = L.layerGroup().addTo(map);

      // Prüfen ob Checkbox existiert
      let input = document.querySelector(`#sidebar input[data-layer="${type}"]`);

      if (!input) {
        // Neue Checkbox erstellen
        const label = document.createElement('label');
        input = document.createElement('input');
        input.type = 'checkbox';
        input.dataset.layer = type;
        input.checked = true;
        input.id = `chk-${type}`;
        input.name = type;

        const span = document.createElement('span');
        span.setAttribute('data-i18n', `label_${type}`);
        span.textContent = translations[`label_${type}`] || type;

        label.appendChild(input);
        label.appendChild(span);
        sidebar.appendChild(label);
      }

      // EventListener sicherstellen
      input.addEventListener('change', () => {
        if (input.checked) {
          map.addLayer(layers[type]);
        } else {
          map.removeLayer(layers[type]);
        }
      });
    });
  }

function updateMarkers() {
  for (const layer of Object.values(layers)) {
    layer.clearLayers();
  }

  allMarkers.forEach(markerGroup => {
    const name = translations[markerGroup.nameKey] || markerGroup.nameKey;
    const info = translations[markerGroup.infoKey] || markerGroup.infoKey;

    markerGroup.coords.forEach(coord => {
      const m = L.marker(coord).bindPopup(`<b>${name}</b><br>${info}`);
      layers[markerGroup.type]?.addLayer(m);
    });
  });
}

  document.getElementById('lang-switcher').value = currentLang;
  document.getElementById('lang-switcher').addEventListener('change', e => {
    const selectedLang = e.target.value;
    localStorage.setItem('lang', selectedLang);
    currentLang = selectedLang;
    loadLanguage(currentLang);
  });

  loadLanguage(currentLang);
  loadMarkers();
});
