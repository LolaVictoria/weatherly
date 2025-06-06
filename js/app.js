import { CONFIG } from '../config.js';
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
      return "images/weather-icons/drizzle.png";
    case "Mist":
      return "images/weather-icons/mist.png";
    case "Snow":
      return "images/weather-icons/snow.png";
    default:
      return "images/weather-icons/default.png";
  }
}
//Search for weather by city name
async function checkWeatherBySearch(city){
    if(city.length == 0) {
        document.getElementsByClassName('error')[0].style.display = 'block';
        document.getElementsByClassName('error')[0].innerHTML = "Please enter a city name!";
        document.getElementsByClassName('error')[0].style.color = 'red';
        document.getElementById('weather-container').style.display = 'none'; 
        return;
    }
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
      document.getElementById('city').innerHTML = data.name;
      document.getElementById('date').innerHTML = new Date(data.dt * 1000).toLocaleDateString();
      document.getElementById("temperature").innerHTML = Math.round(data.main.temp) + "°C";
      document.getElementById("humidity").innerHTML = data.main.humidity + "%";
      document.getElementById("wind").innerHTML = data.wind.speed + "m/s";
      document.getElementById('weather-description').innerHTML = data.weather[0].description;
      const weatherCondition = data.weather[0].main;
      weatherIcon.src = getWeatherIcon(weatherCondition);
    }
}

 // display next 5-day forecast by coordinates
function display5DaysForecast(forecast) {
   const fragment = document.createDocumentFragment(); 
    const forecastWrapper = document.createElement('div');
    forecastWrapper.className = 'forecast';
  
    const heading = document.createElement('h3');
    heading.innerHTML = "Your location's next 5 days forecast:";
  
    const container = document.createElement('div');
    container.className = 'forecast-container';
  
    const addedDates = new Set();
    const today = new Date().toDateString();

    forecast.forEach((entry) => {
      const entryDateObj = new Date(entry.dt * 1000);
      const entryDateStr = entryDateObj.toDateString();

      if (entryDateStr !== today && !addedDates.has(entryDateStr)) {
        addedDates.add(entryDateStr);
        if (addedDates.size > 6) return;

    
        const condition = entry.weather[0].main;
        const iconSrc = getWeatherIcon(condition);
  
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
  
        const date = document.createElement('p');
        date.id = 'date';
        date.innerHTML = `<strong>${new Date(entry.dt * 1000).toLocaleDateString()}</strong>`;
  
        const icon = document.createElement('img');
        icon.loading = 'lazy';
        icon.id = 'weather-icon';
        icon.src = iconSrc;
        icon.alt = `${condition} icon`;
  
        const tempContainer = document.createElement('div');
        tempContainer.className = 'temperature-container';
  
        const temp = document.createElement('h3');
        temp.id = 'temperature';
        temp.innerHTML = `${Math.round(entry.main.temp)} °C`;
  
        const description = document.createElement('p');
        description.id = 'weather-description';
        description.innerHTML = ` ${entry.weather[0].description}`;
  
        tempContainer.appendChild(temp);
        tempContainer.appendChild(description);
        forecastItem.appendChild(date);
        forecastItem.appendChild(icon);
        forecastItem.appendChild(tempContainer);
        container.appendChild(forecastItem);
      }
    });
  
    forecastWrapper.appendChild(heading);
    forecastWrapper.appendChild(container);
    fragment.appendChild(forecastWrapper);
    weatherInfo.appendChild(fragment); 
}

// Fetch next 5-day forecast by coordinates
function get5DaysForecast(lat, lon) {
    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${CONFIG.WEATHER_API_KEY}&units=metric`
    )
      .then(res => res.json())
      .then(data => {
        requestIdleCallback(() => {
          setTimeout(() => display5DaysForecast(data.list), 0);
        });        
      })
      .catch(() => {
        weatherInfo.innerHTML = 'Error fetching forecast data.';
    });
}
  
 // Display current weather data
function displayUserWeather(data) {
    const weatherCondition = data.weather[0].main;
    const iconSrc = getWeatherIcon(weatherCondition);

    weatherInfo.innerHTML = `
      <h2 id="city">${data.name}, ${data.sys.country}</h2>

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
          <span id="humidity" class="value"> ${data.main.humidity}%</span>
        </div>
        <div class="detail">
          <img loading="lazy" id="wind-icon" src="/images/wind.png" alt="Wind icon">
          <span class="label">Wind</span>
          <span id="wind" class="value"> ${data.wind.speed} m/s</span>
        </div>
      </div>
    `;
  }

// Fetch weather by coordinates
function getWeatherByCoords(lat, lon) {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${CONFIG.WEATHER_API_KEY}&units=metric`
    )
      .then(res => res.json())
      .then(data => {
        displayUserWeather(data);
        get5DaysForecast(lat, lon);
      })
      .catch(() => {
        weatherInfo.innerHTML = 'Please turn on your device&apos;s location to get weather data.';
      });
  }

// Event listeners for search button and input field
cityName.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkWeatherBySearch(cityName.value);
});

  // Search button click event
searchButton.addEventListener('click', ()=>{
    checkWeatherBySearch(cityName.value);
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


// Load last searched city
window.onload = () => {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        checkWeatherBySearch(lastCity);
    }

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
};

