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

  // Icons definieren
  const icons = {
    specials: L.icon({
      iconUrl: 'img/schloss.png',    // Pfad zu deinem Haus-Icon
      iconSize: [32, 37],                // Größe anpassen
      iconAnchor: [16, 37],              // unten mittig
      popupAnchor: [0, -28]
    }),
    bosse: L.icon({
      iconUrl: 'img/boss.png',    // Pfad zu deinem Totenkopf-Icon
      iconSize: [32, 37],
      iconAnchor: [16, 37],
      popupAnchor: [0, -28]
    }),
    default: L.icon({
      iconUrl: 'img/default-icon.png',  // Standard-Icon
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [0, -34]
    })
  };

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
      // Layer anlegen, falls noch nicht existierend
      if (!layers[type]) {
        layers[type] = L.layerGroup().addTo(map);
      }

      // Prüfen, ob Checkbox schon existiert
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

        // EventListener für die neue Checkbox
        input.addEventListener('change', () => {
          if (input.checked) {
            map.addLayer(layers[type]);
          } else {
            map.removeLayer(layers[type]);
          }
        });
      }
    });
  }

  function updateMarkers() {
    for (const layer of Object.values(layers)) {
      layer.clearLayers();
    }

    allMarkers.forEach(markerGroup => {
      const name = translations[markerGroup.nameKey] || markerGroup.nameKey;

      // Icon je nach Typ auswählen
      const icon = icons[markerGroup.type] || icons.default;

      markerGroup.coords.forEach(coord => {
        const m = L.marker(coord, { icon: icon }).bindPopup(`<b>${name}</b>`);
        layers[markerGroup.type]?.addLayer(m);
      });
    });
  }

  const langSwitcher = document.getElementById('lang-switcher');
  langSwitcher.value = currentLang;
  langSwitcher.addEventListener('change', e => {
    const selectedLang = e.target.value;
    localStorage.setItem('lang', selectedLang);
    currentLang = selectedLang;
    loadLanguage(currentLang);
  });

  loadLanguage(currentLang);
  loadMarkers();
});
