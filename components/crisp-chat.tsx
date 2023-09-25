"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export const CrispChat = () => {
  useEffect(() => {
    Crisp.configure("90dd4c94-559d-452f-8999-4525b8434fc0");
  }, []);

  return null;
};
