const API_BASE_URL = 'http://localhost:3000';

async function fetchStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/status`);
        const status = await response.json();

        // Display sensor status (on/off)
        const activeSensorsText = Object.keys(status.activeSensors).map(sensor => {
            return `${sensor}: ${status.activeSensors[sensor] ? 'ON' : 'OFF'}`;
        }).join(', ');

        const activeSensorsElement = document.getElementById('activeSensors');
        if (activeSensorsElement) {
            activeSensorsElement.textContent = `Active Sensors: ${activeSensorsText}`;
        }

        // Update the spacecraft's power, speed, and fuel
        const powerElement = document.getElementById('power');
        const powerStatus = status.power;
        if (powerElement) {
            powerElement.getElementsByTagName("span")[0].textContent = powerStatus;
        }
        
        // Add or remove the 'off' class based on the power status
        if (powerStatus === 'OFF') {
            powerElement.classList.add('off'); // Turn the power status text red
            disableAllElements();  // Disable all elements if power is OFF
        } else {
            powerElement.classList.remove('off'); // Keep it green when ON
            enableAllElements();  // Enable all elements if power is ON
        }

        // Update other status details
        if (document.getElementById('speed')) {
            document.getElementById('speed').textContent = `Speed: ${status.speed}`;
        }
        
        if (document.getElementById('batteryPercentage')) {
            document.getElementById('batteryPercentage').textContent = `Battery: ${status.batteryPercentage}%`; // Show battery percentage
        }

        if (document.getElementById('fuel')) {
            document.getElementById('fuel').textContent = `Fuel: ${status.fuel}`; // Show fuel level
        }

        // Display found resources
        const foundResourcesElement = document.getElementById('foundResources');
        if (foundResourcesElement) {
            foundResourcesElement.textContent = `Found Resources: ${status.foundResources.join(', ')}`;
        }

        // Ensure the details input is properly managed based on the action
        toggleDetailsInput();

    } catch (error) {
        console.error('Error fetching status:', error);
    }
}


// Function to fetch and update random sensor data
async function fetchRandomSensorData() {
    try {
        const response = await fetch(`${API_BASE_URL}/random-sensor`);
        const data = await response.json();

        // Update the UI with the random sensor values
        document.getElementById('randomTemperature').textContent = `Temperature: ${data.temperature}°C`;
        document.getElementById('randomHumidity').textContent = `Humidity: ${data.humidity}%`;
        document.getElementById('randomResource').textContent = `Found Resource: ${data.resource}`;
    } catch (error) {
        console.error('Error fetching random sensor data:', error);
    }
}

// Function to disable all interactive elements except for power toggle
function disableAllElements() {
    const elementsToDisable = [
        'speedInput', 
        'fuelInput', 
        'actionSelect', 
        'detailsInput', 
        'submitActionButton'
    ];

    elementsToDisable.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.disabled = true;
        }
    });

    // Specifically disable the 'Toggle Sensor' option in actionSelect
    const actionSelect = document.getElementById('actionSelect');
    if (actionSelect) {
        const toggleSensorOption = Array.from(actionSelect.options).find(option => option.value === 'toggleSensor');
        if (toggleSensorOption) {
            toggleSensorOption.disabled = true;
        }
    }
}

// Function to enable all interactive elements
function enableAllElements() {
    const elementsToEnable = [
        'speedInput', 
        'fuelInput', 
        'actionSelect', 
        'detailsInput', 
        'submitActionButton'
    ];

    elementsToEnable.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.disabled = false;
        }
    });

    const actionSelect = document.getElementById('actionSelect');
    if (actionSelect) {
        const toggleSensorOption = Array.from(actionSelect.options).find(option => option.value === 'toggleSensor');
        if (toggleSensorOption) {
            toggleSensorOption.disabled = false;
        }
    }
}

function toggleDetailsInput() {
    const action = document.getElementById('actionSelect').value;
    const detailsInput = document.getElementById('detailsInput');

    if (action === 'toggleSensor' && document.getElementById('power').classList.contains('off') === false) {
        detailsInput.disabled = false;
    } else {
        detailsInput.disabled = true;
    }
}

document.getElementById('actionSelect').addEventListener('change', function() {
    toggleDetailsInput(); 
});

// Update de snelheid van het ruimtevoertuig
async function updateSpeed() {
    const speed = document.getElementById('speedInput').value;
    if (speed) {
        try {
            const response = await fetch(`${API_BASE_URL}/action`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'updateSpeed',
                    details: parseInt(speed) 
                })
            });

            const result = await response.json();
            console.log(result);  // Log de server response
            fetchStatus();        // Haal de nieuwe status op na de actie
        } catch (error) {
            console.error('Error updating speed:', error);
        }
    }
}

// Refuel the spacecraft to the desired amount
async function refuel() {
    const fuelAmount = document.getElementById('fuelInput').value;
    if (fuelAmount) {
        try {
            const response = await fetch(`${API_BASE_URL}/action`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'refuel',
                    details: parseInt(fuelAmount) // Add fuel as an integer
                })
            });

            const result = await response.json();
            console.log(result);  // Log the server response

            // Fetch status without resetting the speed
            fetchStatus();

        } catch (error) {
            console.error('Error refueling spacecraft:', error);
        }
    }
}

// Zet de powerstatus van het ruimtevoertuig
async function setPower() {
    const powerState = document.getElementById('powerInput').value;
    try {
        const response = await fetch(`${API_BASE_URL}/action`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'setPower',
                details: powerState // Power state (ON/OFF) verzenden
            })
        });

        const result = await response.json();
        console.log(result);  // Log de server response

        // Update the power indicator based on the new power state
        const powerElement = document.getElementById('power');
        const powerText = powerElement.getElementsByTagName("span")[0];

        if (powerState === "OFF") {
            powerElement.classList.add("off"); // Add "off" class
            powerText.textContent = "OFF";
        } else {
            powerElement.classList.remove("off"); // Remove "off" class
            powerText.textContent = "ON";
        }

        fetchStatus(); // Haal de nieuwe status op na de actie
    } catch (error) {
        console.error('Error setting power:', error);
    }
}

document.getElementById('actionSelect').addEventListener('change', function() {
    const detailsInput = document.getElementById('detailsInput');
    const action = this.value;
    
    if (action === 'toggleSensor') {
        detailsInput.disabled = false;
    } else {
        detailsInput.disabled = true;
    }
});

let speed = 0; // Default speed

function submitAction() {
    const action = document.getElementById('actionSelect').value;
    
    switch(action) {
        case 'move':
            moveForward();
            break;
        case 'moveBackward':
            moveBackward();
            break;
        case 'turnLeft':
            turnLeft();
            break;
        case 'turnRight':
            turnRight();
            break;
        case 'sleep':
            putToSleep();
            break;
        case 'toggleSensor':
            toggleSensor();
            break;
        default:
            console.log("No action selected.");
    }
}

function updateSpeedDisplay() {
    document.getElementById('speed').textContent = `Speed: ${speed}`;
}

function updateSpeed() {
    let speedInput = parseInt(document.getElementById('speedInput').value, 10);
    if (isNaN(speedInput)) {
        speedInput = 0; // If input is not a number, set speed to 0
    }

    // Ensure the speed doesn't exceed 100 or go below -100
    if (speedInput > 100) {
        speedInput = 100;
    } else if (speedInput < -100) {
        speedInput = -100;
    }
    
    speed = speedInput;
    console.log(`Speed updated to: ${speed}`);
    updateSpeedDisplay(); // Update the speed display on the webpage
}

function moveForward() {
    if (speed < 0) {
        speed = Math.abs(speed); // Convert negative speed to positive
    } else if (speed === 0) {
        speed = 10; // Set speed to 10 if it was previously 0
    } else if (speed < 100) {
        speed += 10; // Increase speed by 10, but do not exceed 100
    }
    speed = Math.min(speed, 100); // Cap the speed at 100
    console.log(`Moving forward. Current speed: ${speed}`);
    updateSpeedDisplay(); // Update the speed display on the webpage
}

function moveBackward() {
    if (speed > 0) {
        speed = -speed; // If speed is positive, make it negative
    } else {
        speed -= 10; // Decrease speed by 10 if it's already negative or 0
    }
    speed = Math.max(speed, -100); // Cap the speed at -100
    console.log(`Moving backward. Current speed: ${speed}`);
    updateSpeedDisplay(); // Update the speed display on the webpage
}

function turnLeft() {
    console.log("Turning left.");
}

function turnRight() {
    console.log("Turning right.");
}

function putToSleep() {
    console.log("Putting spacecraft to sleep.");
}

async function toggleSensor() {
    const sensorName = document.getElementById('detailsInput').value;
    console.log(`Toggling sensor: ${sensorName}`);

    try {
        const response = await fetch(`${API_BASE_URL}/action`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'toggleSensor',
                details: sensorName,  // Send the sensor name as a simple string
            }),
        });

        const result = await response.json();
        console.log('Sensor toggle result:', result);

        fetchStatus(); 
    } catch (error) {
        console.error('Error toggling sensor:', error);
    }
}

fetchStatus(); // Haal de status van het ruimtevoertuig op
fetchRandomSensorData(); // Haal de willekeurige sensorwaarden op
