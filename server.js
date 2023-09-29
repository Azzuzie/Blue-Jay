const express=require('express')
const app=express()
const cors=require('cors')
const mongoose=require('mongoose')
const bodyParser=require('body-parser')

const db=mongoose.connection;
mongoose.connect("mongodb://127.0.0.1:27017/InternTask",  {
    useNewUrlParser: true
  });

  db.on("connected",()=>{
    console.log("successfully connected")
  })
  db.on("error",()=>{
    console.log("error while connecting")
  })

  require('./models/user_model')
  app.use(cors());

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended:true}))
  
  app.use(require('./routes/tweet_route'))
  
  app.listen(4000, () => {
    console.log("Server is running at port 4000");
  });