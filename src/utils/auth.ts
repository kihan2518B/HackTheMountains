import { useRouter } from "next/router";
import { useEffect } from "react";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export function useAuth(redirectPath: string = "/login") {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token") ?? "{}";

        if (!token) {
            router.push(redirectPath)
        }

        try {
            jwt.verify(token, JWT_SECRET);
        } catch (error) {
            router.push(redirectPath);
        }
    }, [router, redirectPath])
}

export function getUserRoleFromToken(token: string): string {
    try {
        const { role } = JSON.parse(atob(token.split('.')[1]));
        return role;
    } catch {
        return '';
    }
}

export function getUserIdFromToken(token: string): string {
    try {
        const { id } = JSON.parse(atob(token.split('.')[1]));
        return id; // Adjust according to your token structure
    } catch {
        return '';
    }
}

