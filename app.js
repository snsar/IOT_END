const express = require('express');
const session = require("express-session");
const mqtt = require('mqtt');
const socketIo = require('socket.io');
const http = require('http');
const path = require("path");
const { engine } = require('express-handlebars')
const sequelize = require("./configs/connection");

const userController = require('./controllers/authController');
const auth = require('./middlewares/auth');


const app = express();
const PORT = process.env.PORT || 8080;

const server = http.createServer(app); // Tạo một server http từ Express app
const io = socketIo(server); // Gắn Socket.IO vào server http

const mqttClient = mqtt.connect('mqtt://192.168.8.101');

mqttClient.on('connect', () => {
	console.log('Connected to MQTT broker');
});

// lỗi kết nối
mqttClient.on('error', (error) => {
	console.log(error);
});

// Theo dõi topic bạn quan tâm
mqttClient.subscribe('human/combinedData');

// Xử lý khi nhận được dữ liệu từ MQTT broker
mqttClient.on('message', (topic, message) => {
    // Chuyển đổi message từ Buffer sang chuỗi và tách giá trị bằng dấu phẩy
    const dataValues = message.toString().split(',');

    // Kiểm tra xem có đủ giá trị hay không
    if (dataValues.length === 3) {
        // Lấy giá trị từ mảng và gán vào các biến tương ứng và chuẩn hoá giá trị
        const heartrate = parseFloat(dataValues[0]).toFixed(2);
        const sp02 = parseFloat(dataValues[1]).toFixed(2);
        const temperature = parseFloat(dataValues[2]).toFixed(2);

        // Hiển thị dữ liệu trong console
        console.log('Heart Rate:', heartrate);
        console.log('SpO2:', sp02);
        console.log('Temperature:', temperature);

        // Gửi dữ liệu tới tất cả các clients thông qua Socket.IO (nếu cần)
        io.emit('mqttData', { heartrate, sp02, temperature });
    } else {
        console.error('Invalid data format');
    }
});


// Khi kết nối WebSocket
io.on('connection', (socket) => {
	console.log('Client connected');
	// Có thể thực hiện các tác vụ khác nếu cần
  });

app.use(session({
   secret: 'your-secret-key',
   resave: false,
   saveUninitialized: true
}));

// lưu phiên làm việc hiện tại
app.use((req, res, next) => {
   // console.log(req.session);  // Kiểm tra giá trị session ở đây
   res.locals.session = req.session;
   next();
});


// Configure handlebars
app.engine('.hbs', engine({extname: '.hbs'}) );
app.set('view engine', '.hbs');
app.set('views', './views');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// app.get('/', (req, res, next) => {
//     res.render('home', {layout: false});
// });
app.get('/', userController.getAllUsers);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/signup', userController.getSignUp);
app.post('/signup', userController.postSignUp);
app.get('/logout', userController.getLogout);

app.get('/test', auth, (req, res) => {
   res.send('Trang test, chỉ được truy cập nếu đã đăng nhập');
});

const initApp = async () => {
    console.log("Testing the database connection..");
 
    // Test the connection.
    try {
       await sequelize.sync();
       console.log("Connection has been established successfully!");
       /**
        * Start the web server on the specified port.
        */
 
       server.listen(PORT, () => {
          console.log(`Server is running at: http://localhost:${PORT}`);
       });
    } catch (error) {
       console.error("Unable to connect to the database:", error.original);
       process.exit(1); // Exit with failure code
    }
 };

 initApp();