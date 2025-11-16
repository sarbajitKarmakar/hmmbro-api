function apiAuthenticator(req, res, next) {
  const apiKey = req.header('x-api-key'); 

  const validApiKey = process.env.API_KEY || 'my-secret-api-key';

  if (!apiKey) {
    return res.status(401).json({ error: 'API key missing' });
  }

  if (apiKey !== validApiKey) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  next();
}

export default apiAuthenticator;
