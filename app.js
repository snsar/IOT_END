const express = require('express');
const session = require("express-session");
const path = require("path");
const { engine } = require('express-handlebars')
const sequelize = require("./configs/connection");

const userController = require('./controllers/authController');
const auth = require('./middlewares/auth');


const app = express();
const PORT = process.env.PORT || 8080;

app.use(session({
   secret: 'your-secret-key',
   resave: false,
   saveUninitialized: true
}));

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
 
       app.listen(PORT, () => {
          console.log(`Server is running at: http://localhost:${PORT}`);
       });
    } catch (error) {
       console.error("Unable to connect to the database:", error.original);
       process.exit(1); // Exit with failure code
    }
 };

 initApp();