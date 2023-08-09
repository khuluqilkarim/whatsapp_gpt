const qrcode = require("qrcode-terminal");
const { getConnection } = require("./helper/database");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const axios = require("axios");
const {
  IsRegister,
  IsAdmin,
  InsertNews,
  GetLimit,
  IsGPT,
} = require("../src/helper/server");
const pattern_gpt = /!gpt\s+(.+)/;
const client = new Client({
  puppeteer: {
    headless: true,
  },
  authStrategy: new LocalAuth({
    clientId: "YOUR_CLIENT_ID",
  }),
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

const getResponseAI = async (pesanMasuk, API_KEY) => {
  const response = await ChatRequest(pesanMasuk, API_KEY);
  if (!response.success) {
    return response.message;
  }
  return response.data;
};

const ChatRequest = async (pesanMasuk, API_KEY) => {
  const result = {
    success: false,
    data: "",
    message: "",
  };

  return await axios({
    method: "post",
    url: "https://api.openai.com/v1/completions",
    data: {
      model: "text-davinci-003",
      prompt: pesanMasuk,
      max_tokens: 1000,
      temperature: 0,
    },
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "Accept-Language": "in-ID",
      Authorization: `Bearer ${API_KEY}`,
    },
  })
    .then((response) => {
      if (response.status == 200) {
        const { choices } = response.data;
        if (choices && choices.length) {
          result.success = true;
          result.data = choices[0].text;
        }
      } else {
        result.message = "Failed response";
      }
      return result;
    })
    .catch((error) => {
      result.message = "Error : " + error.message;
      return result;
    });
};

client.on("message", async (message) => {
  try {
    // user management
    var IsUser = message;
    var user_number = IsUser.from;
    var validate = await IsRegister(user_number);
    var msg_content = IsUser.body;
    console.log(IsUser);
    if (validate != undefined) {
      console.log("sudah terdaftar");
    } else {
      console.log("Anda sudah didaftar");
      await IsRegister(user_number);
    }

    if (IsUser.type == "chat") {
      var isadmin = await IsAdmin(user_number);

      if (msg_content.startsWith("!news") && isadmin != undefined) {
        await InsertNews(msg_content);
      } else if (msg_content.startsWith("!gpt")) {
        var get_limit = await GetLimit(user_number);
        if (get_limit.chat_limit > 0) {
          await IsGPT(user_number);
          var prompt = msg_content.match(pattern_gpt);
          console.log(prompt[1]);
          var API_Respons = await getResponseAI(
            prompt[1],
            "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"
          );
          var msg = `${API_Respons}\n${parseInt(get_limit.chat_limit) - 1}`;
          client.sendMessage(user_number, msg);
        }
        console.log(get_limit);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
});

client.initialize();
