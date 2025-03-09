const Question = require("../models/question");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "your_jwt_secret_key"; // Thay bằng secret key của bạn

// Lấy danh sách câu hỏi
exports.getQuestions = async (req, res) => {
  try {
    const questions = await Question.find(); // Lấy danh sách câu hỏi từ database

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
    res.render("questions/listQuestion", { questions, user });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Lấy chi tiết câu hỏi
exports.getQuestionDetail = async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);
    if (!question)
      return res.status(404).json({ message: "Question not found" });

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

    res.render("questions/detail", { question, user });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Hiển thị form tạo câu hỏi mới
exports.createQuestion = (req, res) => {
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
  res.render("questions/create", { user });
};

// Xử lý tạo câu hỏi mới
exports.createQuestionAction = async (req, res) => {
  try {
    const newQuestion = new Question(req.body);
    await newQuestion.save();
    res.redirect("/questions");
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};
// Cập nhật câu hỏi
exports.editQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);
    if (!question)
      return res.status(404).json({ message: "Question not found" });

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

    res.render("questions/edit", { question, user });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

exports.updateQuestionAction = async (req, res) => {
  try {
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.questionId,
      req.body,
      { new: true }
    );

    res.redirect("/questions");
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Xóa câu hỏi
exports.deleteQuestion = async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.questionId);
    res.redirect("/questions");
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};
