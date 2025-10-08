const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function (req, res, next) {
    try {
        const nav = await utilities.getNav()
        res.render("index", {
            title: "Home",
            nav,
            // add these so index.ejs can link to your new upgrade pages
            engineTypeId: 1,
            decalsTypeId: 2,
            bumperTypeId: 3,
            rimsTypeId: 4,
        })
    } catch (e) { next(e) }
}

module.exports = baseController