class WeatherApp {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = "https://api.openweathermap.org/data/2.5/weather";
        this.forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";
    }

    async fetchWeather(city) {
        const url = `${this.baseUrl}?q=${city}&appid=${this.apiKey}&units=metric&lang=it`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Errore nella richiesta meteo");
        }

        return await response.json();
    }

    async fetchForecast(city) {
        const url = `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric&lang=it`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Errore nella richiesta previsioni");
        }

        return await response.json();
    }

    getWeatherEmoji(main) {
        switch (main.toLowerCase()) {
            case "clear": return "☀️";
            case "clouds": return "☁️";
            case "rain": return "🌧️";
            case "drizzle": return "🌦️";
            case "thunderstorm": return "⛈️";
            case "snow": return "❄️";
            case "mist":
            case "fog":
            case "haze": return "🌫️";
            default: return "🌍";
        }
    }

    async displayAll(city) {
        try {
            const weatherData = await this.fetchWeather(city);
            const forecastData = await this.fetchForecast(city);

            this.displayCurrent(weatherData);
            this.displayForecast(forecastData);

        } catch (error) {
            openModal();
        }
    }

    displayCurrent(data) {
        const emoji = this.getWeatherEmoji(data.weather[0].main);

        const temp = Math.round(data.main.temp);
        const feels = Math.round(data.main.feels_like);
        const min = Math.round(data.main.temp_min);
        const max = Math.round(data.main.temp_max);

        document.getElementById("weatherCard").innerHTML = `
            <h2 class="mb-3">
                <span class="pulse">${emoji}</span> ${data.name}
            </h2>
            <h1 class="display-4 fw-bold">${temp}°C</h1>
            <p class="text-capitalize">${data.weather[0].description}</p>
            <hr>
            <div class="row">
                <div class="col">
                    <small>Percepita</small>
                    <div>${feels}°C</div>
                </div>
                <div class="col">
                    <small>Min</small>
                    <div>${min}°C</div>
                </div>
                <div class="col">
                    <small>Max</small>
                    <div>${max}°C</div>
                </div>
            </div>
        `;

        document.getElementById("extraInfo").innerHTML = `
            <li>💧 Umidità: ${data.main.humidity}%</li>
            <li>🌬️ Vento: ${data.wind.speed} m/s</li>
            <li>📊 Pressione: ${data.main.pressure} hPa</li>
        `;

        setGradient(data.weather[0].main);
    }

    displayForecast(data) {

        const forecastList = data.list
            .filter(item => item.dt_txt.includes("12:00:00"))
            .slice(0, 3);

        forecastList.forEach((giorno, index) => {

            const date = new Date(giorno.dt_txt);
            const giornoSettimana = date.toLocaleDateString("it-IT", {
                weekday: "long"
            });

            const emoji = this.getWeatherEmoji(giorno.weather[0].main);
            const temp = Math.round(giorno.main.temp);

            document.getElementById(`giorno${index + 1}`).innerHTML = `
                <h5 class="text-capitalize">${giornoSettimana}</h5>
                <div class="display-6">${emoji}</div>
                <p class="fw-bold">${temp}°C</p>
                <small class="text-capitalize">${giorno.weather[0].description}</small>
            `;
        });
    }
}


// Gradiente dinamico
function setGradient(main) {
    document.body.className = 'bg-' + main.toLowerCase();
}


// Modal errore
function openModal() {
    document.getElementById("modal-info").style.display = "flex";
}

function closeModal() {
    const modal = document.getElementById("modal-info");
    const input = document.getElementById("cityInput");

    modal.style.display = "none";
    input.value = "";
    input.focus();
}


// Inizializzazione
const app = new WeatherApp("a4eb06265240678714dbd41dbb257801");

const input = document.getElementById("cityInput");
const button = document.getElementById("searchBtn");

function searchCity() {
    const city = input.value.trim();
    if (city === "") return;

    app.displayAll(city);
}

button.addEventListener("click", searchCity);

input.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        searchCity();
    }
});