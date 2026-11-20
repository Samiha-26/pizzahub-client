"use client";

import React from "react";
import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#FFFFFF",
          color: "#190F0E",
          border: "1px solid #EFE7DE",
          borderRadius: "1rem",
          padding: "12px 18px",
          fontSize: "13px",
          fontWeight: 600,
          boxShadow: "0 10px 25px -5px rgba(25, 15, 14, 0.08), 0 8px 10px -6px rgba(25, 15, 14, 0.04)",
        },
        success: {
          iconTheme: {
            primary: "#059669",
            secondary: "#FFFFFF",
          },
        },
        error: {
          iconTheme: {
            primary: "#8E1616",
            secondary: "#FFFFFF",
          },
        },
      }}
    />
  );
}
