// Needed Resources 
const express = require("express")
const router = new express.Router()
const vehicleController = require("../controllers/vehicleController")

// Route to build inventory by classification view
router.get('/detail/:invId', vehicleController.buildVehicle);

module.exports = router;