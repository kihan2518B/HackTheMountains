"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from "next/link";
import Button from "react-bootstrap/Button";
import Image from "next/image";

const LoginForm: React.FC = () => {
    const [loginLoading, setLoginLoading] = useState(false);
    const router = useRouter();


    const handleLogin = async(e: any) => {
        e.preventDefault();

        setLoginLoading(true);
        const formData = new FormData(e.target); // tacking data from the form
        const data = {
        email: formData.get("email"),
        password: formData.get("password")
        }
        
        try {
            const response = await fetch('/api/auth/login', {
                method: "POST",
                headers: {
                    'Content_Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if(response.ok){
                localStorage.setItem('token', result.token);
                toast.success(result.message)
                setTimeout(() => {
                    switch(result.role){
                        case 'provider':
                          router.push("/providerDashboard"); // if user have role 'provider' then push "/providerDashboard"
                          break;
            
                        case 'client':
                        default:
                          router.push("/"); // if user have role 'client' then push "/"
                          break;
                    }
                }, 1000);
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.error("error", error);
            toast.error("Somthing Went Wrong")
        } finally {
            setLoginLoading(false);
        }
    };

    return (
        <section className="h-full w-full bg-BGOne rounded-2xl py-10 px-5">
            <h1 className="text-center text-ColorTwo fontFjord text-3xl min-[500px]:text-5xl lg:text-7xl font-bold ">
                Login
            </h1>
            <div className="">
                <div className="flex h-full flex-wrap items-center justify-center lg:justify-between">
                <div className="mb-12 md:mb-0 md:w-8/12 lg:w-6/12 lg:block hidden">
                    <Image
                    src="https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg"
                    className="w-full"
                    alt="Phone image"
                    width={200}
                    height={200}
                    />
                </div>
                <form
                    className="block max-w-xl mx-auto mt-10"
                    onSubmit={handleLogin}
                >
                    <input
                    required
                    type="email"
                    id="email"
                    name="email"
                    className="bg-BGTwo shadow-ColorOne inline-block rounded-lg shadow-md px-6 py-3 mb-5 text-base w-full placeholder-ColorThree/50"
                    placeholder="Email"
                    />
                    <br />

                    <input
                    required
                    type="password"
                    id="password"
                    name="password"
                    className="bg-BGTwo shadow-ColorOne inline-block rounded-lg shadow-md px-6 py-3 mb-5 text-base w-full placeholder-ColorThree/50"
                    placeholder="Password"
                    />
                    <br />
                    {loginLoading ? (
                    <Button
                        type="submit"
                        disabled
                        className="flex w-full justify-center rounded-md bg-gradient-to-r from-ColorOne to-CustomBlue to px-3 py-1.5 text-sm font-semibold text-BGTwo/80 shadow-sm hover:bg-gradient-to-l"
                    >
                        Logging...
                    </Button>
                    ) : (
                    <Button
                        type="submit"
                        className="flex w-full justify-center rounded-md bg-gradient-to-r from-ColorOne to-CustomBlue to px-3 py-1.5 text-sm font-semibold text-BGTwo shadow-sm hover:bg-gradient-to-l"
                    >
                        Login
                    </Button>
                    )}

                    <div className="text-right my-1  border-t pt-4">
                    <Link className="underline text-ColorOne" href={"/"}>
                        Forgot Password
                    </Link>
                    </div>

                    <div className="text-center my-4 text-ColorThree border-t pt-4">
                    Dont have account?{" "}
                    <Link className="underline text-ColorOne" href={"/signup"}>
                        Register here &raquo;
                    </Link>
                    </div>
                </form>
                </div>
            </div>
        </section>
    );
};

export default LoginForm;
