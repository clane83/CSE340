const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    let list = '<ul class="navigation">'
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            "</a>"
        list += "</li>"
    })
    list += "</ul>"
    return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function (data) {
    let grid = "";
    console.log("buildClassificationGrid data:", JSON.stringify(data, null, 2));
    if (data.length > 0) {
        grid = '<ul id="inv-display">';
        data.forEach(vehicle => {
            console.log("Vehicle:", JSON.stringify(vehicle, null, 2));
            const invId = vehicle.inv_id || "unknown";
            const invYear = vehicle.inv_year || "Unknown";
            const invMake = vehicle.inv_make || "Unknown";
            const invModel = vehicle.inv_model || "Unknown";
            const invThumbnail = vehicle.inv_thumbnail || "/images/no-image.png";
            const invPrice = vehicle.inv_price != null ? vehicle.inv_price : 0;
            grid += '<li>';
            grid += '<a href="../../inv/detail/' + invId
                + '" title="View ' + invMake + ' ' + invModel
                + ' details"><img src="' + invThumbnail
                + '" alt="Image of ' + invMake + ' ' + invModel
                + ' on CSE Motors" /></a>';
            grid += '<div class="namePrice">';
            grid += '<hr />';
            grid += '<h2>';
            grid += '<a href="../../inv/detail/' + invId + '" title="View '
                + invMake + ' ' + invModel + ' details">'
                + invMake + ' ' + invModel + '</a>';
            grid += '</h2>';
            grid += '<span>$'
                + new Intl.NumberFormat('en-US').format(invPrice) + '</span>';
            grid += '</div>';
            grid += '</li>';
        });
        grid += '</ul>';
    } else {
        grid += '<div class="no-inventory">No inventory at this time. Check back again soon.</div>';
    }
    console.log("buildClassificationGrid output:", grid);
    return grid;
}

/* **************************************
* error handling
* ************************************ */
Util.handleErrors = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);


module.exports = Util;