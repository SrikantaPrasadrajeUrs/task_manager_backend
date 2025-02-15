import jwt from "jsonwebtoken"
import { NextFunction, Request, Response } from "express"
import { User, users } from "../db/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { AuthRequest } from "../interfaces";
import { UUID } from "crypto";
import dotenv from "dotenv"

dotenv.config();

 export const auth = async(req:AuthRequest,res:Response,next:NextFunction)=>{
    try {
        
        const token = req.headers['x-auth-token'];
        if(!token){
            res.status(401).json({message:"Token is missing! access denied"});
            return;
        }
        console.log("middleware",token,process.env.SECRET);
        const verified = jwt.verify(token as string,process.env.SECRET_KEY!);
        if (!verified) {
            throw new Error("Invalid or expired token");
        }
        
        const verifiedData = verified as {id:UUID,email:string};

            const [user] = await db.select().from(users).where(eq(users.id,verifiedData.id));
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            req.user=verifiedData.id;
            req.token = token as string;
            next();
    } catch (error) {
        res.status(403).json({message:error instanceof Error? error.stack:"Authentication Error"});
    }
}