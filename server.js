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

// ایجاد پوشه‌ها (در صورت نبود)
fs.mkdirSync("uploads", { recursive: true });
fs.mkdirSync("data", { recursive: true });

// ذخیره رسیدها
const upload = multer({ dest: "uploads/" });

// تست سرور
app.get("/", (req, res) => {
  res.send("✅ Bot backend server is running.");
});

// دریافت و ذخیره شماره تلفن
app.post("/submit", (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).send("Phone number is required");

  const log = `📞 Phone: ${phone}\n🕒 Time: ${new Date().toISOString()}\n\n`;
  fs.appendFileSync("data/phones.txt", log);
  res.send("📲 شماره ذخیره شد.");
});

// دریافت و ذخیره عکس رسید
app.post("/upload", upload.single("receipt"), (req, res) => {
  const { phone } = req.body;
  const file = req.file;

  if (!phone || !file) return res.status(400).send("شماره و تصویر اجباری است.");

  const log = `📞 Phone: ${phone}\n🖼️ Image: ${file.filename}\n🕒 Time: ${new Date().toISOString()}\n\n`;
  fs.appendFileSync("data/receipts.txt", log);

  res.send("📤 رسید با موفقیت ذخیره شد.");
});

// مسیر عمومی برای دیدن عکس‌ها
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// نمایش تمام شماره‌ها
app.get("/numbers", (req, res) => {
  const filePath = path.join(__dirname, "data", "phones.txt");
  if (!fs.existsSync(filePath)) return res.send("📭 هیچ شماره‌ای ذخیره نشده.");
  const data = fs.readFileSync(filePath, "utf-8");
  res.type("text/plain").send(data);
});

// نمایش تمام رسیدها
app.get("/receipts", (req, res) => {
  const filePath = path.join(__dirname, "data", "receipts.txt");
  if (!fs.existsSync(filePath)) return res.send("📭 هیچ رسیدی ذخیره نشده.");
  const data = fs.readFileSync(filePath, "utf-8");
  res.type("text/plain").send(data);
});

// اجرای سرور
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
