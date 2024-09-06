import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export function withAuth(handler: NextApiHandler) {

 return async (req: NextApiRequest, res: NextApiResponse) => {
    const { authorization } = req.headers; // tacking authorization from headers

    if(!authorization){
      return res.status(401).json({message: "No Token Provided"}); // if authorization is missing, mean user don't have token  
    }

    const token = authorization.split(" ")[1]; // tacking token from the authorization

    try{
      jwt.verify(token, JWT_SECRET); // verifying token 
      return handler(req, res);
    } catch(error){
      return res.status(401).json({message: "Invalid or Expired Token"}); 
    }
 };
 
}