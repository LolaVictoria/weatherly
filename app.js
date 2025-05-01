import { CONFIG } from './config.js';
const BASE_URL = `https://api.openweathermap.org/data/2.5/weather?&appid=${CONFIG.WEATHER_API_KEY}&units=metric&q=`;

const cityName = document.getElementById('location-input');
const searchButton = document.getElementById('search-btn');
const weatherIcon = document.getElementById('weather-icon');
const locationBtn = document.getElementById('locationBtn');

const weatherInfo = document.getElementById('weatherInfo');



async function checkWeather(city){
    // if(city.length == 0) {
    //     document.getElementsByClassName('error')[0].style.display = 'block';
    //     document.getElementsByClassName('error')[0].innerHTML = "Please enter a city name!";
    //     document.getElementsByClassName('error')[0].style.color = 'red';
    //     document.getElementById('weather-container').style.display = 'none'; 
    //     return;
    // }
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
  
    console.log(data)
    
    localStorage.setItem('lastCity', city);

    document.querySelector('#city').innerHTML = data.name;
    document.querySelector("#temperature").innerHTML = Math.round(data.main.temp) + "°C";
    document.querySelector("#humidity").innerHTML = data.main.humidity + "%";
    document.querySelector("#wind").innerHTML = data.wind.speed + "km/h";
    document.getElementById('weather-description').innerHTML = data.weather[0].description;
    
    
    document.getElementById('weather-icon').src = "img/" + data.weather[0].icon + ".png";
    const weatherCondition = data.weather[0].main;

switch (weatherCondition) {
    case "Clear":
        weatherIcon.src = "images/weather-icons/clear.png";
        break;
    case "Clouds":
        weatherIcon.src = "images/weather-icons/clouds.png";
        break;
    case "Drizzle":
        weatherIcon.src = "images/weather-icons/drizzle.png";
        break;
    case "Mist":
        weatherIcon.src = "images/weather-icons/mist.png";
        break;
    case "Snow":
        weatherIcon.src = "images/weather-icons/snow.png";
        break;
    default:
        weatherIcon.src = "images/weather-icons/default.png"; // fallback image if condition is unrecognized
    }


    }
}
// Fetch 5-day forecast by coordinates
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

  // display 5-day forecast by coordinates
  function display5DayForecast(forecast) {
    let forecastHTML = '<h3>5-Day Forecast:</h3><div class="forecast-container">';
    
    forecast.forEach((entry, index) => {
      if (index % 8 === 0) {  // Display forecast for every 24 hours (8 measurements per day)
        forecastHTML += `
          <div class="forecast-item">
            <p><strong>${new Date(entry.dt * 1000).toLocaleDateString()}</strong></p>
            <p><img src="https://openweathermap.org/img/wn/${entry.weather[0].icon}.png" alt="weather-icon" /></p>
            <p><strong>Temp:</strong> ${entry.main.temp} °C</p>
            <p><strong>Weather:</strong> ${entry.weather[0].description}</p>
          </div>
        `;
      }
    });
  
    forecastHTML += '</div>';
    weatherInfo.innerHTML += forecastHTML;
  }  

// Fetch weather by coordinates
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
  
  // Display current weather data
  function displayWeather(data) {
    weatherInfo.innerHTML = `
      <h2>${data.name}, ${data.sys.country}</h2>
      <p><strong>Temperature:</strong> ${data.main.temp} °C</p>
      <p><strong>Weather:</strong> ${data.weather[0].description}</p>
      <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
      <p><strong>Wind Speed:</strong> ${data.wind.speed} m/s</p>
    `;
  }


cityName.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkWeather(cityName.value);
  });

searchButton.addEventListener('click', ()=>{
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


  // Load last searched city
  window.onload = () => {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
    checkWeather(lastCity);
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

  //service workers
  if('serviceWorker' in navigator){
    window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
    .then(reg => console.log('Service worker registered'))
    .catch(err => console.log('Service worker not registered', err));
    })
  } 