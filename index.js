import express from 'express';
import bodyParser from 'body-parser';
import users from './routes/api.user.js';
// import pool from './model/connection'

const app = express();
const PORT = process.env.PORT || 3000;


// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/api/user', users); 
// Example route
app.get('/', (req, res) => {

  res.send('Hello, world!');
});

//   .get((req, res) => {
    
//     console.log(res.body); 
//   })
  
//   .post((req, res) => {

//     console.log(res.body);
//   })
  
//   .put((req, res) => {
//     console.log(res.body);
//   })

//   .patch((req, res) => {
//     console.log(res.body);
//   })

//   .delete((req, res) => {
//     console.log(res.body);
//   })

  

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});