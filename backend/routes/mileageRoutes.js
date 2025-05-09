const express = require('express');
const router = express.Router();
const mileageController = require('../controllers/mileageController');
const authenticate = require('../config/jwtAuth.js');

//-------------------------MILEAGE ROUTES-------------------------

// Get mileage data for the current user
router.get("/", authenticate, mileageController.getMileage);

// Update the current mileage
router.put("/update", authenticate, mileageController.updateMileage);

// Reset mileage to zero
router.put("/reset", authenticate, mileageController.resetMileage);

// Delete mileage history
router.delete("/history", authenticate, mileageController.deleteMileageHistory);

// Save quarterly total
router.post("/save-quarterly", authenticate, mileageController.saveQuarterlyTotal);

// Save yearly total and reset
router.post("/save-yearly-reset", authenticate, mileageController.saveYearlyTotalAndReset);

// Get quarterly and yearly totals
router.get("/totals", authenticate, mileageController.getTotals);

module.exports = router;