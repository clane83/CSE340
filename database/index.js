const { Pool } = require("pg")
require("dotenv").config()
/* ***************
 * Connection Pool
 * SSL Object needed for local testing of app
 * But will cause problems in production environment
 * If - else will make determination which to use
 * *************** */
let pool
if (process.env.NODE_ENV == "development") {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, // keep SSL on dev if you need it locally
    })

    module.exports = {
        async query(text, params) {
            try {
                const res = await pool.query(text, params)
                console.log("executed query", { text })
                return res
            } catch (error) {
                console.error("error in query", { text })
                throw error
            }
        },
        pool, // <-- export pool too (consistent shape)
    }
} else {
    // PRODUCTION (Render) — needs SSL
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },    // <-- REQUIRED on Render
    })

    // keep the same export shape as dev so db.query(...) works the same
    module.exports = {
        async query(text, params) {
            return pool.query(text, params)
        },
        pool,
    }
}