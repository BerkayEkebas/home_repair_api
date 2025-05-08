import express from "express";
import authRoutes from "./routes/auth.js";
import expertRoutes from "./routes/expert.js";
import customerRoutes from "./routes/customer.js";
import postRoutes from "./routes/posts.js";
import userRoutes from "./routes/users.js";
import cors from "cors";

const app = express();

app.use(cors({
  origin: '*'
  // credentials: false (ya da hiç yazma)
}));
//middlewares
app.use(express.json())

app.use("/api/auth",authRoutes)
app.use("/api/posts",postRoutes)
app.use("/api/customer",customerRoutes)
app.use("/api/expert",expertRoutes)
app.use("/api/users",userRoutes)

app.get('/', (req, res) => {
  res.send('hello world');
});


app.listen(8800,()=>{
    console.log("Api is working");
})