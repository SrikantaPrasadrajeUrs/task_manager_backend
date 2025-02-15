import { Router, Request, Response } from "express";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { users , NewUser, User } from "../db/schema";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { SignUpBody, LoginBody } from "../interfaces";
import { loginUser, signUpUser } from "../controllers/index";
import { auth } from "../middleware/auth";

dotenv.config();

const secret:string= process.env.SECRET??"";

const authRouter = Router();

authRouter.post("/signup",signUpUser);

authRouter.post("/login",loginUser);

export default authRouter;