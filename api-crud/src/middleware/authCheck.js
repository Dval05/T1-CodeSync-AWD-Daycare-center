export const authCheck = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Dev bypass: allow `x-dev-user` header when not in production
    if (!authHeader && process.env.NODE_ENV !== 'production') {
        const devUser = req.headers['x-dev-user'] || req.headers['x_dev_user'];
        if (devUser) {
            // Attach a synthetic token and user info for local testing
            req.token = `dev-${devUser}`;
            req.user = { userId: Number(devUser) || devUser };
            return next();
        }
    }

    if (!authHeader) {
        return res.status(401).json({ error: 'Falta token de autorización (Authorization Header)' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Formato de token inválido. Debe ser: Bearer [TOKEN]' });
    }

    req.token = token;

    next();
};