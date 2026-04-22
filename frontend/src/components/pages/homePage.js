import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import getUserInfo from "../../utilities/decodeJwt";

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!getUserInfo()) navigate("/login");
    else navigate("/privateUserProfile");
  }, [navigate]);

  return null;
};

export default HomePage;
