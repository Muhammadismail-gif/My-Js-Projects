// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const locationNameElement = document.getElementById('location-name');
    const currentTimeElement = document.getElementById('current-time');
    const currentTempElement = document.getElementById('current-temp');
    const currentDescriptionElement = document.getElementById('current-description');
    const currentWeatherIconElement = document.getElementById('current-weather-icon');
    const feelsLikeElement = document.getElementById('feels-like');
    const weatherSummaryElement = document.getElementById('weather-summary');
    const airQualityElement = document.getElementById('air-quality');
    const windElement = document.getElementById('wind');
    const humidityElement = document.getElementById('humidity');
    const visibilityElement = document.getElementById('visibility');
    const pressureElement = document.getElementById('pressure');
    const dewPointElement = document.getElementById('dew-point');
    const sunriseTimeElement = document.getElementById('sunrise-time');
    const daylightDurationElement = document.getElementById('daylight-duration');
    const sunsetTimeElement = document.getElementById('sunset-time');
    const moonriseTimeElement = document.getElementById('moonrise-time');
    const moonlightDurationElement = document.getElementById('moonlight-duration');
    const moonsetTimeElement = document.getElementById('moonset-time');
    const dailyForecastContainer = document.getElementById('daily-forecast-container');
    const hourlyGraphSvg = document.getElementById('hourly-graph-svg');
    const hourlyGraphPath = document.getElementById('hourly-graph-path');
    const hourlyLabelsContainer = document.getElementById('hourly-labels-container');
    const hourlyDetailsContainer = document.getElementById('hourly-details-container');
    const suggestionsContainer = document.getElementById('suggestions-container');
    const refreshButton = document.getElementById('refresh-button');
    const cityInput = document.getElementById('city-input');

    // --- Mock Weather Data ---
    // This data simulates what you would get from a weather API.
    // In a real application, you would make a fetch() request here.
    const mockWeatherData = {
        location: {
            city: "Washington",
            state: "DC",
            country: "USA"
        },
        current: {
            temperature: 62,
            description: "Partly Cloudy",
            icon: "cloud-sun", // Font Awesome icon name
            feelsLike: 60,
            summary: "Expect partly cloudy skies with a chance of light showers later. High will be 75°F.",
            airQuality: 45,
            wind: { speed: 7, direction: "NNE" },
            humidity: 68,
            visibility: 10,
            pressure: 29.98,
            dewPoint: 55
        },
        astronomy: {
            sunrise: "6:15 AM",
            sunset: "7:45 PM",
            daylightDuration: "13 hr 30 min",
            moonrise: "10:00 AM",
            moonset: "1:00 AM",
            moonlightDuration: "15 hr 00 min"
        },
        dailyForecast: [
            { day: "Today", icon: "cloud-sun", high: 75, low: 58 },
            { day: "Sat 27", icon: "cloud", high: 72, low: 56 },
            { day: "Sun 28", icon: "cloud-showers-heavy", high: 68, low: 54 },
            { day: "Mon 29", icon: "sun", high: 78, low: 60 },
            { day: "Tue 30", icon: "cloud-sun-rain", high: 70, low: 55 },
            { day: "Wed 31", icon: "cloud-bolt", high: 65, low: 52 },
            { day: "Thu 1", icon: "sun", high: 77, low: 59 }
        ],
        hourlyForecast: [
            { time: "Now", temp: 62, precip: 10 },
            { time: "3 AM", temp: 60, precip: 5 },
            { time: "5 AM", temp: 59, precip: 5 },
            { time: "7 AM", temp: 65, precip: 10 },
            { time: "9 AM", temp: 70, precip: 15 },
            { time: "11 AM", temp: 73, precip: 20 },
            { time: "1 PM", temp: 75, precip: 25 },
            { time: "3 PM", temp: 72, precip: 30 },
            { time: "5 PM", temp: 68, precip: 35 },
            { time: "7 PM", temp: 64, precip: 40 },
            { time: "9 PM", temp: 61, precip: 45 },
            { time: "11 PM", temp: 58, precip: 50 }
        ],
        suggestions: [
            { icon: "umbrella", title: "Umbrella", description: "Might need later" },
            { icon: "tshirt", title: "Clothing", description: "Light jacket recommended" },
            { icon: "sun", title: "Sunscreen", description: "High UV index" },
            { icon: "wind", title: "Wind chill", description: "Mild" }
        ]
    };

    // --- Helper Functions ---

    /**
     * Formats the current time for display.
     * @returns {string} Formatted time (e.g., "1:00 PM").
     */
    const formatCurrentTime = () => {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const strMinutes = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${strMinutes} ${ampm}`;
    };

    /**
     * Maps a weather description to a Font Awesome icon class.
     * @param {string} description - The weather description (e.g., "clear", "cloud-sun").
     * @returns {string} Font Awesome icon class.
     */
    const getWeatherIconClass = (description) => {
        switch (description.toLowerCase()) {
            case 'clear':
            case 'sun':
                return 'fas fa-sun text-yellow-500';
            case 'partly cloudy':
            case 'cloud-sun':
                return 'fas fa-cloud-sun text-yellow-500';
            case 'cloudy':
            case 'cloud':
                return 'fas fa-cloud text-gray-500';
            case 'light rain':
            case 'cloud-showers-heavy':
                return 'fas fa-cloud-showers-heavy text-blue-500';
            case 'rain':
            case 'cloud-sun-rain':
                return 'fas fa-cloud-sun-rain text-blue-500';
            case 'thunderstorm':
            case 'cloud-bolt':
                return 'fas fa-cloud-bolt text-gray-500';
            case 'snow':
                return 'fas fa-snowflake text-blue-300';
            default:
                return 'fas fa-question text-gray-500';
        }
    };

    /**
     * Generates the SVG path for the hourly temperature graph.
     * @param {Array<Object>} hourlyData - Array of hourly forecast objects.
     * @param {number} svgWidth - Width of the SVG viewBox.
     * @param {number} svgHeight - Height of the SVG viewBox.
     * @returns {string} SVG path 'd' attribute string.
     */
    const generateGraphPath = (hourlyData, svgWidth, svgHeight) => {
        if (!hourlyData || hourlyData.length === 0) return "";

        const temps = hourlyData.map(h => h.temp);
        const minTemp = Math.min(...temps);
        const maxTemp = Math.max(...temps);

        // Normalize temperature to SVG Y-coordinate (inverted, higher temp = lower Y)
        // Add padding so graph doesn't touch top/bottom
        const yPadding = 20;
        const yRange = (svgHeight - 2 * yPadding);
        const tempRange = (maxTemp - minTemp) === 0 ? 1 : (maxTemp - minTemp); // Avoid division by zero

        const points = hourlyData.map((data, index) => {
            const x = (index / (hourlyData.length - 1)) * svgWidth;
            const y = svgHeight - yPadding - ((data.temp - minTemp) / tempRange) * yRange;
            return { x, y, temp: data.temp };
        });

        // Create smooth curve using cubic Bezier
        let pathD = `M${points[0].x},${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];

            // Control points for a smooth curve
            const cp1x = p1.x + (p2.x - p1.x) / 2;
            const cp1y = p1.y;
            const cp2x = p1.x + (p2.x - p1.x) / 2;
            const cp2y = p2.y;

            pathD += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
        }

        // Add points for the fill area (close the path to the bottom)
        pathD += ` L${points[points.length - 1].x},${svgHeight} L${points[0].x},${svgHeight} Z`;

        // Add circles for each point on the graph
        hourlyGraphSvg.querySelectorAll('.graph-point').forEach(point => point.remove()); // Clear existing points
        points.forEach(point => {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("class", "graph-point");
            circle.setAttribute("cx", point.x);
            circle.setAttribute("cy", point.y);
            circle.setAttribute("r", "4"); // Radius of the circle
            hourlyGraphSvg.appendChild(circle);

            // Add temperature labels above points
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", point.x);
            text.setAttribute("y", point.y - 10); // Position above the circle
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("fill", "#2d3748"); // Dark text color
            text.setAttribute("font-size", "10");
            text.setAttribute("font-weight", "bold");
            text.textContent = `${point.temp}°`;
            hourlyGraphSvg.appendChild(text);
        });

        return pathD;
    };


    /**
     * Updates the UI with the provided weather data.
     * @param {Object} data - The weather data object.
     */
    const updateUI = (data) => {
        // Update Location
        locationNameElement.textContent = `${data.location.city}, ${data.location.state}`;

        // Update Current Weather
        currentTimeElement.textContent = formatCurrentTime();
        currentTempElement.textContent = `${data.current.temperature}°F`;
        currentDescriptionElement.textContent = data.current.description;
        currentWeatherIconElement.className = getWeatherIconClass(data.current.icon);
        feelsLikeElement.textContent = `Feels like ${data.current.feelsLike}°`;
        weatherSummaryElement.textContent = data.current.summary;

        airQualityElement.textContent = data.current.airQuality;
        windElement.innerHTML = `${data.current.wind.speed} mph <i class="fas fa-long-arrow-alt-up transform rotate-45"></i>`; // Example static icon
        humidityElement.textContent = `${data.current.humidity}%`;
        visibilityElement.textContent = `${data.current.visibility} mi`;
        pressureElement.textContent = `${data.current.pressure} in`;
        dewPointElement.textContent = `${data.current.dewPoint}°`;

        // Update Sun/Moon
        sunriseTimeElement.textContent = data.astronomy.sunrise;
        daylightDurationElement.textContent = data.astronomy.daylightDuration;
        sunsetTimeElement.textContent = data.astronomy.sunset;
        moonriseTimeElement.textContent = data.astronomy.moonrise;
        moonlightDurationElement.textContent = data.astronomy.moonlightDuration;
        moonsetTimeElement.textContent = data.astronomy.moonset;

        // Update 10 Day Forecast
        dailyForecastContainer.innerHTML = ''; // Clear previous cards
        data.dailyForecast.forEach(day => {
            const card = document.createElement('div');
            card.className = 'flex flex-col items-center p-3 bg-gray-100 rounded-lg shadow-inner';
            card.innerHTML = `
                <span class="text-sm text-gray-500">${day.day}</span>
                <i class="${getWeatherIconClass(day.icon)} text-2xl my-2"></i>
                <span class="text-gray-800 font-semibold">${day.high}°</span>
                <span class="text-gray-500 text-sm">${day.low}°</span>
            `;
            dailyForecastContainer.appendChild(card);
        });

        // Update Hourly Forecast Graph
        const svgWidth = hourlyGraphSvg.viewBox.baseVal.width;
        const svgHeight = hourlyGraphSvg.viewBox.baseVal.height;
        hourlyGraphPath.setAttribute('d', generateGraphPath(data.hourlyForecast, svgWidth, svgHeight));

        // Update Hourly Labels
        hourlyLabelsContainer.innerHTML = '';
        data.hourlyForecast.forEach(hour => {
            const span = document.createElement('span');
            span.textContent = hour.time;
            hourlyLabelsContainer.appendChild(span);
        });

        // Update Hourly Details
        hourlyDetailsContainer.innerHTML = '';
        data.hourlyForecast.forEach(hour => {
            const div = document.createElement('div');
            div.className = 'flex flex-col items-center';
            div.innerHTML = `
                <span class="text-gray-800 font-semibold">${hour.temp}°</span>
                <span class="text-gray-500">${hour.precip}%</span>
            `;
            hourlyDetailsContainer.appendChild(div);
        });

        // Update Suggestions
        suggestionsContainer.innerHTML = '';
        data.suggestions.forEach(suggestion => {
            const div = document.createElement('div');
            div.className = 'flex items-center space-x-4';
            div.innerHTML = `
                <i class="fas fa-${suggestion.icon} text-blue-500 text-2xl"></i>
                <div class="flex flex-col">
                    <span class="text-gray-800 font-semibold">${suggestion.title}</span>
                    <span class="text-gray-500 text-sm">${suggestion.description}</span>
                </div>
            `;
            suggestionsContainer.appendChild(div);
        });
    };

    // --- Event Listeners ---

    // Initial load of data
    updateUI(mockWeatherData);

    // Refresh button functionality (simulates re-fetching data)
    refreshButton.addEventListener('click', () => {
        // In a real app, you'd call a function to fetch new data here
        // For now, we'll just re-render with the existing mock data
        updateUI(mockWeatherData);
        console.log("Weather data refreshed!");
    });

    // City input change (simulates fetching data for a new city)
    cityInput.addEventListener('change', (event) => {
        const newCity = event.target.value;
        // In a real app, you'd fetch data for `newCity`
        // For this mock, we'll just update the location name and re-render
        mockWeatherData.location.city = newCity;
        updateUI(mockWeatherData);
        console.log(`City changed to: ${newCity}`);
    });

    // Handle window resize for responsive graph
    window.addEventListener('resize', () => {
        const svgWidth = hourlyGraphSvg.clientWidth; // Get actual rendered width
        const svgHeight = hourlyGraphSvg.clientHeight; // Get actual rendered height
        hourlyGraphSvg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
        hourlyGraphPath.setAttribute('d', generateGraphPath(mockWeatherData.hourlyForecast, svgWidth, svgHeight));
    });

    // Initial graph resize on load to ensure it fits
    window.dispatchEvent(new Event('resize'));
});
