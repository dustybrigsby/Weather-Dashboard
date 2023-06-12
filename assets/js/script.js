$(function () {
  // GLOBAL VARIABLES
  const openWeatherKey = "438e8fc2c9765148d603f01f0612659d";
  const searchBtn = $("#search-button");
  let historyArr;

  if (!localStorage.getItem("city-history")) {
    let newHistory = [];
    localStorage.setItem("city-history", newHistory);
  } else {
    historyArr = localStorage.getItem("city-history");
    $("#history-list-placeholder").toggle();
  }

  console.log("historyArr: " + historyArr);

  // Separate starting search function to handle searches from both a new entry and from history
  function startSearch() {
    const cityInput = $("#city");

    getCoords(cityInput);
  }

  // Get latitude and longitude coordinates from city name
  function getCoords(cityInput) {
    const coordsUrl =
      "http://api.openweathermap.org/geo/1.0/direct?q=" +
      cityInput +
      "&limit=1&appid=" +
      openWeatherKey;
    let coords = {
      lon: 0,
      lat: 0,
    };

    updateHistory(cityInput);

    fetch(coordsUrl).then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          coords.lon = data.coord.lon;
          coords.lat = data.coord.lat;
          console.log(
            "coordinates: [" + coords.lon + ", " + coords.lat + "]"
          );
        });
      }
    });

    getCurrentWeather(coords);
  }

  function getCurrentWeather(coords) {
    const currentWeatherUrl =
      "https://api.openweathermap.org/data/2.5/weather?lat=" +
      coords.lat +
      "&lon=" +
      coords.lon +
      "&appid=" +
      openWeatherKey;
  }

  function updateHistory(newCity) {
    if (historyArr.length < 10) {
      historyArr.push(newCity);
    } else {
      historyArr.pop();
      historyArr.unshift(newCity);
      localStorage.setItem("city-history", historyArr);
    }

    $.each(historyArr, function () {
      let historyBtn = $("<button>", {
        text: $(this),
        class: "history-button",
        click: getCoords($(this)),
      });

      $("history-list").append(historyBtn);
    });
  }

  searchBtn.on("click", startSearch);
});
