import { UUID } from "crypto";
import { Request } from "express";

interface SignUpBody{
    name:string;
    email:string;
    password:string;
}

interface LoginBody{
    email:string;
    password:string;
}

interface AuthRequest extends Request{
    user?:UUID;
    token?:string;
}

export {SignUpBody, LoginBody, AuthRequest};