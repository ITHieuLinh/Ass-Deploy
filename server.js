const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./configs/database');
const quizRoutes = require('./routes/quizRouter');
const questionRoutes = require('./routes/questionRouter');
const questionAndQuiz = require('./routes/questionAndQuizRouter');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const https = require('https');
const jwt = require('jsonwebtoken');
const { expressjwt: jwtMiddleware } = require('express-jwt');
const cookieParser = require('cookie-parser');

dotenv.config();
connectDB();

const app = express();

// Đọc chứng chỉ SSL (tự ký) cho HTTPS
const privateKey = fs.readFileSync('key.pem', 'utf8');
const certificate = fs.readFileSync('cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Sử dụng cookie-parser
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cấu hình EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Cấu hình JWT
const JWT_SECRET = 'your_jwt_secret_key'; // Thay bằng secret key an toàn

// Middleware để đọc token từ cookie
const getTokenFromCookie = (req) => {
  if (req.cookies && req.cookies.jwt) {
    return req.cookies.jwt;
  }
  return null;
};

// Cấu hình express-jwt để đọc token từ cookie
app.use(
  jwtMiddleware({
    secret: JWT_SECRET,
    algorithms: ['HS256'],
    getToken: getTokenFromCookie, // Sử dụng hàm getTokenFromCookie để đọc token từ cookie
  }).unless({
    path: ['/auth/facebook', '/auth/facebook/callback', '/', '/login', '/logout'], // Bỏ qua các route không cần xác thực
  })
);

// Cấu hình ứng dụng Facebook
const CLIENT_ID = '646670241089515'; // Thay bằng Client ID của bạn
const CLIENT_SECRET = 'd5163466d31e0781760f294db98d70a8'; // Thay bằng Client Secret của bạn
const REDIRECT_URI = 'https://localhost:3000/auth/facebook/callback'; // Sử dụng HTTPS

// Route đăng nhập Facebook
app.get('/auth/facebook', (req, res) => {
  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=public_profile,email`;
  res.redirect(authUrl);
});

// Xử lý callback từ Facebook
app.get('/auth/facebook/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Không nhận được mã xác thực từ Facebook');

  try {
    const tokenResponse = await axios.get(
      `https://graph.facebook.com/v19.0/oauth/access_token`,
      {
        params: {
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          code: code,
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    const userInfoResponse = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
    );

    const userInfo = userInfoResponse.data;
    const { id: facebookId, name: username, email } = userInfo;

    // Tạo JWT với thông tin người dùng
    const token = jwt.sign(
      { facebookId, username, email },
      JWT_SECRET,
      { expiresIn: '1h' } // Token hết hạn sau 1 giờ
    );

    // Lưu token vào cookie
    res.cookie('jwt', token, { httpOnly: true });
    res.redirect('/');
  } catch (error) {
    console.error('Lỗi chi tiết từ Facebook:', error.response ? error.response.data : error.message);
    res.status(500).send('Lỗi hoàn tất OAuth: ' + (error.response ? error.response.data.error.message : error.message));
  }
});

// Route chính
app.get('/', (req, res) => {
  const token = req.cookies.jwt; // Đọc token từ cookie
  let user = null;

  if (token) {
    try {
      user = jwt.verify(token, JWT_SECRET); // Xác thực token và lấy thông tin người dùng
    } catch (err) {
      // Token không hợp lệ, không làm gì cả
    }
  }

  res.render('home', { user }); // Truyền biến user vào template
});

// Route đăng nhập
app.get('/login', (req, res) => {
  const token = req.cookies.jwt; // Đọc token từ cookie
  let user = null;

  if (token) {
    try {
      user = jwt.verify(token, JWT_SECRET); // Xác thực token và lấy thông tin người dùng
    } catch (err) {
      // Token không hợp lệ, không làm gì cả
    }
  }

  res.render('login', { user }); // Truyền biến user vào template
});

// Route đăng xuất
app.get('/logout', (req, res) => {
  res.clearCookie('jwt'); // Xóa cookie jwt
  res.redirect('/'); // Chuyển hướng về trang chủ
});

// Sử dụng các route khác
app.use('/', questionAndQuiz);

// Khởi động server HTTPS
const server = https.createServer(credentials, app);
server.listen(3000, '0.0.0.0', () => {
  console.log('🚀 Server đang chạy tại http://0.0.0.0:3000');
});