// GLOBAL VARIABLES
const openWeatherKey = `438e8fc2c9765148d603f01f0612659d`;
const searchBtn = document.getElementById(`search-button`);
let historyArr = [];

// Separate starting search function to handle searches from both a new entry and from history
function citySearchInit(e) {
  e.preventDefault();
  getCoords();
}

// Get latitude and longitude coordinates from city name
function getCoords() {
  const cityInput = document.getElementById(`city-input`).value;

  if (!cityInput) {
    alert(`Enter a city name into the search bar or select a city from the history list.`);
    return;
  }

  const coordsUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${ cityInput }&limit=1&appid=${ openWeatherKey }`;
  console.log(`coordsUrl: ` + coordsUrl);

  fetch(coordsUrl)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      const coordsData = {
        name: data[ 0 ].name,
        lat: data[ 0 ].lat,
        lon: data[ 0 ].lon,
      };
      // console.log(`coordsData:`, coordsData);

      getWeather(coordsData);
    });
}

function getWeather(coordsData) {
  const weatherUrl =
    `https://api.openweathermap.org/data/2.5/weather?lat=${ coordsData.lat }&lon=${ coordsData.lon }&units=imperial&appid=${ openWeatherKey }`;
  console.log(`currentWeatherUrl: ` + weatherUrl);

  fetch(weatherUrl)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      const weatherData = {
        name: data.name,
        date: dayjs().format(`M/D/YYYY`),
        coord: {
          lon: data.coord.lon,
          lat: data.coord.lat
        },
        icon: data.weather[ 0 ].icon,
        temp: data.main.temp,
        wind: data.wind.speed,
        humidity: data.main.humidity
      };
      // console.log(`weatherData:`, weatherData);

      getForecast(weatherData);
    });
}


function getForecast(weatherData) {
  const forecastUrl =
    `https://api.openweathermap.org/data/2.5/forecast?lat=${ weatherData.coord.lat }&lon=${ weatherData.coord.lon }&units=imperial&appid=${ openWeatherKey }`;
  console.log(`forecastUrl: ` + forecastUrl);

  fetch(forecastUrl)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      const weatherArr = [ weatherData ];
      const forecastArr = data.list;
      // console.log(`forecastArr:`, forecastArr);

      const dateArr = timeSetter();
      // console.log(`dateArr:`, dateArr);
      // console.log(`forecastArr.length:`, forecastArr.length);

      let count = 7;

      for (let i = 1; i < dateArr.length; i++) {
        // console.log(`count:`, count);

        let thisForecast = {
          name: data.city.name,
          date: dateArr[ i ].displayToday,
          coord: {
            lon: data.city.coord.lon,
            lat: data.city.coord.lat
          },
          icon: forecastArr[ count ].weather[ 0 ].icon,
          temp: forecastArr[ count ].main.temp,
          wind: forecastArr[ count ].wind.speed,
          humidity: forecastArr[ count ].main.humidity
        };

        count += 8;
        weatherArr.push(thisForecast);
      };

      // console.log(`weatherArr:`, weatherArr);
      displayResults(weatherArr);
    });
};

function displayResults(data) {
  // console.log(`data:`, data);

  const displays = [
    document.getElementById(`current-weather`).children,
    document.getElementById(`tomorrow`).children,
    document.getElementById(`tomorrow1`).children,
    document.getElementById(`tomorrow2`).children,
    document.getElementById(`tomorrow3`).children,
    document.getElementById(`tomorrow4`).children,
  ];

  // console.log(`displays:`, displays);

  for (let i = 0; i < displays.length; i++) {
    if (i === 0) {
      displays[ i ][ 0 ].innerHTML = `${ data[ i ].name } (${ data[ i ].date })`;
    } else {
      displays[ i ][ 0 ].innerHTML = `${ data[ i ].date }`;
    }

    let iconDisplay = document.createElement(`img`);
    iconDisplay.src = `https://openweathermap.org/img/wn/${ data[ i ].icon }.png`;
    if (displays[ i ][ 1 ].children[ 0 ]) {
      displays[ i ][ 1 ].children[ 0 ].remove();
    }
    displays[ i ][ 1 ].appendChild(iconDisplay);

    displays[ i ][ 2 ].innerHTML = `Temp: ${ data[ i ].temp } °F`;
    displays[ i ][ 3 ].innerHTML = `Wind: ${ data[ i ].wind } MPH`;
    displays[ i ][ 4 ].innerHTML = `Humidity: ${ data[ i ].humidity } %`;
  };

  historyChecker(data[ 0 ].name);
};

// Gets the dates for 
function timeSetter() {
  let today = dayjs();
  // console.log(`today:`, today);

  let thisDate = dayjs().set(`hour`, 21).set(`minute`, 0).set(`second`, 0);
  // console.log(`thisDate:`, thisDate);

  const weatherDates = [];

  for (let i = 0; i < 6; i++) {
    let dayObj = {
      displayToday: today.add(i, `day`).format(`M/D/YYYY`),
      weatherToday: thisDate.add(i, `day`).format(`YYYY-MM-DD HH:mm:ss`)
    };

    weatherDates.push(dayObj);
  }

  return weatherDates;
};

// Checks for localStorage data, creates it if none found
function historyChecker(newCity) {
  // console.log(`historyChecker()`);
  console.log(`newCity:`, newCity);

  if (!localStorage.getItem(`city-history`) && newCity === `initial-call`) {
    console.log(`No history`);

    let newHistory = [];
    localStorage.setItem(`city-history`, newHistory);

  } else if (newCity !== `initial-call`) {
    console.log(`Not initial call`);

    updateHistory(newCity);

  } else {
    if (typeof historyArr === `array`) {
      historyArr = localStorage.getItem(`city-history`);
      updateHistory(`initial-call`);
    } else {
      historyArr = [ localStorage.getItem(`city-history`) ];
      updateHistory(`initial-call`);
    }
  }
}

// Updates localStorage object with latest search
function updateHistory(newCity) {
  // console.log(`updateHistory(newCity)`);
  // console.log(`historyArr:`, historyArr);

  if (newCity !== `initial-call`) {
    historyArr.unshift(newCity);

    for (let i = 1; i < historyArr.length; i++) {
      if (historyArr[ i ] === newCity) {
        historyArr.splice(i, 1);
      }
    }

    if (historyArr.length < 11) {
      localStorage.setItem(`city-history`, historyArr);
    } else {
      historyArr.pop();
      localStorage.setItem(`city-history`, historyArr);
    }

    document.getElementById(`history-list`).innerHTML = ``;
  }

  for (let i = 0; i < historyArr.length; i++) {
    // console.log(`historyArr[ i ]:`, historyArr[ i ]);

    const historyButton = document.createElement(`button`);
    historyButton.setAttribute(`class`, `btn btn-secondary btn-block`);
    historyButton.textContent = historyArr[ i ];
    historyButton.addEventListener(`click`, function () {
      document.getElementById(`city-input`).value = historyArr[ i ];
      getCoords();
    });

    document.getElementById(`history-list`).appendChild(historyButton);
  };
}

historyChecker(`initial-call`);
searchBtn.addEventListener(`click`, citySearchInit);