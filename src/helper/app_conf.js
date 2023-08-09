const qrcode = require("qrcode-terminal");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const client = new Client({
  puppeteer: {
    headless: true,
  },
  authStrategy: new LocalAuth({
    clientId: "YOUR_CLIENT_ID",
  }),
});

const qr_code = client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

const client_ready = client.on("ready", () => {
  console.log("Client is ready!");
});

const clear = client.initialize();
function init() {
  clear;
}
function whatsapp_connect() {
  return qr_code, client_ready;
}

module.exports = {
  init,
  client,
  whatsapp_connect,
  MessageMedia,
};
