
    const mongoose = require("mongoose");

    const connectDB = async () => {
        try {
            await mongoose.connect("mongodb://127.0.0.1:27017/manageQuiz", {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log("✅ Kết nối database manageProduct thành công!");
        } catch (error) {
            console.log("❌ Lỗi kết nối database:", error.message);
        }
    };

    module.exports = connectDB;
