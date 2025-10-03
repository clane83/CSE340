// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const classificationValidate = require('../utilities/vehicle')
const utilities = require("../utilities")
const { requireEmployeeOrAdmin } = require("../utilities/account-validation")



/**************
 * Route to inventory management view
 * URL: /inv/
 * *************/
router.get("/", requireEmployeeOrAdmin, utilities.handleErrors(invController.buildManagement))


/************
 * Get inventory by classificationId in JSON format
 * URL: /inv/getInventory/:classification_id
 * *********
 */
router.get("/getInventory/:classification_id", requireEmployeeOrAdmin, utilities.handleErrors(invController.getInventoryJSON))

/**********
 * Route to build inventory by classification view
 * URL: /inv/type/:classificationId
 */
router.get("/type/:classificationId", invController.buildByClassificationId);

/*********
 * Add classification
 */
router.get("/add-classification", requireEmployeeOrAdmin,
    invController.buildAddClassification);
router.post(
    "/add-classification",
    requireEmployeeOrAdmin,
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
    requireEmployeeOrAdmin, utilities.handleErrors(invController.buildEditInventoryView)
)

router.post("/update/",
    requireEmployeeOrAdmin,
    classificationValidate.updateVehicleRules(),
    classificationValidate.checkUpdateVehicleData,
    utilities.handleErrors(invController.updateInventory))


/************
 * Add inventory
 * URL: /inv/add-inventory
 * ********** */

router.get("/add-inventory", requireEmployeeOrAdmin, invController.buildAddInventory);
router.post(
    "/add-inventory",
    requireEmployeeOrAdmin,
    classificationValidate.addVehicleRules(),
    classificationValidate.checkAddVehicleData,
    invController.registerInventory
);

/****************
 * Delete inventory
 * URL: /inv/delete/:inv_id
 * *************** */

router.get(
    "/delete/:inv_id", requireEmployeeOrAdmin,
    utilities.handleErrors(invController.buildDeleteInventoryView)
);

router.post(
    "/delete",
    utilities.handleErrors(invController.deleteInventory)
);





module.exports = router;