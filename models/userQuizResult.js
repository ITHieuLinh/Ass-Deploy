const mongoose = require("mongoose");

// Schema lưu kết quả làm bài của user
const UserQuizResultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ID của user
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true }, // ID của quiz
    questionResults: [
        {
            questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true }, // ID câu hỏi
            isCorrect: { type: Boolean, required: true } // Câu trả lời đúng hay không
        }
    ],
    totalScore: { type: Number, default: 0 } // Tổng điểm đạt được
});

const UserQuizResult = mongoose.model("UserQuizResult", UserQuizResultSchema);

module.exports = UserQuizResult;
