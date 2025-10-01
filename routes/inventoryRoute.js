// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const classificationValidate = require('../utilities/vehicle')
const utilities = require("../utilities")


// Management hub
router.get("/", utilities.handleErrors(invController.buildManagement))

// JSON endpoint for the client script
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Add classification
router.get("/add-classification", invController.buildAddClassification);
router.post(
    "/add-classification",
    classificationValidate.addClassificationRules(),
    classificationValidate.checkAddClassData,
    invController.registerClassification
);

/* ***************
 * Edit inventory (present edit form)
 * URL: /inv/edit/:inv_id
 * *************** */
router.get(
    "/edit/:inv_id",
    utilities.handleErrors(invController.buildEditInventoryView)
)

router.post("/update/",
    classificationValidate.updateVehicleRules(),
    classificationValidate.checkUpdateVehicleData,
    utilities.handleErrors(invController.updateInventory))


// Add classification
router.get("/add-inventory", invController.buildAddInventory);
router.post(
    "/add-inventory",
    classificationValidate.addVehicleRules(),
    classificationValidate.checkAddVehicleData,
    invController.registerInventory
);

module.exports = router;