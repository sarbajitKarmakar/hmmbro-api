import express from 'express';
import bodyParser from 'body-parser';
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

app.route('/api/user') 
  .get((req, res) => {
    
    console.log(res.body);
  })
  
  .post((req, res) => {

    console.log(res.body);
  })
  
  .put((req, res) => {
    console.log(res.body);
  })

  .patch((req, res) => {
    console.log(res.body);
  })

  .delete((req, res) => {
    console.log(res.body);
  })

  // try {
  //   const result = await pool.query("SELECT * FROM products");
  //   console.log(result);
  // } catch (error) {
  //   console.log(error);
    
  // }
  

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
