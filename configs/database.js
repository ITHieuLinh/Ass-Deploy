
    const mongoose = require("mongoose");

    const connectDB = async () => {
        try {
            await mongoose.connect("mongodb+srv://root:123@sellticket.crjks.mongodb.net/manageQuiz");
            console.log("✅ Kết nối database manageProduct thành công!");
        } catch (error) {
            console.log("❌ Lỗi kết nối database:", error.message);
        }
    };

    module.exports = connectDB;
