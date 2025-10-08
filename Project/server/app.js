import bodyParser from "body-parser";
import cors from 'cors';
import express from "express";
import user from "./route/user.js";
const app = express();
const port = 8080;

app.listen(port, () => {
  console.log(`server is listening at port ${port}`);
});

const myLogger = function (req, res, next) {
  console.log("Calling middleware function");
  next();
};
app.use(myLogger);
app.use(
  cors({
    origin: "http://localhost:5173",
    //////////// Optional
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(bodyParser.json());
//middleware for user route
app.use("/user", user);

app.get("/", (req, res) => {
  ////write logic
  //response json
  // res.json({
  //     status:200,
  //     message:"Response from get api"
  // })

  //response send
  res.send("Response from get api");
});

// app.put('/user',(req,res)=>{
//     ////write logic
//     //response json
//     res.json({
//         status:200,
//         message:"Response from put api"
//     })
// })

app.all("/test", (req, res) => {
  ////write logic
  //response json
  res.json({
    status: 200,
    message: "Response from all api",
  });
});

// app.get('/user/:userid',(req,res)=>{
//     ////write logic

//     //response json
//     res.json({
//         status:200,
//         message:"Response from get api",
//         id:req.params.userid
//     })
// })

const a = 30;
console.log(a);

export default app;
