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

interface VerifyRequest extends Request{
    headers:{
        "x-auth-token": string;
    }& Request['headers'];
}
export {SignUpBody, LoginBody, AuthRequest, VerifyRequest};