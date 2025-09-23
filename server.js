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
const session = require("express-session");
const pool = require('./database/');
const flash = require("connect-flash")
const app = express();



/* ***********************
 * Middleware
 * ************************/
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
