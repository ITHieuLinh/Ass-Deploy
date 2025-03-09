const Question = require("../models/question");
const Quiz = require("../models/quiz");
const UserQuizResult = require("../models/userQuizResult");
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret_key'; // Thay bằng secret key của bạn

const saveUserScore = async (req, res) => {
  try {
    const { userId, quizId, questionId, userAnswerIndex } = req.body;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Câu hỏi không tồn tại" });
    }

    const isCorrect = question.correctAnswerIndex === userAnswerIndex;
    const score = isCorrect ? 1 : 0; // 1 điểm nếu đúng, 0 nếu sai

    let userQuizResult = await UserQuizResult.findOne({ userId, quizId });

    if (!userQuizResult) {
      userQuizResult = new UserQuizResult({
        userId,
        quizId,
        questionResults: [{ questionId, isCorrect }],
        totalScore: score,
      });
    } else {
      const questionAlreadyAnswered = userQuizResult.questionResults.some((q) =>
        q.questionId.equals(questionId)
      );

      if (questionAlreadyAnswered) {
        return res.status(400).json({
          message: "Câu hỏi này đã được trả lời trước đó, không thể cộng điểm lại",
        });
      }

      userQuizResult.questionResults.push({ questionId, isCorrect });

      const quiz = await Quiz.findById(quizId);
      const maxScore = quiz.questions.length;
      userQuizResult.totalScore = Math.min(userQuizResult.totalScore + score, maxScore);
    }

    await userQuizResult.save();

    res.status(200).json({
      message: "Kết quả được lưu thành công",
      totalScore: userQuizResult.totalScore,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lưu điểm:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

module.exports = { saveUserScore };