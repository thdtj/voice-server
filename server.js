const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
const upload = multer();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// توکن ربات ادمین
const ADMIN_BOT_TOKEN = "8097601891:AAFBoNMDTbpA_ee0AwRM3vS-1p5_YGCuGao";
const bot = new TelegramBot(ADMIN_BOT_TOKEN);

// متغیر برای نگه‌داشتن آیدی ادمین
let adminChatId = null;

// ثبت آیدی ادمین وقتی استارت می‌زند (مستقیم در کد ربات هم ثبت می‌شه اما اینجا برای اطمینان)
app.post("/set-admin", (req, res) => {
  const { chat_id } = req.body;
  if (!chat_id) return res.status(400).send("chat_id missing");
  adminChatId = chat_id;
  res.send("✅ Admin registered");
});

// دریافت شماره و ارسال مستقیم برای ربات ادمین
app.post("/submit", (req, res) => {
  const { phone } = req.body;
  if (!phone || !adminChatId) return res.status(400).send("Missing phone/admin");

  const message = `📞 شماره جدید ثبت شد:\n${phone}`;
  bot.sendMessage(adminChatId, message);
  res.send("✅ شماره ارسال شد به ادمین");
});

// دریافت رسید و ارسال مستقیم به ادمین
app.post("/upload", upload.single("receipt"), (req, res) => {
  const { phone } = req.body;
  const file = req.file;
  if (!file || !adminChatId) return res.status(400).send("Missing file/admin");

  const fileBuffer = file.buffer;
  const caption = `📤 رسید دریافتی\n📞 شماره: ${phone || "نامشخص"}`;

  bot.sendPhoto(adminChatId, fileBuffer, {
    caption,
    reply_markup: {
      inline_keyboard: [
        [
          { text: "✅ تأیید و ارسال کانفیگ", callback_data: phone || "unknown" }
        ]
      ]
    }
  });

  res.send("✅ رسید ارسال شد به ربات ادمین");
});

// اجرا روی پورت مشخص
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
