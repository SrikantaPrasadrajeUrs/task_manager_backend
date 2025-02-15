import { Router} from "express";
import dotenv from "dotenv";
import { loginUser, signUpUser, tokenIsValid } from "../controllers";

dotenv.config();

const authRouter = Router();

authRouter.post("/signup",signUpUser);

authRouter.post("/login",loginUser);

authRouter.get("/tokenIsValid",tokenIsValid);

export default authRouter;