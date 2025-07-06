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

// پوشه‌ها
fs.mkdirSync("uploads", { recursive: true });
fs.mkdirSync("data", { recursive: true });

// تنظیمات ذخیره عکس
const upload = multer({ dest: "uploads/" });

// تست سلامت سرور
app.get("/", (req, res) => {
  res.send("✅ Bot backend server is running.");
});

// ذخیره شماره تلفن
app.post("/submit", (req, res) => {
  const { phone, note } = req.body;
  if (!phone) return res.status(400).send("Phone number is required");

  const entry = `Phone: ${phone}\nNote: ${note || "-"}\nTime: ${new Date().toISOString()}\n\n`;
  fs.appendFileSync("data/phones.txt", entry);
  res.send("Phone number saved.");
});

// ذخیره عکس رسید + شماره
app.post("/upload", upload.single("receipt"), (req, res) => {
  const { phone } = req.body;
  const file = req.file;

  if (!phone || !file) return res.status(400).send("Phone and image required");

  const logEntry = `Phone: ${phone}\nImage: ${file.filename}\nTime: ${new Date().toISOString()}\n\n`;
  fs.appendFileSync("data/receipts.txt", logEntry);
  res.send("Receipt uploaded and saved.");
});

// مسیر عکس‌ها
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 📱 نمایش همه شماره‌ها
app.get("/numbers", (req, res) => {
  const filePath = path.join(__dirname, "data", "phones.txt");
  if (!fs.existsSync(filePath)) return res.send("هیچ شماره‌ای ثبت نشده.");
  const data = fs.readFileSync(filePath, "utf-8");
  res.type("text/plain").send(data);
});

// 🧾 نمایش همه رسیدها
app.get("/receipts", (req, res) => {
  const filePath = path.join(__dirname, "data", "receipts.txt");
  if (!fs.existsSync(filePath)) return res.send("هیچ رسیدی ثبت نشده.");
  const data = fs.readFileSync(filePath, "utf-8");
  res.type("text/plain").send(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Bot backend listening on port ${PORT}`);
});
