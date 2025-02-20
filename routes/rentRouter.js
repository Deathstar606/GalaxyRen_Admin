const express = require('express');
const cors = require('./cors');

const Rents = require('../models/rent');
var authenticate = require('../authenticate');

const RentRouter = express.Router();

RentRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Rents.find(req.query)
    .then((rent) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(rent);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, async (req, res) => {
  const rentData = req.body;

  let location;
  if (typeof rentData.location === "string") {
    location = rentData.location; // Predefined location (Ottawa, Toronto, Quebec)
  } else if (rentData.location && rentData.location.latitude && rentData.location.longitude) {
    location = {
      latitude: rentData.location.latitude,
      longitude: rentData.location.longitude
    };
  } else {
    return res.status(400).json({ message: "Invalid location format" });
  }

  const rent = {
    name: rentData.name,
    email: rentData.email,
    phone: rentData.phone,
    toolId: rentData.toolId,               
    duration: rentData.duration,
    pickupMethod: rentData.pickupMethod,
    price: rentData.price,            
    charge: rentData.charge || 0, 
    location: location
  };

  try {
    console.log("Saving Rent Data:", rent);
    const newRent = await Rents.create(rent);
    res.status(201).json(newRent);
  } catch (error) {
    console.error("Error creating rent:", error);
    res.status(500).json({ message: error.message });
  }
});

RentRouter.route('/:deleteId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.delete(cors.cors, (req, res, next) => {
    Rents.findByIdAndRemove(req.params.deleteId)
    .then((response) => {
        if (response) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
        } else {
            const err = new Error(`Rent ${req.params.deleteId} not found`);
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = RentRouter;