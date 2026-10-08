const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    destination: { type: String, required: true },
    duration: { type: Number, required: true },
    budget: { type: String, required: true },
    travelStyle: { type: String },
    itineraryData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for querying user itineraries sorted by creation date
itinerarySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Itinerary', itinerarySchema);