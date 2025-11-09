import express from "express";
import authRoutes from "./routes/auth.js";
import roomRoutes from "./routes/room.js";
import userRoutes from "./routes/users.js";
import getValuesRoutes from "./routes/getvalues.js";
import cors from "cors";

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    callback(null, true); // tüm originlere izin verir
  },
  credentials: true
}));

app.use(express.json());

app.use("/api/auth",authRoutes)
app.use("/api/room",roomRoutes)
app.use("/api/users",userRoutes)
app.use("/api/send",getValuesRoutes)

app.get('/', (req, res) => {
  res.send('hello world');
});


app.listen(8800,()=>{
    console.log("Api is working");
})