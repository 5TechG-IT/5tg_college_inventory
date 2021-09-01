import missing from "./missing.jpg";
import "./style.css";
import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="middle">
      <h1>Sorry! Page is not found.</h1>
      <h1>You should request for this page.</h1>
      <img
        className="missing"
        src={missing}
        alt="sorry for missing component"
      />
      <Link to="/">
        <button className="notfound-button">Move to Home</button>
      </Link>
    </div>
  );
};

export default NotFound;
