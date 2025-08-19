import "@/styles/loader-styles.css";
import React from "react";

function Loader({ className }: { className?: string }) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden ${className}`}
    >
      <div className="three-body">
        <div className="three-body__dot"></div>
        <div className="three-body__dot"></div>
        <div className="three-body__dot"></div>
      </div>
    </div>
  );
}

export default Loader;
