export const authCheck = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
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