
var map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -5
});

var bounds = [[0,0], [4000,4000]];
var image = L.imageOverlay('img/mapfinal.png', bounds).addTo(map);
map.fitBounds(bounds);

const layers = {
  stein: L.layerGroup().addTo(map),
  holz: L.layerGroup().addTo(map),
  eisen: L.layerGroup().addTo(map),
  silber: L.layerGroup().addTo(map),
  bosse: L.layerGroup().addTo(map),
  specials: L.layerGroup().addTo(map)
};

fetch('data/markers.json')
  .then(res => res.json())
  .then(data => {
    data.forEach(marker => {
      const m = L.marker(marker.coords).bindPopup(`<b>${marker.name}</b><br>${marker.info}`);
      layers[marker.type].addLayer(m);
    });
  });

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
