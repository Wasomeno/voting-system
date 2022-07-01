import React, { useEffect } from "react";
import ReactPlayer from "react-player";

const Home = ({ app, setApp }) => {
  useEffect(() => {
    setApp(false);
  });

  return (
    <div className="container-fluid h-100">
      <div className="row h-75 align-items-center justify-content-center text-center">
        <div className="col-6">
          <h1 id="home-title" className="m-3">
            Decentralize Voting System
          </h1>
          <h6 id="home-subtitle" className="m-2">
            Better than the Centralize one.
          </h6>
        </div>
      </div>
    </div>
  );
};

export default Home;
