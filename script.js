/* jshint esversion: 6 */
/* global L */

document.addEventListener('DOMContentLoaded', () => {
  let translations = {};
  let allMarkers = [];
  const layers = {};
  const map = L.map('map', { crs: L.CRS.Simple, minZoom: -5, zoomControl: false });
  const bounds = [[0, 0], [4000, 4000]];
  L.imageOverlay('img/mapfinal.png', bounds).addTo(map);
  map.fitBounds(bounds);
  L.control.zoom({ position: 'topright' }).addTo(map);
  let currentLang = localStorage.getItem('lang') || 'de';

  const icons = {
    specials: L.icon({ iconUrl: 'img/schloss.png', iconSize: [28,32], iconAnchor: [16,37], popupAnchor: [0,-28] }),
    bosse: L.icon({ iconUrl: 'img/boss.png', iconSize: [28,32], iconAnchor: [16,37], popupAnchor: [0,-28] }),
    default: L.icon({ iconUrl: 'img/pin.png', iconSize: [28,32], iconAnchor: [16,37], popupAnchor: [0,-28] })
  };

  function loadLanguage(lang) {
    return fetch(`data/lang_${lang}.json`)
      .then(res => res.json())
      .then(data => {
        translations = data;
        updateUI();
        updateCheckboxLabels();
        updateMarkers();
      });
  }

  function updateUI() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[key]) el.textContent = translations[key];
    });
  }

  function loadMarkers() {
    fetch('data/markers.json')
      .then(res => res.json())
      .then(data => {
        allMarkers = data;
        setupLayersAndCheckboxes();
        updateMarkers();
      });
  }

  function setupLayersAndCheckboxes() {
    const types = [...new Set(allMarkers.map(m => m.type))];
    const sidebar = document.getElementById('sidebar');

    types.forEach(type => {
      if (!layers[type]) {
        layers[type] = L.layerGroup();
      }

      if (!document.querySelector(`#chk-${type}`)) {
        const label = document.createElement('label');
        label.setAttribute('for', `chk-${type}`);
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.dataset.layer = type;
        input.checked = true;
        input.id = `chk-${type}`;
        input.name = type;

        const span = document.createElement('span');
        span.textContent = translations[`label_${type}`] || type;

        label.appendChild(input);
        label.appendChild(span);
        sidebar.appendChild(label);

        input.addEventListener('change', () => {
          updateMarkers();
        });
      }
    });
  }

  function updateCheckboxLabels() {
    const types = [...new Set(allMarkers.map(m => m.type))];
    types.forEach(type => {
      const label = document.querySelector(`#sidebar label[for="chk-${type}"] span`);
      if (label) {
        label.textContent = translations[`label_${type}`] || type;
      }
    });
  }

  function updateMarkers() {
    Object.values(layers).forEach(layer => {
      layer.clearLayers();
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });

    allMarkers.forEach(markerGroup => {
      const checkbox = document.querySelector(`#chk-${markerGroup.type}`);
      if (checkbox && checkbox.checked) {
        const icon = icons[markerGroup.type] || icons.default;
        const name = translations[`label_${markerGroup.type}`] || markerGroup.type;
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
    currentLang = e.target.value;
    localStorage.setItem('lang', currentLang);
    loadLanguage(currentLang);
  });

  // Erst Sprache laden, dann Marker
  loadLanguage(currentLang).then(() => {
    loadMarkers();
  });
});
