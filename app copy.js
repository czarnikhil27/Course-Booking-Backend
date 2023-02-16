require('dotenv').config();
// Create Express App
const express = require('express');
const app = express();

// Body Parser
const morgan = require('morgan');
const bodyParser = require('body-parser');

//Routes import

const cors = require('./cors');
const error = require('./error');

// Connect Database
var connectDatabase = require('./databaseConnect')
const DATABASE_KEY = "mongodb+srv://czarnikhil:Babajirocks12@cluster0.s2o7utp.mongodb.net/?retryWrites=true&w=majority"
connectDatabase(DATABASE_KEY);


//Body Parser
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
//Handeling cors error

app.use(cors);
app.post('/practice-course/v1/user/login',(req,res,next)=>{
    res.status(200).json({message:"fg"})
})
app.use(error);

module.exports = app;