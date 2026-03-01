const API_KEY = "8c2de4af7409441e9e1102857262502";
let currentUnit = 'C'; 

// DOM Elements
const locationInput = document.getElementById("locationInput");
const searchBtn = document.getElementById("searchBtn");
const weatherResult = document.getElementById("weatherResult");
const loading = document.getElementById("loading");

// Event Listeners
searchBtn.addEventListener("click", () => fetchWeather(locationInput.value));
locationInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") fetchWeather(locationInput.value);
});
document.getElementById("geoBtn").addEventListener("click", getGeolocation);

// Toggle Units
document.querySelectorAll(".unit-toggle span").forEach(span => {
    span.addEventListener("click", (e) => {
        currentUnit = e.target.id === "unit-c" ? "C" : "F";
        document.querySelectorAll(".unit-toggle span").forEach(s => s.classList.remove("active"));
        e.target.classList.add("active");
        // Re-fetch or re-render if data exists
        if(locationInput.value) fetchWeather(locationInput.value);
    });
});

async function fetchWeather(query) {
    if (!query) return;
    
    showLoading(true);
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${query}&days=5&aqi=yes`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("City not found");
        const data = await response.json();
        renderWeather(data);
    } catch (err) {
        alert(err.message);
    } finally {
        showLoading(false);
    }
}

function renderWeather(data) {
    weatherResult.classList.remove("hidden");
    
    // Header Info
    document.getElementById("cityName").innerText = `${data.location.name}, ${data.location.region}`;
    document.getElementById("condition").innerText = data.current.condition.text;
    document.getElementById("weatherIcon").src = `https:${data.current.condition.icon}`;

    // Temperature Logic based on Unit
    const temp = currentUnit === 'C' ? data.current.temp_c : data.current.temp_f;
    document.getElementById("temperature").innerText = `${Math.round(temp)}°${currentUnit}`;

    // Details
    document.getElementById("humidity").innerText = `${data.current.humidity}%`;
    document.getElementById("wind").innerText = `${data.current.wind_kph} km/h`;
    document.getElementById("uv").innerText = data.current.uv;
    document.getElementById("aqi").innerText = data.current.air_quality["us-epa-index"];

    // Forecast
    const forecastCont = document.getElementById("forecast");
    forecastCont.innerHTML = data.forecast.forecastday.map(day => `
        <div class="forecast-card">
            <small>${new Date(day.date).toLocaleDateString('en', {weekday: 'short'})}</small>
            <img src="https:${day.day.condition.icon}" width="30">
            <div>${currentUnit === 'C' ? Math.round(day.day.maxtemp_c) : Math.round(day.day.maxtemp_f)}°</div>
        </div>
    `).join('');
}

function showLoading(isLoading) {
    loading.classList.toggle("hidden", !isLoading);
    weatherResult.classList.toggle("hidden", isLoading);
}

function getGeolocation() {
    navigator.geolocation.getCurrentPosition(
        pos => fetchWeather(`${pos.coords.latitude},${pos.coords.longitude}`),
        // () => alert("Location access denied")
    );
}