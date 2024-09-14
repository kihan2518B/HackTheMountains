"use client"

import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'react-toastify';

const LogoutButton: React.FC = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token'); // removing token from the localstorage
      router.push("/login");
    } catch (error) {
      toast.error('Logout failed');
      console.error(error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full h-full p-2 text-black cursor-pointer"
    >
      Logout
    </button>
  );
}

export default LogoutButton;