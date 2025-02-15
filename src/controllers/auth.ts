import { NextFunction, Request, Response, Router } from "express";
import { SignUpBody,LoginBody, VerifyRequest } from "../interfaces";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { users , NewUser, User, refreshTokenTables } from "../db/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const signUpUser = async(req:Request<{},{},SignUpBody>,res:Response)=>{
      try {
          const { name, email, password } = req.body;
          // check if the user already exists
          const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, email));
            if(existingUser){
                
                res.status(400).json({message:"User email is already exist"});
                return;
            }
    
               let hasedPassword = await bcrypt.hash(password,7);
               let newUser:NewUser = {
                name,
                email,
                password:hasedPassword
               };
               const [storedUser] = await db.insert(users).values(newUser).returning();
               res.status(201).json({message:"Signup Successful!",userData: removePassword(storedUser)});
        } catch (error) {
           res.status(500).json({error: error}); 
        }
}

function generateAccessToken(id:string,email:string,key:string) {
    if(!id&&!email) return;
    return jwt.sign({id:id,email:email},key,{expiresIn:'15m'});
}

function generateRefreshToken(id:string,email:string,key:string) {
    if(!id&&!email) return;
    return jwt.sign({id:id,email:email},key,{expiresIn:'10d'});
}

const removePassword = (user:User)=>{
    const {password,...userdata} = user;
    return userdata;
}


const loginUser = async (req:Request<{},{},LoginBody>,res:Response)=>{
 try {
    let secret = ""; //should get from env
      const { email, password } = req.body;
      // check if the user already exists
      const [existingUser]: User[] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
        if(!existingUser||!existingUser.id){
            res.status(400).json({message:"Email does not exist! Please sign-up"});
            return;
        }

           let isMatched = await bcrypt.compare(password,existingUser.password);
           if(!isMatched){
            res.status(400).json({"message":"Incorrect password"});
            return;
           }
           const refreshKey = process.env.REFRESH_KEY;
           const secretKey = process.env.SECRET_KEY;
            if (!refreshKey || !secretKey) {
                throw new Error("Missing refresh key or user details");
            }

           let refreshToken = generateRefreshToken(existingUser.id,existingUser.email,refreshKey);
           let accessToken = generateAccessToken(existingUser.id,existingUser.email,secretKey);
           if(!refreshToken){
            throw new Error('Undefined refresh-token');
           }
           const refreshTokenExists = await db.select().from(refreshTokenTables)
           .where(eq(refreshTokenTables.userId,existingUser.id));
           if(refreshTokenExists){
            await db.delete(refreshTokenTables).where(eq(refreshTokenTables.userId,existingUser.id));
           }
           await db.insert(refreshTokenTables).values({userId:existingUser.id,token:refreshToken});
           res.json({message:"Login successful",userData:{...removePassword(existingUser),refreshToken,accessToken}});
    } catch (error) {
       res.status(500).json({error: error}); 
    }
}


const tokenIsValid = async (req:Request,res:Response)=>{
    try {
        const token = req.headers["x-auth-token"] as string|undefined;
    if (!token) {
     res.status(401).json({ message: "No token provided" });
     return;
    }
    const refreshKey = process.env.REFRESH_KEY;
    const secretKey = process.env.SECRET_KEY;
    if (!refreshKey||!secretKey) {
        throw new Error("Key Access Error");
    }
    const isVerified = jwt.verify(token,refreshKey);
    if(!isVerified){
         res.status(498).json({ message: "Invalid Token" });
         return;
    }
    const {id,email} = isVerified as {id:string,email:string};
    const [user] = await db.select().from(users).where(eq(users.id,id));
    if(!user){
         res.status(401).json({message:"User not found"});
         return;
    }
    const accessToken = generateAccessToken(id,email,secretKey);
    res.status(200).json({message:"Valid token",userData:{...removePassword(user),accessToken}})
    } catch (error) {
        res.status(500).json({message:"Some error Occurred"});
    }
};

export {signUpUser,tokenIsValid,loginUser};