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
      localStorage.setItem('lastCity', city);
      document.querySelector('#city').innerHTML = data.name;
      document.getElementById('date').innerHTML = new Date(data.dt * 1000).toLocaleDateString();
      document.querySelector("#temperature").innerHTML = Math.round(data.main.temp) + "°C";
      document.querySelector("#humidity").innerHTML = data.main.humidity + "%";
      document.querySelector("#wind").innerHTML = data.wind.speed + "km/h";
      document.getElementById('weather-description').innerHTML = data.weather[0].description;
      const weatherCondition = data.weather[0].main;
      weatherIcon.src = getWeatherIcon(weatherCondition);
    }
}


// Fetch 5-day forecast by coordinates
function get5DayForecast(lat, lon) {
    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${CONFIG.WEATHER_API_KEY}&units=metric`
    )
      .then(res => res.json())
      .then(data => {
        requestIdleCallback(() => {
          setTimeout(() => display5DayForecast(data.list), 0);
        });        
      })
      .catch(() => {
        weatherInfo.innerHTML = 'Error fetching forecast data.';
    });
}

  // display 5-day forecast by coordinates
  function display5DayForecast(forecast) {
    const fragment = document.createDocumentFragment(); 
    weatherInfo.innerHTML = ''; 

    // Create wrapper divs
    const forecastWrapper = document.createElement('div');
    forecastWrapper.className = 'forecast';
  
    const heading = document.createElement('h3');
    heading.innerHTML = "Your location's next 5 days forecast:";
  
    const container = document.createElement('div');
    container.className = 'forecast-container';
  
    forecast.forEach((entry, index) => {
      const entryDate = new Date(entry.dt * 1000).getDate();
      const todayDate = new Date().getDate();
      if (entryDate !== todayDate && index % 8 === 0) {
    
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
  
        const temp = document.createElement('p');
        temp.id = 'temperature';
        temp.innerHTML = `<strong>Temp:</strong> ${Math.round(entry.main.temp)} °C`;
  
        const description = document.createElement('p');
        description.id = 'weather-description';
        description.innerHTML = `<strong>Weather:</strong> ${entry.weather[0].description}`;
  
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

// Event listeners for search button and input field
cityName.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkWeather(cityName.value);
  });

  // Search button click event
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
      navigator.serviceWorker.register('/service-worker.js').then(reg => {
        reg.onupdatefound = () => {
          const newWorker = reg.installing;
          newWorker.onstatechange = () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available, force reload
              window.location.reload();
            }
          };
        };
      });
      
    })
  } 

  

  let deferredPrompt;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the default mini-infobar prompt
    e.preventDefault();
    // Save the event so it can be triggered later
    deferredPrompt = e;
  
    // Optionally, show a custom install button to the user
    const installBtn = document.getElementById('installBtn');
    installBtn.style.display = 'block';
  
    installBtn.addEventListener('click', () => {
      // Show the install prompt
      deferredPrompt.prompt();
  
      // Wait for the user's response
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        deferredPrompt = null;
      });
    });
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
  });
  