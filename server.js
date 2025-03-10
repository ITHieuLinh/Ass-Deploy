const express = require('express');
const dotenv = require('dotenv');
dotenv.config(); // Load biến môi trường ngay đầu file

const connectDB = require('./configs/database');
const quizRoutes = require('./routes/quizRouter');
const questionRoutes = require('./routes/questionRouter');
const questionAndQuiz = require('./routes/questionAndQuizRouter');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { expressjwt: jwtMiddleware } = require('express-jwt');
const cookieParser = require('cookie-parser');

const app = express();

// Kiểm tra PORT từ môi trường hoặc dùng mặc định 3000
const PORT = process.env.PORT || 3000;

// Kết nối Database
connectDB();

// Middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cấu hình EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Cấu hình JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware lấy token từ cookie
const getTokenFromCookie = (req) => req.cookies?.jwt || null;

app.use(
  jwtMiddleware({
    secret: JWT_SECRET,
    algorithms: ['HS256'],
    getToken: getTokenFromCookie,
  }).unless({
    path: ['/auth/facebook', '/auth/facebook/callback', '/', '/login', '/logout'],
  })
);

// Cấu hình Facebook OAuth
const CLIENT_ID = process.env.FB_CLIENT_ID || '646670241089515';
const CLIENT_SECRET = process.env.FB_CLIENT_SECRET || 'd5163466d31e0781760f294db98d70a8';
const REDIRECT_URI = process.env.FB_REDIRECT_URI || `http://localhost:${PORT}/auth/facebook/callback`;

// Route Facebook OAuth
app.get('/auth/facebook', (req, res) => {
  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=public_profile,email`;
  res.redirect(authUrl);
});

app.get('/auth/facebook/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Không nhận được mã xác thực từ Facebook');

  try {
    const tokenResponse = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: { client_id: CLIENT_ID, client_secret: CLIENT_SECRET, redirect_uri: REDIRECT_URI, code },
    });

    const accessToken = tokenResponse.data.access_token;
    const userInfoResponse = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
    );

    const { id: facebookId, name: username, email } = userInfoResponse.data;

    // Tạo JWT
    const token = jwt.sign({ facebookId, username, email }, JWT_SECRET, { expiresIn: '1h' });

    // Lưu token vào cookie
    res.cookie('jwt', token, { httpOnly: true });
    res.redirect('/');
  } catch (error) {
    console.error('Lỗi OAuth Facebook:', error.response?.data || error.message);
    res.status(500).send('Lỗi OAuth Facebook: ' + (error.response?.data?.error?.message || error.message));
  }
});

// Routes
app.get('/', (req, res) => {
  const token = req.cookies?.jwt;
  let user = null;
  if (token) {
    try {
      user = jwt.verify(token, JWT_SECRET);
    } catch (err) {}
  }
  res.render('home', { user });
});

app.get('/login', (req, res) => {
  const token = req.cookies?.jwt;
  let user = null;
  if (token) {
    try {
      user = jwt.verify(token, JWT_SECRET);
    } catch (err) {}
  }
  res.render('login', { user });
});

app.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/');
});

// Gắn routes vào app
app.use('/', questionAndQuiz);

// Khởi động server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
