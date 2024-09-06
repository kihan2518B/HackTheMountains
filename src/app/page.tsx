"use client"

import LogoutButton from "@/components/LogoutButton";
import { useEffect, useState } from "react";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userToken = localStorage.getItem("token"); // collecting token from the localstorage
      // console.log(userToken);
      setToken(userToken);
    }
  },[]);
  return (
    <div className="">
      Homepage
      <p>token: {token ? token : 'no token'}</p>
      <LogoutButton />
    </div>
  );
}
