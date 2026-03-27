import React from "react";
import "../../exbosHome.css";
import Navbar from "../navbar";
import Dashboard from "../dashboard";
 
const LandingPage = () => {
  return (
    <div className="eb-page">
      <Navbar />
      <Dashboard />
    </div>
  );
};
 
export default LandingPage;
 