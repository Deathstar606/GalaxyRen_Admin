const express = require("express");
const cors = require("./cors");

const Services = require("../models/service");
const authenticate = require("../authenticate");

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
.post(cors.corsWithOptions, authenticate.verifyUser, async (req, res) => {
    try {
        const { name, description, mainImg, secondaryImg } = req.body;

        // Check if main image URL is provided
        if (!mainImg) {
            return res.status(400).json({ error: "Main image URL is required." });
        }

        // Create new service entry using provided Cloudinary URLs
        const newService = await Services.create({
            name,
            description,
            mainImg, // Directly storing the URL from frontend
            secondaryImg: secondaryImg || [] // Ensure secondaryImg is an array
        });

        res.status(201).json(newService);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}); 

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
