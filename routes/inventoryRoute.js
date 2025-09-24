// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const classificationValidate = require('../utilities/vehicle')

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Management hub
router.get("/", invController.buildManagement);

// Add classification
router.get("/add-classification", invController.buildAddClassification);
router.post(
    "/add-classification",
    classificationValidate.addClassificationRules(),
    classificationValidate.checkAddClassData,
    invController.registerClassification
);


module.exports = router;