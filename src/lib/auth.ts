import { TypeUser } from '@/types';
import jwt from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '10d'; // Provide a default if needed

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
}

export const generateToken = (user: TypeUser) => {
    const Payload = {
        _id: user._id,
        email: user.email,
    } // Payload
    //Returning token
    return jwt.sign(
        Payload,
        JWT_SECRET,  // Secret key
        { expiresIn: JWT_EXPIRES_IN }  // Expiration time
    );
};

export const verifyToken = (token: string) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, JWT_SECRET, (err: any, decoded: TypeUser) => {
            if (err) {
                return reject(err);
            }
            resolve(decoded as TypeUser); // Explicitly cast to User type
        });
    });
};