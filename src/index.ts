import express from "express"
import authRouter from "./routes/auth";


const app = express();
app.use(express.json())
app.use("/auth",authRouter)

app.get("/",(req,res)=>{
    res.send("welcome to my app!");
});

app.listen(8000,()=>{
    console.log("listening on 8000");
});

