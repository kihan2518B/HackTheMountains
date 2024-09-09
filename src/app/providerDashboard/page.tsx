"use client"

import LogoutButton from "@/components/LogoutButton";
import { Provider } from "@/types/type";
import { getUserIdFromToken, getUserRoleFromToken } from "@/utils/utils";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import the datepicker's CSS

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [userID, setUserID] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userToken = localStorage.getItem("token");
      setToken(userToken);

      if (userToken) {
        const userID = getUserIdFromToken(userToken);
        setUserID(userID);
      }
    }
  }, []);

  useEffect(() => {
    const getProvider = async () => {
      if (!userID) return;

      try {
        const response = await fetch(`/api/provider/getProvider?providerID=${userID}`);
        const result = await response.json();

        if (result.user) {
          setProvider(result.user);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("An error occurred while fetching provider data");
      }
    };

    if (userID) { getProvider(); }
  }, [userID]);


  return (
    <div className="flex justify-between p-6">
      provider dashboard
      {provider ? (
        <div className="max-w-md mx-5 p-4 bg-white shadow-lg rounded-lg border border-gray-200">
          <div className="flex items-center space-x-4">
            <img
              src={provider.imageUrl}
              alt={`${provider.name}'s profile`}
              className="w-40 h-40 rounded-full object-cover shadow-md"
            />
            <div className="flex-1">
              <h2 className="text-3xl font-semibold text-gray-800 mb-2">{provider.name}</h2>
              <p className="text-lg text-gray-600 mb-2">Email: <span className="text-gray-800 font-medium">{provider.email}</span></p>
              <p className="text-lg text-gray-600 mb-2">Category: <span className="text-gray-800 font-medium">{provider.category}</span></p>
              <p className="text-lg text-gray-600 mb-2">Speciality: <span className="text-gray-800 font-medium">{provider.speciality}</span></p>
              <p className="text-lg text-gray-600 mb-2">Location: <span className="text-gray-800 font-medium">{provider.location}</span></p>
            </div>
          </div>
        </div>
      ) : (
        <p>No provider data available</p>
      )}
      {/* <LogoutButton /> */}
    </div>
  );
}
