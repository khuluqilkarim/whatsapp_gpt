const mysql = require("promise-mysql");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: null,
  database: "whatsapp_help",
});

function getConnection() {
  return connection;
}

module.exports = { getConnection };
