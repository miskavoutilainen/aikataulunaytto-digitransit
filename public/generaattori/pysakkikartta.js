var map = L.map('map').setView([62.600, 29.763], 10);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// HAKUKENTTÄ
const provider = new window.GeoSearch.OpenStreetMapProvider();

document.getElementById('search-button').addEventListener('click', async function() {
    const query = document.getElementById('search-input').value;
    const results = await provider.search({ query });

    if (results.length > 0) {
        const { x, y, label } = results[0]; // Koordinaatit ja nimi
        map.setView([y, x], 14);
    }
});




// MARKKERIT
var markersCanvas = new L.MarkersCanvas().addTo(map);

// määritellään pysäkin/aseman ikonin asetukset
var icon = L.icon({
    iconUrl: '../kuvat/pysakki.png',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

// haetaan tiedot kaikista pysäkeistä/asemista nodejs API:n kautta. Se hakee tiedot digitransitin API:sta.
async function fetchStops() {
    try {
        const response = await fetch('/api/all-stops');
        const stops = await response.json();
        return stops;
    } catch (error) {
        console.error("Virhe ladattaessa pysäkkitietoja:", error);
        return [];
    }
}

// lisätään pysäkit/asemat kartalle
async function addStopsToMap() {
    const stops = await fetchStops();
    let markers = [];
    
    stops.forEach(stop => {
        // var marker = L.marker([stop.lat, stop.lon], {icon: icon}).bindPopup(`Nimi: ${stop.name}, ID: ${stop.gtfsId} (Zone: ${stop.zoneId})`);
        var marker = L.marker([stop.lat, stop.lon], {icon: icon}).bindPopup(`<b>Pysäkki valittu!</b><br> ${stop.name} / ID: ${stop.gtfsId}`);
        marker.mydata = {
            name: stop.name,
            gtfsId: stop.gtfsId,
            zoneId: stop.zoneId
        };
        
        // klikkaus eventti pysäkille, vie tiedot pysäkistä konsoliin ja stopId-select kenttään.
        marker.on('click', function() {
            const clickedData = marker.mydata;
            console.log(`Klikattu pysäkki: ${clickedData.name}, ID: ${clickedData.gtfsId}, Zone: ${clickedData.zoneId}`);
            document.getElementById('stopId-select').value = clickedData.gtfsId;
        });

        markers.push(marker);
    });
    
    markersCanvas.addMarkers(markers);  // lisätään markkerit canvasiin
}

addStopsToMap();