"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import Button from "react-bootstrap/Button";
import Image from "next/image";

const SignupForm: React.FC = () => {
  const [SigUpLoading, setSigUpLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSigUpLoading(true);

    const formData = new FormData(e.target as HTMLFormElement); // tacking form data
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      // console.log("password",password)
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);

        localStorage.setItem("token", result.token); // saving token to the localstorage
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
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    } finally {
      setSigUpLoading(false);
    }
  };

  return (
    <section className="h-full w-full bg-BGOne rounded-2xl py-10 px-5">
      <h1 className="text-center text-ColorTwo fontFjord text-3xl min-[500px]:text-5xl lg:text-7xl font-bold ">
        Sign Up
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
            onSubmit={handleSignUp}
          >

            <input
              required
              type="text"
              id="name"
              name="name"
              className="bg-BGTwo shadow-ColorOne inline-block rounded-lg shadow-md px-6 py-3 mb-5 text-base w-full placeholder-ColorThree/50"
              placeholder="Name"
            />
            <br />

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
            {SigUpLoading ? (
              <Button
                type="submit"
                disabled
                className="flex w-full justify-center rounded-md bg-gradient-to-r from-ColorOne to-CustomBlue to px-3 py-1.5 text-sm font-semibold text-BGTwo/80 shadow-sm hover:bg-gradient-to-l"
              >
                Creating...
              </Button>
            ) : (
              <Button
                type="submit"
                className="flex w-full justify-center rounded-md bg-gradient-to-r from-ColorOne to-CustomBlue to px-3 py-1.5 text-sm font-semibold text-BGTwo shadow-sm hover:bg-gradient-to-l"
              >
                SignUp
              </Button>
            )}

            <div className="text-right my-1  border-t pt-4">
              <Link className="underline text-ColorOne" href={"/"}>
                Forgot Password
              </Link>
            </div>

            <div className="text-center my-4 text-ColorThree border-t pt-4">
              Already have account?{" "}
              <Link className="underline text-ColorOne" href={"/login"}>
                Login here &raquo;
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignupForm;