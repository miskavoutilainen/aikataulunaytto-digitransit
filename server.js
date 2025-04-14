const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static("public"));

const API_KEY = process.env.DIGITRANSIT_API_KEY;

// API-reitti käyttäjän valitsemille pysäkeille
app.get("/api/custom-stops", async (req, res) => {
    try {
        const selectedStopIds = req.query.stops?.split(",") || [];
        if (selectedStopIds.length === 0) {
            return res.status(400).json({ error: "Ei valittuja pysäkkejä" });
        }
        
        const selectedStyle = req.query.style || "dark";
        const selectedHours = Number(req.query.hours) || 2;
        const selectedClock = req.query.clock || false;

        console.log("Vastaanotettu kysely seuraavilla parametreillä:", req.query);

        const now = Math.floor(Date.now() / 1000);

        // Haetaan aikataulut vain valituille pysäkeille
        const stopsQuery = `{
            stops(ids: [${selectedStopIds.map(id => `"${id}"`).join(",")}]) {
                gtfsId
                name
                stoptimesWithoutPatterns(startTime: ${now}, timeRange: ${selectedHours * 3600}, numberOfDepartures: 100) {
                    scheduledDeparture
                    realtimeDeparture
                    trip {
                        route {
                            shortName
                            longName
                        }
                    }
                    headsign
                }
            }
        }`;

        const response = await axios.post(
            "https://api.digitransit.fi/routing/v2/finland/gtfs/v1",
            { query: stopsQuery },
            {
                headers: {
                    "Content-Type": "application/json",
                    "digitransit-subscription-key": API_KEY
                }
            }
        );

        res.json(response.data.data.stops);
        //console.log(response.data.data.stops);
    } catch (error) {
        console.error("Virhe haettaessa pysäkkitietoja:", error);
        res.status(500).json({ error: "Tietojen haku epäonnistui" });
    }
});


// API-reitti KAIKILLE pysäkeille
app.get("/api/all-stops", async (req, res) => {
    try {
        console.log("Vastaanotettu kysely seuraavilla parametreillä:", req.query);

        // Haetaan kaikki pysäkit
        const stopsQuery = `{
            stops {
                gtfsId
                name
                lat
                lon
                zoneId
            }
        }`;

        const response = await axios.post(
            "https://api.digitransit.fi/routing/v2/finland/gtfs/v1",
            { query: stopsQuery },
            {
                headers: {
                    "Content-Type": "application/json",
                    "digitransit-subscription-key": API_KEY
                }
            }
        );

        res.json(response.data.data.stops);
        //console.log(response.data.data.stops);
    } catch (error) {
        console.error("Virhe haettaessa pysäkkitietoja:", error);
        res.status(500).json({ error: "Tietojen haku epäonnistui" });
    }
});




// haetaan pysäkit kartalle
// app.get("/api/map-tiles/:z/:x/:y.pbf", async (req, res) => {
//     try {
//         const { z, x, y } = req.params;
//         const tileUrl = `https://cdn.digitransit.fi/map/v3/finland/fi/stops,stations/${z}/${x}/${y}.pbf?digitransit-subscription-key=${API_KEY}`;

//         const response = await axios.get(tileUrl, { responseType: "arraybuffer" });

//         res.setHeader("Content-Type", "application/x-protobuf");
//         res.send(response.data);
//     } catch (error) {
//         console.error("Virhe ladattaessa vektoritiiliä:", error);
//         res.status(500).json({ error: "Tietojen haku epäonnistui" });
//     }
// });








app.listen(PORT, () => console.log(`Palvelin käynnissä: http://localhost:${PORT}`));
