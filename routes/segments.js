'use strict';

const boom = require('boom');
const express = require('express');
const knex = require('../knex');
const { camelizeKeys, decamelizeKeys } = require('humps');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

const authorize = function(req, res, next) {
  jwt.verify(req.cookies.token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(boom.create(401, 'Unauthorized'));
    }

    req.token = decoded;
    next();
  });
};

router.get('/segments', (_req, res, next) => {
  knex('routes_segments')
    .orderBy('id')
    // .orderBy('trip_name')
    .then((rows) => {
      const segments = camelizeKeys(rows);

      res.send(segments);
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/segments/:id', (req, res, next) => {
    knex('routes_segments')
    .where('id', req.params.id)
    .first()
    .then((row) => {
      if (!row) {
        throw boom.create(404, 'Not Found');
      }

      const trip = camelizeKeys(row);

      res.send(trip);
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/segments', (req, res, next) => {
  const { longtripsId, date, origin, destination, totalDistance, totalElevation } = req.body;

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${destination}&key=${process.env.GOOGLE_API_KEY}`;
  axios.get(url)
    .then(response => {
      return response.data;
    })
    .then(data => {
      console.log(data.results[0].geometry.location);
      return JSON.stringify({
        location: data.results[0].geometry.location,
        stopover: true
      });
    })
    .then(waypoints =>{
      console.log(waypoints);
      const segment = { longtripsId, date, origin, destination, totalDistance, totalElevation, waypoints };

      return knex('routes_segments')
        .insert(decamelizeKeys(segment), '*')
        .then((rows) => {
          const insertSegment = camelizeKeys(rows[0]);

          res.send(insertSegment);
        })
        .catch((err) => {
          next(err);
        });
    })
});

router.patch('/segments/:id', authorize, (req, res, next) => {
  knex('routes_segments')
    .where('id', req.params.id)
    .first()
    .then((trip) => {
      if (!trip) {
        throw boom.create(404, 'Not Found');
      }

      const { longtripsID, date, origin, destination, totalDistance, totalElevation, waypoints } = req.body;
      const updateTrip = {};

      if (date) {
        updateTrip.date = date;
      }

      if (origin) {
        updateTrip.origin = origin;
      }

      if (destination) {
        updateTrip.destination = destination;
      }

      if (totalDistance) {
        updateTrip.totalDistance = totalDistance;
      }

      if (totalElevation) {
        updateTrip.totalElevation = totalElevation;
      }
      if (waypoints) {
        updateTrip.waypoints = waypoints;
      }


      return knex('routes_segments')
        .update(decamelizeKeys(updateTrip), '*')
        .where('id', req.params.id);
    })
    .then((rows) => {
      const trip = camelizeKeys(rows[0]);

      res.send(trip);
    })
    .catch((err) => {
      next(err);
    });
});

router.delete('/segments/:id', (req, res, next) => {
  let trip;

  knex('routes_segments')
    .where('id', req.params.id)
    .first()
    .then((row) => {
      if (!row) {
        throw boom.create(404, 'Not Found');
      }

      trip = camelizeKeys(row);

      return knex('routes_segments')
        .del()
        .where('id', req.params.id);
    })
    .then(() => {
      delete trip.id;

      res.send(trip);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
