const pool = require("../database/");

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    throw error.message
  }

}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    throw error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountData(account_email) {
  try {
    const result = await pool.query(
      'SELECT account_firstname, account_lastname, account_email, account_type FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* *****************************
* Return by account ID
* ***************************** */
async function getById(account_id) {
  const sql = `
    SELECT account_id, account_firstname, account_lastname, account_email, account_type
    FROM account
    WHERE account_id = $1
  `
  const result = await pool.query(sql, [account_id])
  return result.rows[0]
}

/* *****************************
* Update account information
* ***************************** */
async function updateAccount({ account_id, account_firstname, account_lastname, account_email }) {
  const sql = `
    UPDATE account
      SET account_firstname = $1,
          account_lastname  = $2,
          account_email     = $3
    WHERE account_id = $4
  `
  return pool.query(sql, [account_firstname, account_lastname, account_email, account_id])
}

/* *****************************
* Update account password
* ***************************** */
async function updatePassword({ account_id, password_hash }) {
  const sql = `
    UPDATE account
      SET account_password = $1
    WHERE account_id = $2
  `
  return pool.query(sql, [password_hash, account_id])
}

module.exports = {
  registerAccount, checkExistingEmail, getAccountByEmail, getAccountData, getById,
  updateAccount, updatePassword
};