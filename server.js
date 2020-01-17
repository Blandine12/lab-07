'use strict';
const superagent = require('superagent');
const express = require('express');
const app = express();

require('dotenv').config();

const cors = require('cors');
let locations ={};

//  Declare variable
app.use(cors());
const PORT = process.env.PORT || 3001;

// use corss to allow to past data to front end

app.use(cors());


// define routes
app.get('/location', (request, response) => {

  try {
    // const dataArray = require('./data/geo.json');
    let city = request.query.city;
    let key = process.env.GEOCODE_API_KEY;
    const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;

    if (locations[url]) {
      response.send(locations[url]);
    }
    else {
      superagent.get(url)
        .then(data => {
          const geoData = data.body[0];
          const location = new Location(city, geoData);
          locations[url] = location;
          response.send(location);

        });
    }
    // const geoData = dataArray [0];
    // const city = request.query.city;

    // let location = new Location (city, geoData);
    // response.status(200).send(location);
  }
  catch(error) {
    errorHandler('If you did not get results. Please try again.', response);
  }
});





app.get('/weather', (request, response) => {

  let latitude = request.query.latitude;
  let longitude = request.query.longitude;
  // let {latitude, longitude} = request.query;

  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${latitude},${longitude}`;

  superagent.get(url)
    .then(data => {
      const dailyWeather = data.body.daily.data.map(day => {
        return new MapWeather(day);
      });
      response.status(200).json(dailyWeather);
    })
    .catch(() => {
      errorHandler('If you did not get result. Please, try again', request, response);
    });

});


app.get('/events', (request, response) => {
  let key = process.env.EVENTFUL_API_KEY;
  let {search_query }= request.query;
  const eventDataUrl =`http://api.eventful.com/json/events/search?keywords=music&location=${search_query}&app_key=${process.env.EVENTFUL_API_KEY}`;

  superagent.get(eventDataUrl)
    .then(eventData => {
      let eventMassData = JSON.parse(eventData.text);
      let localEvent =eventMassData.events.event.map(thisEventData => {
        return new NewEvent(thisEventData);
      });
      response.status(200).send(localEvent);
    })
    .catch(() => {
      errorHandler('If you did not get result. Please, try again', request, response);
    });

});





// Define function



function Location(city, localData) {
  this.search_query = city;
  this.formatted_query = localData.display_name;
  this.latitude = localData.lat;
  this.longitude = localData.lon;
}



function MapWeather(dailyForecast) {
  this.forecast = dailyForecast.summary;
  this.time = new Date(dailyForecast.time *1000).toDateString();
}

function errorHandler(string, response) {
  response.status(500).send(string);
}

function NewEvent(thisEventData) {
  this.name = thisEventData.title;
  this.event_date = thisEventData.start_time.slice(0,10);
  this.link = thisEventData.url;
  this.summary = thisEventData.description;

}

// Make sure the server is listening for requests
app.listen(PORT, () => console.log(`Never Give up ${PORT}`));
