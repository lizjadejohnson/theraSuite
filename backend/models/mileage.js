const mongoose = require("mongoose")

const mileageSchema = new mongoose.Schema({
    currentMileage: {
        type: Number,
        default: 0
    },
    quarterlyTotals: [{
        quarter: Number, // 1, 2, 3, or 4
        year: Number,
        total: Number,
        savedAt: Date
    }],
    yearlyTotals: [{
        year: Number,
        total: Number,
        savedAt: Date
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {timestamps: true});

const Mileage = mongoose.model("Mileage", mileageSchema)

module.exports = Mileage