import React from "react";
import { Outlet } from "react-router-dom";
import Leftsidebar from "./Leftsidebar";
import Playbar from "./Playbar";  
export default function Layout() {
  return (
    <div >
      <Leftsidebar />
       
    </div>
  );
}
