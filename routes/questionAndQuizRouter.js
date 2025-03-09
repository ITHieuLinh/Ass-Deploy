const express = require("express");
const router = express.Router();
const questionController = require("../controller/questionsController");
const quizController = require("../controller/quizController");

// Route chính
router.get("/", (req, res) => {
  res.render("home");
});

// Route cho câu hỏi
router.get("/questions/create", questionController.createQuestion); // Sử dụng controller
router.get("/questions/edit/:questionId", questionController.editQuestion);
router.post(
  "/questions/edit/:questionId",
  questionController.updateQuestionAction
);
router.post("/questions/delete/:questionId", questionController.deleteQuestion);
router.get("/questions", questionController.getQuestions);
router.post("/questions", questionController.createQuestionAction);
router.get("/questions/:questionId", questionController.getQuestionDetail);

// Route cho quiz
router.get('/quizzes/create', quizController.createQuiz);

// Các route khác
router.get("/quizzes", quizController.getQuizzes);
router.get("/quizzes/:quizId", quizController.getQuizDetail);
router.post("/quizzes", quizController.createQuizAction);
router.get("/quizzes/edit/:quizId", quizController.editQuiz);
router.post("/quizzes/edit/:quizId", quizController.updateQuizAction);
router.post("/quizzes/delete/:quizId", quizController.deleteQuiz);

module.exports = router;
