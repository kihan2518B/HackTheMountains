"use client"

import { Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isTokenExpired } from "@/utils/utils";
import Navbar from "@/components/Navbar";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showNavbar, setShowNavbar] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {

    const checkAuthentication = () => {
      const token = localStorage.getItem('token');
      // console.log("token",token)

      if (token) {
        // console.log(token)
        if (isTokenExpired(token)) {
          localStorage.removeItem('token');
          setShowNavbar(false); // Optionally hide the Navbar here
          router.push("/login");
        } else {

          if (pathname === '/login' || pathname === '/signup' || pathname === '/registerProvider') { //Not showing navbar in these pages
            setShowNavbar(false);
          } else {
            setShowNavbar(true);
          }
          setLoading(false);
        }
        console.log("Token Is there")
      }
    };

    checkAuthentication();
  }, [pathname, router]);

    const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!stripePublishableKey) {
    throw new Error("Stripe publishable key is missing");
    }

    const stripePromise = loadStripe(stripePublishableKey);


  return (
    <html lang="en">
      <body className={`${inter.className} overflow-x-hidden scroll-smooth p-0 m-0`}>
        {loading ? (<div>Loading...</div>) :
          (
            <>
              {showNavbar && <Navbar />}
              <Elements stripe={stripePromise}>
                {children}
              </Elements>
              <ToastContainer />
            </>
          )
        }
      </body>
    </html>
  );
}
