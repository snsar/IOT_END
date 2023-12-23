const User = require('../models/User')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
require('dotenv').config();

let mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_CODE
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
    }
});

async function getAllUsers(req, res) {
    try {
        const users = await User.findAll();
        res.render('home',  { users });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

function getLogin(req, res) {
    res.render('login');
}

async function postLogin(req, res) {
    const { email, password } = req.body;
    
    try {
        const user = await User.findOne({ where: { email } });

        if (user && bcrypt.compareSync(password, user.password)) {
            req.session.user = { id: user.id, full_name: user.full_name, email: user.email };
            res.redirect('/predict');
        } else {
            res.render('login', { error: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).render('login', { error: 'Internal Server Error' });
    }
}

function getSignUp(req, res) {
    res.render('signup');
}

async function postSignUp(req, res) {
    const { full_name, email, password } = req.body;

    // console.log({ name, email, password})

    try {
        // Basic input validation, you should add more validation as needed
        if (!full_name || !email || !password) {
            return res.status(400).render('signup', { error: 'All fields are required' });
        }

        // Check if the user with the given email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).render('signup', { error: 'Email is already in use' });
        }

        // Create a new user record
        const newUser = await User.create({
            full_name,
            email,
            password, // You should hash the password before storing it in a real application
        });
        var content = '';
        content += `
            <div style="padding: 10px; background-color: #003375">
                <div style="padding: 10px; background-color: white;">
                    <h4 style="color: #0085ff">Tạo tài khoản thành công</h4>
                    <span style="color: black">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</span>
                </div>
                <div style="width: 100%; color: #c3dd73;">
                    <p style="margin-top: 20px; font-size: 14px;">Best regards,</p>
                    <p>QuyenLT</p>
                </div>
                
            </div>
        `;

        let mailDetails = {
            from: {
                name: 'IOT TEAM',
                address: process.env.GMAIL_USER
            },
            to: email,
            subject: 'Tạo tài khoản thành công',
            html: content,
        };
         
        await mailTransporter.sendMail(mailDetails, function(err, data) {
            if(err) {
                console.log(err);
            } else {
                console.log('Email sent successfully');
            }
        });

        // Redirect to a success page or login page
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).render('signup', { error: error });
    }
}


function getLogout(req, res) {
    // Hủy session để đăng xuất
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/login');
        }
    });
}

module.exports = {
    getAllUsers,
    getLogin,
    postLogin,
    getSignUp,
    postSignUp,
    getLogout
};