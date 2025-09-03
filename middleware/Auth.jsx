// Authentication middleware for API token validation
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      message: 'Please provide a valid API token in the Authorization header'
    });
  }

  if (token !== process.env.API_TOKEN) {
    return res.status(403).json({ 
      error: 'Invalid token',
      message: 'The provided API token is invalid'
    });
  }

  next();
};

// Optional authentication middleware for endpoints that can work with or without auth
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token && token === process.env.API_TOKEN) {
    req.authenticated = true;
  } else {
    req.authenticated = false;
  }

  next();
};
