const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load biến môi trường từ .env
dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("❌ MONGODB_URI không được định nghĩa. Kiểm tra file .env");
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Kết nối database thành công!");
  } catch (error) {
    console.error("❌ Lỗi kết nối database:", error.message);
    process.exit(1); // Dừng server nếu không kết nối được database
  }
};

module.exports = connectDB;
