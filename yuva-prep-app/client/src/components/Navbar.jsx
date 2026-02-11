import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center bg-white/20 backdrop-blur-md px-8 py-4 shadow fixed w-full z-50 border-b border-white/30">
      <div className="text-2xl font-bold text-[#EBD3F8] tracking-wide">
        YUVAPREP
      </div>
      <div className="flex space-x-6 text-white font-medium">
        <Link to="/#about" className="hover:text-[#AD49E1]">About</Link>
        <Link to="/login" className="hover:text-[#AD49E1]">Login</Link>
        <Link to="/profile" className="hover:text-[#AD49E1]">Profile</Link>
      </div>
    </nav>
  );
};

export default Navbar;
