"use client"

import { Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isTokenExpired } from "@/utils/auth";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showNavbar, setShowNavbar] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {

    const checkAuthentication = () => {
      const token = localStorage.getItem('token') ?? "{}";
      const User = JSON.parse(localStorage.getItem("User") ?? "{}");
      // console.log("token",token)

      if (token) {
        if (isTokenExpired(token)) {
          localStorage.removeItem('token');
          setShowNavbar(false); // Optionally hide the Navbar here
          router.push("/login");
        } else {

          if (pathname === '/login' || pathname === '/signup' || pathname === '/register') { //Not showing navbar in these pages
            setShowNavbar(false);
          } else {
            setShowNavbar(true);
          }
          setLoading(false);
        }

      } else {
        // Check if the current path is allowed without token
        if (pathname === '/signup' || pathname === '/login' || pathname === '/register') {
          setShowNavbar(false);
        } else {
          setShowNavbar(false);
          router.push('/login'); // Hide Navbar for non-authenticated users on specific routes
        }
        setLoading(false);
      }
    };

    checkAuthentication();
  }, [pathname, router]);


  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while checking authentication
  }

  return (
    <html lang="en">
      <body className={`${inter.className} overflow-x-hidden scroll-smooth p-0 m-0`}>

        {showNavbar && (
          <Navbar />
        )}
        {children}
        <ToastContainer />

      </body>
    </html>
  );
}