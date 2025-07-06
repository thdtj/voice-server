const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// پوشه ذخیره فایل‌ها
const upload = multer({ dest: "uploads/" });
fs.mkdirSync("uploads", { recursive: true });
fs.mkdirSync("data", { recursive: true });

// چک سلامت سرور
app.get("/", (req, res) => {
  res.send("Bot backend server is running.");
});

// فقط ذخیره شماره (اختیاری)
app.post("/submit", (req, res) => {
  const { phone, note } = req.body;
  if (!phone) return res.status(400).send("Phone number is required");

  const entry = `Phone: ${phone}\nNote: ${note || "-"}\nTime: ${new Date().toISOString()}\n\n`;
  fs.appendFileSync("data/phones.txt", entry);
  res.send("Phone number saved.");
});

// ذخیره عکس رسید و شماره
app.post("/upload", upload.single("receipt"), (req, res) => {
  const { phone } = req.body;
  const file = req.file;

  if (!phone || !file) return res.status(400).send("Phone and image required");

  const logEntry = `Phone: ${phone}\nImage: ${file.filename}\nTime: ${new Date().toISOString()}\n\n`;
  fs.appendFileSync("data/receipts.txt", logEntry);
  res.send("Receipt uploaded and saved.");
});

// نمایش فایل‌ها
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot backend listening on port ${PORT}`);
});
