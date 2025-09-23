const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function (req, res) {
    const nav = await utilities.getNav()
    // req.flash("notice", "This is a flash message.") //create a flash message, index.ejs has the insert under the h1
    res.render("index", { title: "Home", nav })
}

module.exports = baseController