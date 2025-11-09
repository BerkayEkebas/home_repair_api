import express from "express";
import { changePassword, createUser, deleteUser, getAllUsers, getUsers, updateUser } from "../controllers/userController.js";


const router = express.Router();

router.put("/change-password", changePassword);
router.put("/update-user/:id", updateUser);
router.get("/users", getUsers);
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;