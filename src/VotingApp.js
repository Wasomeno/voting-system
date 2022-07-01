import React from "react";

const VotingApp = () => {
  return (
    <div className="container-fluid h-100">
      <div className="row align-items-center justify-content-center h-75">
        <video
          id="app-voter-video"
          width="320"
          height="240"
          autoPlay
          muted
          loop
        >
          <source src="/vote-hero.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
};

export default VotingApp;
