const mongoose = require('mongoose');
const dotenv=require('dotenv');
dotenv.config({path:'./.env'});
const app = require('./app');
const db=process.env.DATABASE_URL;
const connect = async()=>{
    try{
        mongoose.connect(db).then(
           console.log("connected")
       );
   }
   catch(error){
       console.log(error);
   }
}
mongoose.connection.on("disconnected",()=>{
    console.log("disconnected")
})
const PORT = 8080;
app.listen(PORT,()=>{
    connect();
    console.log(`staring ${PORT}`)
});

