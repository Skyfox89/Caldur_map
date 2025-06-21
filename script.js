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

  // Eigene Icons definieren
  const icons = {
    specials: L.icon({
      iconUrl: 'img/schloss.png',
      iconSize: [28, 32],
      iconAnchor: [16, 37],
      popupAnchor: [0, -28]
    }),
    bosse: L.icon({
      iconUrl: 'img/boss.png',
      iconSize: [28, 32],
      iconAnchor: [16, 37],
      popupAnchor: [0, -28]
    }),
    default: L.icon({
      iconUrl: 'img/pin.png',  // eigenes Standard-Icon
      iconSize: [28, 32],
      iconAnchor: [16, 37],
      popupAnchor: [0, -28]
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
      if (!layers[type]) {
        layers[type] = L.layerGroup();
      }

      if (!document.querySelector(`#sidebar input[data-layer="${type}"]`)) {
        const label = document.createElement('label');
        const input = document.createElement('input');
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

        // Nur updateMarkers aufrufen — Layer ein/aus wird dort gesteuert
        input.addEventListener('change', () => {
          updateMarkers();
        });
      }
    });
  }

  function updateMarkers() {
    // Alle Layer leeren und von Karte entfernen
    for (const layer of Object.values(layers)) {
      layer.clearLayers();
      map.removeLayer(layer);
    }

    allMarkers.forEach(markerGroup => {
      const name = translations[`label_${markerGroup.type}`] || markerGroup.type;
      const icon = icons[markerGroup.type] || icons.default;

      if (!icons[markerGroup.type]) {
        console.warn(`⚠ Kein spezielles Icon für Typ "${markerGroup.type}", verwende Default.`);
      }

      const checkbox = document.querySelector(`#sidebar input[data-layer="${markerGroup.type}"]`);
      if (checkbox && checkbox.checked) {
        markerGroup.coords.forEach(coord => {
          const marker = L.marker(coord, { icon }).bindPopup(`<b>${name}</b>`);
          layers[markerGroup.type].addLayer(marker);
        });
        map.addLayer(layers[markerGroup.type]);
      }
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
