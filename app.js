import { CONFIG } from './config.js';
const BASE_URL = `https://api.openweathermap.org/data/2.5/weather?&appid=${CONFIG.WEATHER_API_KEY}&units=metric&q=`;

const cityName = document.getElementById('location-input');
const searchButton = document.getElementById('search-btn');
const weatherIcon = document.getElementById('weather-icon');
const locationBtn = document.getElementById('locationBtn');
const weatherInfo = document.getElementById('weatherInfo');

function getWeatherIcon(condition) {
  switch (condition) {
    case "Clear":
      return "images/weather-icons/clear.png";
    case "Clouds":
      return "images/weather-icons/clouds.png";
    case "Drizzle":
      return "images/weather-icons/drizzle.png";
    case "Rain":
    case "Mist":
      return "images/weather-icons/mist.png";
    case "Snow":
      return "images/weather-icons/snow.png";
    default:
      return "images/weather-icons/default.png";
  }
}

async function checkWeather(city){
    const response = await fetch(BASE_URL + city);
    document.getElementsByClassName('error')[0].style.display = 'block';
    document.getElementsByClassName('error')[0].innerHTML = "Wait a sec, your location's data will be displayed soon!";

    if (response.status == 404) {
        document.getElementsByClassName('error')[0].style.display = 'block';
        document.getElementsByClassName('error')[0].innerHTML = "City not found! Please enter a valid city name.";
        document.getElementsByClassName('error')[0].style.color = 'red';
        document.getElementById('weather-container').style.display = 'none';       
    } else {
      const data = await response.json();
      document.getElementById('weather-container').style.display = 'block';
      document.getElementsByClassName('error')[0].style.display = 'none';
      localStorage.setItem('lastCity', city);
      document.querySelector('#city').innerHTML = data.name;
      document.querySelector("#temperature").innerHTML = Math.round(data.main.temp) + "°C";
      document.querySelector("#humidity").innerHTML = data.main.humidity + "%";
      document.querySelector("#wind").innerHTML = data.wind.speed + "km/h";
      document.getElementById('weather-description').innerHTML = data.weather[0].description;
      const weatherCondition = data.weather[0].main;
      weatherIcon.src = getWeatherIcon(weatherCondition);
    }
}

function get5DayForecast(lat, lon) {
    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${CONFIG.WEATHER_API_KEY}&units=metric`
    )
      .then(res => res.json())
      .then(data => {
        display5DayForecast(data.list);
      })
      .catch(() => {
        weatherInfo.innerHTML = 'Error fetching forecast data.';
    });
}

function display5DayForecast(forecast) {
    let forecastHTML = '<div class="forecast"><h3>Your location&apos;s next 5 days forecast:</h3><div class="forecast-container">';
        
    forecast.forEach((entry, index) => {
      if (index % 8 === 0) {  
        const condition = entry.weather[0].main;
        const iconSrc = getWeatherIcon(condition);
        forecastHTML += `
          <div class="forecast-item">
            <p id="date"><strong>${new Date(entry.dt * 1000).toLocaleDateString()}</strong></p>
            <img loading="lazy" id="weather-icon" src="${iconSrc}" alt="${condition} icon">
            <div class="temperature-container">
              <p id="temperature"><strong>Temp:</strong> ${Math.round(entry.main.temp)} °C</p>
              <p id="weather-description"><strong>Weather:</strong> ${entry.weather[0].description}</p>
            </div>
          </div>
        `;
      }
    });
    
    forecastHTML += '</div></div>';
    weatherInfo.innerHTML += forecastHTML;
}

function getWeatherByCoords(lat, lon) {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${CONFIG.WEATHER_API_KEY}&units=metric`
    )
      .then(res => res.json())
      .then(data => {
        displayWeather(data);
        get5DayForecast(lat, lon);
      })
      .catch(() => {
        weatherInfo.innerHTML = 'Error fetching data.';
      });
}

function displayWeather(data) {
  const weatherCondition = data.weather[0].main;
  const iconSrc = getWeatherIcon(weatherCondition);

  weatherInfo.innerHTML = `
    <h2 class="city">${data.name}, ${data.sys.country}</h2>

    <div class="current-weather">
      <img loading="lazy" id="weather-icon" src="${iconSrc}" alt="Weather icon">
      <div class="temperature-container">
        <h3 id="temperature"> ${Math.round(data.main.temp)} °C</h3>
        <p id="weather-description">${data.weather[0].description}</p>
      </div>
    </div>

    <div class="weather-details">
      <div class="detail">
        <img loading="lazy" id="humidity-icon" src="/images/humidity.png" alt="Humidity icon">
        <span class="label">Humidity</span>
        <p> ${data.main.humidity}%</p>
      </div>
      <div class="detail">
        <img loading="lazy" id="wind-icon" src="/images/wind.png" alt="Wind icon">
        <span class="label">Wind</span>
        <p> ${data.wind.speed} m/s</p>
      </div>
    </div>
  `;
}

// Search event listeners
cityName.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkWeather(cityName.value);
});

searchButton.addEventListener('click', () => {
    checkWeather(cityName.value);
});

// Geolocation button
locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          getWeatherByCoords(latitude, longitude);
        },
        () => {
          weatherInfo.innerHTML = 'Unable to retrieve location.';
        }
      );
    } else {
      weatherInfo.innerHTML = 'Geolocation not supported.';
    }
});

// Ask for geolocation or manual search on load
window.onload = () => {
  const lastCity = localStorage.getItem('lastCity');

  const userChoice = confirm("Would you like to use your current location to get weather updates?");
  if (userChoice && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        getWeatherByCoords(latitude, longitude);
      },
      () => {
        // Geolocation failed, fallback to last searched city
        if (lastCity) {
          checkWeather(lastCity);
        } else {
          weatherInfo.innerHTML = 'Unable to retrieve location.';
        }
      }
    );
  } else {
    // Even if user declines geolocation, show last searched city if available
    if (lastCity) {
      checkWeather(lastCity);
    } else {
      weatherInfo.innerHTML = "Please search for a city to get started.";
    }
  }
};


// Service worker
if('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
    .then(() => console.log('Service worker registered'))
    .catch(err => console.log('Service worker not registered', err));
  });
}
