const roleCheck = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, no user found' });
        }

        if (roles.includes(req.user.role)) {
            next();
        } else {
            res.status(403).json({ message: `User role ${req.user.role} is not authorized` });
        }
    };
};

module.exports = roleCheck;
