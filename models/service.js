const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    mainImg: {
        type: String, 
        required: true
    },
    secondaryImg: {
        type: [String], 
        validate: [arrayLimit, "You can upload up to 3 secondary images."]
    }
});

function arrayLimit(val) {
    return val.length <= 3;
}

module.exports = mongoose.model("Service", ServiceSchema);
