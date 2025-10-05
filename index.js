import express from 'express';
import bodyParser from 'body-parser';
import users from './routes/api.routes.user.js';
import apiAuthenticator from './middleware/apiAuthenticator.js';
// import pool from './model/connection'

const app = express();
const PORT = process.env.PORT || 3000;


// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Example route
app.get('/', (req, res) => {
  
  res.send('Hello, world!');
});


app.use('/api/user',apiAuthenticator, users); //protected route with apiAuthenticator middleware



  

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});