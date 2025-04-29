const BASE_URL = `https://api.openweathermap.org/data/2.5/weather?&appid=${CONFIG.WEATHER_API_KEY}&units=metric&q=`

const cityName = document.getElementById('location-input');
const searchButton = document.getElementById('search-btn');
const weatherIcon = document.getElementById('weather-icon');

async function checkWeather(city){
    const response = await fetch(BASE_URL + city);

    if (response.status == 404) {
        document.getElementsByClassName('error')[0].style.display = 'block';
        document.getElementById('weather-container').style.display = 'none';       
    } else {
    const data = await response.json();
    document.getElementById('weather-container').style.display = 'block';
    document.getElementsByClassName('error')[0].style.display = 'none';
  
    console.log(data)

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


cityName.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkWeather(cityName.value);
  });

searchButton.addEventListener('click', ()=>{
    checkWeather(cityName.value );
  });
  

  //service workers
  if('serviceWorker' in navigator){
    window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
    .then(reg => console.log('Service worker registered'))
    .catch(err => console.log('Service worker not registered', err));
    })
  } 