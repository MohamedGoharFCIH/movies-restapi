const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors')
const userController = require('./controllers/user')
const userRoutes = require('./routes/user');
const movieRoutes = require("./routes/movie");
const categoryRoutes = require("./routes/category");
const file = require("./middleware/file");

const upload  = file.extractFile;



mongoose.connect('mongodb://localhost:27017/movies', { useNewUrlParser: true })
  .then(() => {
    console.log('connect to DB ');

  }).catch(() => {
    console.log("Connection Failed");
  });


mongoose.Promise = global.Promise;

const app = express();
app.use(upload);
app.use("/images", express.static(path.join("./images")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use('/api/user', userRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/movie', movieRoutes);

app.get('/', (req, res) => {

  res.send('hello Server running on localhost: 3000');
});

app.get('*', (req, res) => {
  res.send('Error 404 ...! Page Not Found');
});



app.listen(3000, () => {
  console.log("Server is running at port 3000");
  userController.seed_admin();
});