const auth = (req, res, next) => {
    if (req.session.user) {
        // Nếu có thông tin người dùng trong session, tiếp tục xử lý
        next();
    } else {
        // Nếu không có thông tin người dùng, chuyển hướng đến trang đăng nhập
        res.redirect('/login');
    }
};

module.exports = auth;