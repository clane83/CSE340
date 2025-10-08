/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config();
const baseController = require("./controllers/baseController");
const inventoryRoute = require('./routes/inventoryRoute');
const vehicleRoute = require('./routes/vehicleRoute');
const accountRoute = require('./routes/accountRoute')
const upgradeRoute = require("./routes/upgradeRoute");
const session = require("express-session");
const pool = require('./database/');
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const utilities = require("./utilities")
const validate = require('./utilities/account-validation')
const app = express();



/* ***********************
 * Middleware
 * ************************/
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1); // <- Render is behind a proxy
}

app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))
app.use(flash())
app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res)
  next()
})
app.use((req, res, next) => {
  res.locals.notice = req.flash('notice')
  res.locals.errors = req.flash('errors')
  next()
})
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(cookieParser())
app.use(validate.attachAuthLocals) //activate attachAuthLocals for all routes
app.use(utilities.checkJWTToken)


/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root


/* ***********************
 * Routes
 *************************/
app.use(express.static("public")) // set static folder
//Index route
app.get("/", baseController.buildHome)
// Inventory routes
app.use("/inv", inventoryRoute)
app.use("/inv", vehicleRoute);
app.use("/account", accountRoute);
app.use("/upgrade", upgradeRoute);

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500;
const host = process.env.HOST || "0.0.0.0";

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, host, () => {
  console.log(`app listening on ${host}:${port}`)
});
