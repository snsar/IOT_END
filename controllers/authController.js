const User = require('../models/User')
const bcrypt = require('bcrypt');

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
            req.session.user = { id: user.id, email: user.email };
            res.redirect('/');
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