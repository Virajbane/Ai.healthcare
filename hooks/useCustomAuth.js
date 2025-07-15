"use client";

import { useEffect, useState } from "react";

export const useCustomAuth = () => {
  const [user, setUser] = useState(null); // { id, name, role, etc. }

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return {
    user,
    isSignedIn: !!user,
    logout
  };
};
