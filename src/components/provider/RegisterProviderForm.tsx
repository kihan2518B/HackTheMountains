"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { storage } from "@/config/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const RegisterProviderForm: React.FC = () => {
    const [image, setImage] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files && e.target.files[0]){
            setImage(e.target.files[0]);
        };
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        toast.info("Provider adding...");

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            password: formData.get("password"),
            category: formData.get("category"), 
            speciality: formData.get("speciality"), 
            location: formData.get("location")
        }

        try {

            let imageUrl = '';
      
            if (image) {
                const storageRef = ref(storage, `providers/${image.name}`);
                const uploadTask = uploadBytesResumable(storageRef, image);

                await new Promise<void>((resolve, reject) => {
                    uploadTask.on(
                        'state_changed',
                        (snapshot) => {
                            // Optional: You can handle progress here
                            const progress =
                                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                console.log(`Upload is ${progress}% done`);
                        },
                        error => { reject(error); },
                        async () => {
                            imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve();
                        }
                    );
                });
            };

            const response = await fetch("/api/provider/registerProvider", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({...data, imageUrl}),
            });

            const result = await response.json();

            if(response.ok){
                localStorage.removeItem('token'); // removing token in case of provider is already exists with role:'client' 

                localStorage.setItem('token', result.userToken);
                toast.success(result.message)
                setTimeout(() => {
                    router.push("/providerDashboard");
                }, 1000);
            } else {
                toast.error(result.message)
            }

        } catch (error) {
            console.error("Error during registration:", error);
            toast.error("Something went wrong during registration");
        }
    }

    return (
        <div className="max-w-md mx-auto py-2 px-3 my-auto border rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4">Register Provider</h1>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                required
                type="text"
                id="name"
                name="name"
                className="bg-BGTwo shadow-ColorOne inline-block rounded-lg shadow-md px-6 py-3 text-base w-full placeholder-ColorThree/50"
                placeholder="Name"
               />
            </div>
            <div className="">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                    required
                    type="email"
                    id="email"
                    name="email"
                    className="bg-BGTwo shadow-ColorOne inline-block rounded-lg shadow-md px-6 py-3 text-base w-full placeholder-ColorThree/50"
                    placeholder="Email"
                />
            </div>
            <div className="">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                    required
                    type="password"
                    id="password"
                    name="password"
                    className="bg-BGTwo shadow-ColorOne inline-block rounded-lg shadow-md px-6 py-3 text-base w-full placeholder-ColorThree/50"
                    placeholder="Password"
                />
            </div>
            <div className="">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                <input
                    required
                    type="text"
                    id="category"
                    name="category"
                    className="bg-BGTwo shadow-ColorOne inline-block rounded-lg shadow-md px-6 py-3 text-base w-full placeholder-ColorThree/50"
                    placeholder="Category"
                />
            </div>
            <div className="">
              <label htmlFor="speciality" className="block text-sm font-medium text-gray-700">Speciality</label>
                <input
                    required
                    type="text"
                    id="speciality"
                    name="speciality"
                    className="bg-BGTwo shadow-ColorOne inline-block rounded-lg shadow-md px-6 py-3 text-base w-full placeholder-ColorThree/50"
                    placeholder="Speciality"
                />
            </div>
            <div className="">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                <input
                    required
                    type="text"
                    id="location"
                    name="location"
                    className="bg-BGTwo shadow-ColorOne inline-block rounded-lg shadow-md px-6 py-3 text-base w-full placeholder-ColorThree/50"
                    placeholder="Location"
                />
            </div>
            <div className="">
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Upload Provider's Image</label>
                <input
                    required
                    type="file"
                    id="imageUrl"
                    name="imageUrl"
                    className="bg-BGTwo shadow-ColorOne inline-block rounded-lg shadow-md px-6 py-3 text-base w-full placeholder-ColorThree/50"
                    onChange={handleImageChange}
                />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Register
            </button>
          </form>
        </div>
      );

}

export default RegisterProviderForm;