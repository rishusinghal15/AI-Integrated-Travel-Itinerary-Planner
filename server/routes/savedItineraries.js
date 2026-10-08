const express = require('express');
const router = express.Router();
const Itinerary = require('../models/Itinerary');
const { protect } = require('../middleware/authMiddleware');
const { validate, objectIdParamSchema } = require('../middleware/validate');

// SAVE itinerary
router.post('/save', protect, async (req, res, next) => {
    const { itineraryData, travelStyle } = req.body;

    if (!itineraryData) {
        return res.status(400).json({
            message: 'No itinerary data provided',
            error: 'No itinerary data provided'
        });
    }

    try {
        const saved = await Itinerary.create({
            userId: req.user._id,
            destination: itineraryData.destination,
            duration: itineraryData.duration,
            budget: itineraryData.budget,
            travelStyle: travelStyle || 'balanced',
            itineraryData
        });

        res.status(201).json({ success: true, itinerary: saved });
    } catch (error) {
        next(error);
    }
});

// GET all saved itineraries for logged-in user
router.get('/my-itineraries', protect, async (req, res, next) => {
    try {
        const itineraries = await Itinerary.find({ userId: req.user._id })
            .sort({ createdAt: -1 });
        res.json({ success: true, itineraries });
    } catch (error) {
        next(error);
    }
});

// GET single itinerary
router.get('/:id', protect, validate(objectIdParamSchema, 'params'), async (req, res, next) => {
    try {
        const itinerary = await Itinerary.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!itinerary) {
            return res.status(404).json({
                message: 'Itinerary not found',
                error: 'Itinerary not found'
            });
        }

        res.json({ success: true, itinerary });
    } catch (error) {
        next(error);
    }
});

// DELETE itinerary
router.delete('/:id', protect, validate(objectIdParamSchema, 'params'), async (req, res, next) => {
    try {
        const itinerary = await Itinerary.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!itinerary) {
            return res.status(404).json({
                message: 'Itinerary not found',
                error: 'Itinerary not found'
            });
        }

        await Itinerary.deleteOne({ _id: req.params.id });
        res.json({ success: true, message: 'Itinerary deleted successfully' });
    } catch (error) {
        next(error);
    }
});

// UPDATE itinerary (after re-planning)
router.put('/:id', protect, validate(objectIdParamSchema, 'params'), async (req, res, next) => {
    const { itineraryData } = req.body;

    if (!itineraryData) {
        return res.status(400).json({
            message: 'No itinerary data provided for update',
            error: 'No itinerary data provided'
        });
    }

    try {
        const itinerary = await Itinerary.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!itinerary) {
            return res.status(404).json({
                message: 'Itinerary not found',
                error: 'Itinerary not found'
            });
        }

        itinerary.itineraryData = itineraryData;
        itinerary.destination = itineraryData.destination;
        itinerary.updatedAt = Date.now();
        await itinerary.save();

        res.json({ success: true, itinerary });
    } catch (error) {
        next(error);
    }
});

module.exports = router;