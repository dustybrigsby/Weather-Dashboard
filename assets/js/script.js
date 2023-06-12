$(function () {
  // GLOBAL VARIABLES
  const openWeatherKey = "438e8fc2c9765148d603f01f0612659d";
  const cityInput = $("#city");

  // Get latitude and longitude coordinates from city name
  function getCoordinates(city) {
    const coordUrl =
      "http://api.openweathermap.org/geo/1.0/direct?q=" +
      cityInput +
      "&limit=1&appid=" +
      openWeatherKey;

    fetch(coordUrl).then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          console.log(data.lat, data.lon);
        });
      }
    });
  }
});
