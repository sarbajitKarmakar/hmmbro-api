function apiAuthenticator(req, res, next) {
  const apiKey = req.header('x-api-key'); // Get API key from header

  // Define your valid API key(s)
  const validApiKey = process.env.API_KEY || 'my-secret-api-key'; // Better to use environment variable

  // Check if API key is provided and valid
  if (!apiKey) {
    return res.status(401).json({ error: 'API key missing' });
  }

  if (apiKey !== validApiKey) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  // If valid, continue to the next middleware or route
  next();
}

export default apiAuthenticator;
