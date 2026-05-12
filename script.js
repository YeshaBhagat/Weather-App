const weatherForm = document.querySelector("#weatherForm");
const cityInput = document.querySelector("#cityInput");
const message = document.querySelector("#message");
const weatherCard = document.querySelector("#weatherCard");
const statusPill = document.querySelector("#statusPill");
const appShell = document.querySelector("#appShell");
const buttonText = document.querySelector("#buttonText");

const API_KEY = "ae8201ce9e221fda71bb7c8ad6dd69d9";

const fields = {
  cityName: document.querySelector("#cityName"),
  weatherCondition: document.querySelector("#weatherCondition"),
  weatherIcon: document.querySelector("#weatherIcon"),
  temperature: document.querySelector("#temperature"),
  feelsLike: document.querySelector("#feelsLike"),
  humidity: document.querySelector("#humidity"),
  windSpeed: document.querySelector("#windSpeed"),
  pressure: document.querySelector("#pressure"),
  visibility: document.querySelector("#visibility")
};

weatherForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (API_KEY === "PASTE_YOUR_OPENWEATHER_API_KEY_HERE") {
    showMessage("Please add your OpenWeatherMap API key in script.js first.", "error");
    return;
  }

  if (!city) {
    showMessage("Please enter a city name.", "error");
    cityInput.focus();
    return;
  }

  await fetchWeather(city);
});

async function fetchWeather(city) {
  setLoading(true);
  showMessage("Fetching current weather...", "success");

  const endpoint = new URL("https://api.openweathermap.org/data/2.5/weather");
  endpoint.searchParams.set("q", city);
  endpoint.searchParams.set("appid", API_KEY);
  endpoint.searchParams.set("units", "metric");

  try {
    const response = await fetch(endpoint);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(getErrorMessage(response.status, data));
    }

    renderWeather(data);
    showMessage("Weather updated successfully.", "success");
  } catch (error) {
    weatherCard.hidden = true;
    showMessage(error.message || "Something went wrong. Please try again.", "error");
  } finally {
    setLoading(false);
  }
}

function renderWeather(data) {
  const condition = data.weather?.[0]?.main || "Clear";
  const description = data.weather?.[0]?.description || condition;
  const icon = data.weather?.[0]?.icon;
  const country = data.sys?.country ? `, ${data.sys.country}` : "";

  fields.cityName.textContent = `${data.name}${country}`;
  fields.weatherCondition.textContent = description;
  fields.temperature.textContent = `${Math.round(data.main.temp)}°C`;
  fields.feelsLike.textContent = `Feels like ${Math.round(data.main.feels_like)}°C`;
  fields.humidity.textContent = `${data.main.humidity}%`;
  fields.windSpeed.textContent = `${data.wind.speed} m/s`;
  fields.pressure.textContent = `${data.main.pressure} hPa`;
  fields.visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;

  if (icon) {
    fields.weatherIcon.src = `https://openweathermap.org/img/wn/${icon}@4x.png`;
    fields.weatherIcon.alt = `${description} weather icon`;
  } else {
    fields.weatherIcon.removeAttribute("src");
    fields.weatherIcon.alt = "";
  }

  updateWeatherTheme(condition);
  weatherCard.hidden = false;
}

function updateWeatherTheme(condition) {
  const themeClasses = [
    "weather-clear",
    "weather-clouds",
    "weather-rain",
    "weather-drizzle",
    "weather-thunderstorm",
    "weather-snow",
    "weather-mist"
  ];

  appShell.classList.remove(...themeClasses);

  const normalized = condition.toLowerCase();
  const theme = ["mist", "smoke", "haze", "dust", "fog", "sand", "ash", "squall", "tornado"].includes(normalized)
    ? "weather-mist"
    : `weather-${normalized}`;

  appShell.classList.add(themeClasses.includes(theme) ? theme : "weather-clear");
}

function getErrorMessage(status, data) {
  if (status === 401) {
    return "Invalid API key. Please check your OpenWeatherMap key.";
  }

  if (status === 404) {
    return "City not found. Please check the spelling and try again.";
  }

  if (status === 429) {
    return "API limit reached. Please wait a while and try again.";
  }

  return data?.message ? `Unable to fetch weather: ${data.message}` : "Unable to fetch weather right now.";
}

function showMessage(text, type) {
  message.textContent = text;
  message.classList.toggle("success", type === "success");
}

function setLoading(isLoading) {
  const button = weatherForm.querySelector("button");
  button.disabled = isLoading;
  buttonText.textContent = isLoading ? "Loading..." : "Search";
  statusPill.textContent = isLoading ? "Loading" : "Ready";
}
