const express = require('express');
const bodyParser = require('body-parser');
const SSLCommerzPayment = require('sslcommerz-lts');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('./cors');

const Contact = require('../models/contact');

var authenticate = require('../authenticate');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images/Contacts');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
    }
});

const upload = multer({ storage: storage });

const ContactRouter = express.Router();

ContactRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Contact.find(req.query)
    .then((gifts) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(gifts);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(upload.single('image'), cors.corsWithOptions, async (req, res) => {
    const { name, phone, email, address, description } = req.body;
    let imagePath = req.file ? req.file.path : '';
    imagePath = imagePath.replace(/^public[\/\\]/, '');
    const contact = {
      image: imagePath,
      name: name,
      phone: phone,
      email: email,
      address: address,
      description: description,
    };
  
    try {
      const updatedContactList = await Contact.create(
        contact
      );
  
      res.status(200).json(updatedContactList);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
})

module.exports = ContactRouter;