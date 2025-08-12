// Initialize the Leaflet map
const map = L.map('map').setView([-23.442, 148.035], 10);

// Load OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

// Load the FIN Master Map GeoJSON
fetch('fin-master-map.geojson')
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      onEachFeature: function (feature, layer) {
        const meterName = feature.properties.name || "Unnamed Meter";
        const meterNumber = feature.properties.number || "Unknown Number";
        layer.bindPopup(`<strong>${meterName}</strong><br>Meter No: ${meterNumber}`);

        layer.on('click', function () {
          document.getElementById('meterName').value = meterName;
          document.getElementById('meterNumber').value = meterNumber;

          if (feature.geometry && feature.geometry.coordinates) {
            const coords = feature.geometry.coordinates;
            document.getElementById('gps').value = `${coords[1]}, ${coords[0]}`;
          }
        });
      }
    }).addTo(map);
  })
  .catch(err => console.error("Error loading FIN Master Map:", err));

// Handle manual GPS capture
document.getElementById('getLocation').addEventListener('click', function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      document.getElementById('gps').value =
        `${position.coords.latitude}, ${position.coords.longitude}`;
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});

// Handle adding readings
document.getElementById('readingForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const meterName = document.getElementById('meterName').value;
  const meterNumber = document.getElementById('meterNumber').value;
  const reading = document.getElementById('reading').value;
  const gps = document.getElementById('gps').value;
  const photo = document.getElementById('photo').files[0];
  const date = new Date().toLocaleString();

  const table = document.getElementById('readings-table').getElementsByTagName('tbody')[0];
  const newRow = table.insertRow();

  newRow.insertCell(0).innerText = meterName;
  newRow.insertCell(1).innerText = meterNumber;
  newRow.insertCell(2).innerText = reading;
  newRow.insertCell(3).innerText = gps;
  newRow.insertCell(4).innerText = date;

  if (photo) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = document.createElement('img');
      img.src = event.target.result;
      img.width = 50;
      newRow.insertCell(5).appendChild(img);
    };
    reader.readAsDataURL(photo);
  } else {
    newRow.insertCell(5).innerText = 'No Photo';
  }

  document.getElementById('readingForm').reset();
});
