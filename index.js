import express from "express";
import authRoutes from "./routes/auth.js";
import expertRoutes from "./routes/expert.js";
import customerRoutes from "./routes/customer.js";
import postRoutes from "./routes/posts.js";
import userRoutes from "./routes/users.js";
import cors from "cors";

const app = express();

app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true 
  }));
//middlewares
app.use(express.json())

app.use("/api/auth",authRoutes)
app.use("/api/posts",postRoutes)
app.use("/api/customer",customerRoutes)
app.use("/api/expert",expertRoutes)
app.use("/api/users",userRoutes)


app.listen(8800,()=>{
    console.log("Api is working");
})