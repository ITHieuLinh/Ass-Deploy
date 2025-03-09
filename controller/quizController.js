const Quiz = require('../models/quiz');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret_key'; // Thay bằng secret key của bạn

// Lấy danh sách các quiz
exports.getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate('questions');

    // Đọc token từ cookie
    const token = req.cookies.jwt;
    let user = null;

    if (token) {
      try {
        user = jwt.verify(token, JWT_SECRET); // Xác thực token và lấy thông tin người dùng
      } catch (err) {
        // Token không hợp lệ, không làm gì cả
      }
    }

    res.render('quiz/listQuiz', { quizzes, user });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Lấy chi tiết quiz
exports.getQuizDetail = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate('questions');
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Đọc token từ cookie
    const token = req.cookies.jwt;
    let user = null;

    if (token) {
      try {
        user = jwt.verify(token, JWT_SECRET); // Xác thực token và lấy thông tin người dùng
      } catch (err) {
        // Token không hợp lệ, không làm gì cả
      }
    }

    res.render('quiz/detail', { quiz, user });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};
// Hiển thị form tạo câu hỏi mới
exports.createQuiz = (req, res) => {
  // Đọc token từ cookie
  const token = req.cookies.jwt;
  let user = null;

  if (token) {
    try {
      user = jwt.verify(token, JWT_SECRET); // Xác thực token và lấy thông tin người dùng
    } catch (err) {
      // Token không hợp lệ, không làm gì cả
    }
  }

  // Render template và truyền biến user vào
  res.render('quiz/create', { user });
};
// Xử lý tạo quiz mới
exports.createQuizAction = async (req, res) => {
  try {
    const newQuiz = new Quiz(req.body);
    await newQuiz.save();
    res.redirect('/quizzes');
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Cập nhật quiz
exports.editQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Đọc token từ cookie
    const token = req.cookies.jwt;
    let user = null;

    if (token) {
      try {
        user = jwt.verify(token, JWT_SECRET); // Xác thực token và lấy thông tin người dùng
      } catch (err) {
        // Token không hợp lệ, không làm gì cả
      }
    }

    res.render('quiz/edit', { quiz, user });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Xử lý cập nhật quiz
exports.updateQuizAction = async (req, res) => {
  try {
    const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.quizId, req.body, { new: true });
    res.redirect('/quizzes');
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Xóa quiz
exports.deleteQuiz = async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.quizId);
    res.redirect('/quizzes');
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};