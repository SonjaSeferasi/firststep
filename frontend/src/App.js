import React from "react";
import { Route, Routes } from "react-router-dom";
import "./css/card.css";
import "./index.css";

// We import all the components we need in our app
import Navbar from "./components/navbar";
import LandingPage from "./components/pages/landingPage";
import HomePage from "./components/pages/homePage";
import Login from "./components/pages/loginPage";
import Signup from "./components/pages/registerPage";
import PrivateUserProfile from "./components/pages/privateUserProfilePage";
import AlertPage from "./components/pages/alertPage";
import SmartRoutePage from "./components/pages/smartRoutePage";
import PointOfInterestPage from "./components/pages/pointofinterestpage";
import { createContext, useState, useEffect } from "react";
import getUserInfo from "./utilities/decodeJwt";
import ReviewPage from "./components/pages/reviewPage";
import TripHistoryPage from "./components/pages/tripHistoryPage";

export const UserContext = createContext();

const App = () => {
  const [user, setUser] = useState();

  useEffect(() => {
    setUser(getUserInfo());
  }, []);

  return (
    <>
      <Navbar />
      <UserContext.Provider value={user}>
        <Routes>
          <Route exact path="/" element={<LandingPage />} />
          <Route exact path="/home" element={<HomePage />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/signup" element={<Signup />} />
          <Route path="/privateUserProfile" element={<PrivateUserProfile />} />
          <Route path="/alerts" element={<AlertPage />} />
          <Route path="/smart-route" element={<SmartRoutePage />} />
          <Route path="/explore" element={<PointOfInterestPage />} />
          <Route path="/reviews" element={<ReviewPage />} />
          <Route path="/trip-history" element={<TripHistoryPage />} />
        </Routes>
      </UserContext.Provider>
    </>
  );
};


export default App;