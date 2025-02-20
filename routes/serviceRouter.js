const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("./cors");

const Services = require("../models/service");
const authenticate = require("../authenticate");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/images/Services");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
    }
});

const upload = multer({ storage });

const ServiceRouter = express.Router();

ServiceRouter.route("/")
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Services.find(req.query)
            .then((services) => {
                res.status(200).json(services);
            })
            .catch(next);
    })
    .post(
        upload.fields([{ name: "mainImg", maxCount: 1 }, { name: "secondaryImg", maxCount: 3 }]),
        cors.corsWithOptions,
        authenticate.verifyUser,
        async (req, res) => {
            const { name, description } = req.body;
            const mainImg = req.files["mainImg"] ? req.files["mainImg"][0].path.replace(/^public[\/\\]/, "") : null;
            const secondaryImg = req.files["secondaryImg"]
                ? req.files["secondaryImg"].map(file => file.path.replace(/^public[\/\\]/, ""))
                : [];
    
            if (!mainImg) {
                return res.status(400).json({ error: "Main image is required." });
            }
    
            const service = {
                mainImg,
                secondaryImg,
                name,
                description
            };
    
            try {
                console.log(service);
                const newService = await Services.create(service);
                res.status(201).json(newService);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        }
    );    

ServiceRouter.route("/:deleteId")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .delete(cors.cors, (req, res, next) => {
        Services.findByIdAndRemove(req.params.deleteId)
            .then((response) => {
                if (response) {
                    res.status(200).json(response);
                } else {
                    const err = new Error(`Service ${req.params.deleteId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(next);
    });

module.exports = ServiceRouter;
