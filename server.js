// Install required packages: express, body-parser 
// Don't forget to actually install these!
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mijnModule = require('mijn-npm-module'); // Importeer je NPM module

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// In-memory status data for the spacecraft
let spacecraftStatus = {
    power: "OFF",  // default power state
    speed: 0,      // default speed
    batteryPercentage: 100,  // Battery percentage
    fuel: 30,     // Fuel level
    activeSensors: {
        temperature: false, 
        camera: false
    },
    foundResources: []
};

// Handle spacecraft actions (POST request)
app.post('/action', (req, res) => {
    const { action, details } = req.body;

    switch (action) {
        case 'setPower':
            spacecraftStatus.power = details;
            if (details === "OFF") {
                spacecraftStatus.speed = 0;
                // Turn off all sensors when power is OFF
                Object.keys(spacecraftStatus.activeSensors).forEach(sensor => {
                    spacecraftStatus.activeSensors[sensor] = false;
                });
            }
            break;
        case 'updateSpeed':
            spacecraftStatus.speed = details;
            break;
        case 'refuel':
            spacecraftStatus.fuel = Math.min(100, spacecraftStatus.fuel + details); // Fuel cannot exceed 100
            break;
        case 'move':
            spacecraftStatus.speed = 10;
            break;
        case 'sleep':
            spacecraftStatus.power = 'OFF';
            spacecraftStatus.speed = 0;
            // Turn off all sensors when spacecraft is sleeping
            Object.keys(spacecraftStatus.activeSensors).forEach(sensor => {
                spacecraftStatus.activeSensors[sensor] = false;
            });
            break;
            case 'toggleSensor':
                if (details && spacecraftStatus.activeSensors.hasOwnProperty(details)) {
                    spacecraftStatus.activeSensors[details] = !spacecraftStatus.activeSensors[details];
                } else {
                    return res.status(400).json({ message: `Invalid sensor: ${details}` });
                }
                break;
            
        default:
            return res.status(400).json({ message: 'Unknown action' });
    }

    // Return spacecraft status including fuel and other details
    res.json({
        message: `Action ${action} executed successfully!`,
        spacecraftStatus: {
            power: spacecraftStatus.power,
            speed: spacecraftStatus.speed,
            fuel: spacecraftStatus.fuel,  // Make sure fuel is included
            batteryPercentage: spacecraftStatus.batteryPercentage, // You can modify this if needed
            activeSensors: spacecraftStatus.activeSensors,
            foundResources: spacecraftStatus.foundResources
        }
    });
});

// Route om willekeurige sensorwaarden en gevonden grondstoffen op te halen
app.get('/random-sensor', (req, res) => {
    try {
        const randomTemperature = mijnModule.generateRandomTemperature();
        const randomHumidity = mijnModule.generateRandomHumidity();
        const randomResource = mijnModule.generateRandomResource();

        res.json({
            temperature: randomTemperature,
            humidity: randomHumidity,
            resource: randomResource
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating random sensor data' });
    }
});

// Routes
// Serve the index.html from the public folder
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/status', (req, res) => {
    res.json({
        power: spacecraftStatus.power,
        speed: spacecraftStatus.speed,
        batteryPercentage: spacecraftStatus.batteryPercentage, // Use the actual battery value from spacecraftStatus
        fuel: spacecraftStatus.fuel, // Include the actual fuel value from spacecraftStatus
        activeSensors: spacecraftStatus.activeSensors,
        foundResources: spacecraftStatus.foundResources
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Spacecraft backend is running on http://localhost:${PORT}`);
});
