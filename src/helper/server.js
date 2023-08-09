const express = require("express");
const bodyParser = require("body-parser");
const { getConnection } = require("../helper/database");

let app = express();
const port = 3000;
const conn_port = app.listen(port, () => {
  console.log(`App is running at port ${port}`);
});

function connection_port() {
  return conn_port;
}

const insert_new_user = async (id) => {
  const conn = await getConnection();
  const result = await conn.query(
    "INSERT INTO `user_account` (`id_account`, `nomer`) VALUES (NULL,?);",
    [id]
  );
  return result[0];
};

const IsRegister = async (id) => {
  const conn = await getConnection();
  const result = await conn.query(
    "SELECT nomer FROM user_account WHERE nomer = ?",
    [id]
  );
  const Insert_Limit = await conn.query(
    "INSERT INTO user_limit (id_account, chat_limit) SELECT ua.id_account, 10 FROM user_account ua WHERE ua.nomer = ? AND NOT EXISTS ( SELECT 1 FROM user_limit ul WHERE ul.id_account = ua.id_account )",
    [id]
  );
  return result[0], Insert_Limit[0];
};

const IsGPT = async (id) => {
  const conn = await getConnection();
  const result = await conn.query(
    " UPDATE user_limit ul JOIN user_account ua ON ul.id_account = ua.id_account SET ul.chat_limit = ul.chat_limit - 1 WHERE ua.nomer = ? AND ul.chat_limit > 0;",
    [id]
  );
  return result[0];
};

const IsAdmin = async (id) => {
  const conn = await getConnection();
  const result = await conn.query(
    "SELECT nomer FROM user_account WHERE nomer = ?",
    [id]
  );
  return result[0];
};

const GetLimit = async (id) => {
  const conn = await getConnection();
  const result = await conn.query(
    "SELECT ul.chat_limit FROM user_limit ul JOIN user_account ua ON ul.id_account = ua.id_account WHERE ua.nomer = ?",
    [id]
  );
  return result[0];
};

const InsertNews = async (news) => {
  const conn = await getConnection();
  const result = await conn.query(
    "INSERT INTO `user_news` (`id_news`, `content`) VALUES (NULL, ?)",
    [news]
  );
  return result[0];
};

const insert_username = async (id, username) => {
  const conn = await getConnection();
  const result = await conn.query(
    "UPDATE tb_user SET username = ? WHERE tb_user.user_number = ?",
    [username, id]
  );
  return result[0];
};
module.exports = {
  connection_port,
  app,
  IsRegister,
  IsAdmin,
  insert_username,
  InsertNews,
  IsGPT,
  GetLimit,
};
