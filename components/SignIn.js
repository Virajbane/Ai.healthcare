'use client'; // Ensure that this component is treated as a client-side component

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';  // Import useRouter from next/navigation (for app directory)
import { SignInButton } from '@clerk/nextjs';

function SignIn() {
  const [isMounted, setIsMounted] = useState(false); // To ensure the component is mounted before accessing the router
  const router = useRouter(); // Get the router from next/navigation

  useEffect(() => {
    // Set isMounted to true once the component has mounted (client-side)
    setIsMounted(true);
  }, []);

  const handleSignIn = () => {
    if (router) { // Ensure the router is available before calling push
      router.push('/app/Auth/sign-in');  // Navigate to the sign-in page
    } else {
      console.error('Router is not available');
    }
  };

  // Only render the button when the component has mounted
  if (!isMounted) {
    return null;
  }

  return (
    <button
      onClick={handleSignIn}
      className="relative inline-flex h-12 active:scale-95 transition overflow-hidden rounded-lg p-[1px] focus:outline-none"
    >
      <span
        className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#e7029a_0%,#f472b6_50%,#bd5fff_100%)]"
      ></span>
      <span
        className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-slate-950 px-7 text-sm font-medium text-white backdrop-blur-3xl gap-2"
      >
        Sign In
        <svg
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          viewBox="0 0 448 512"
          height="1em"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M429.6 92.1c4.9-11.9 2.1-25.6-7-34.7s-22.8-11.9-34.7-7l-352 144c-14.2 5.8-22.2 20.8-19.3 35.8s16.1 25.8 31.4 25.8H224V432c0 15.3 10.8 28.4 25.8 31.4s30-5.1 35.8-19.3l144-352z"></path>
        </svg>
      </span>
    </button>
  );
}

export default SignIn;
