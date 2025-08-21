const express = require('express');
const router = express.Router();
const wardController = require('../controllers/wardController');

// Get all wards
router.get('/', wardController.getAllWards);

// Create a new ward
router.post('/', wardController.createWard);

// Get a single ward by ID
router.get('/:id', wardController.getWardById);

// Update a ward by ID
router.put('/:id', wardController.updateWard);

// Delete a ward by ID
router.delete('/:id', wardController.deleteWard);

// Get all rooms in a ward
router.get('/:id/rooms', wardController.getRoomsInWard);

// Create a new room in a ward
router.post('/:id/rooms', wardController.createRoomInWard);

module.exports = router;
