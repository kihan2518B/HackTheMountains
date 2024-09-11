import { verifyToken } from '@/lib/auth';

import { TypeUser } from '@/types';

// Middleware function to verify JWT token
export async function middleware(req: Request) {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    console.log("Token: ", token);
    if (!token) {
        throw new Error('Authentication token missing')
    }
    try {
        const decodedUser = await verifyToken(token) as Omit<TypeUser, 'password'>;
        console.log("decoded User: ", decodedUser);
        return decodedUser;
    } catch (error) {
        throw new Error("Invalid or expired token");
    }
}