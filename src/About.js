import React, { useEffect } from "react";

const About = ({ app, setApp }) => {
  useEffect(() => {
    setApp(false);
  });
  return (
    <div className="container-fluid h-100">
      <div className="row align-items-center h-25">
        <h1 id="about-title" className="p-1 m-2 text-center">
          About the System
        </h1>
      </div>

      <div className="row">
        <div className="col-6 d-flex justify-content-center">
          <p className="p-2 w-75">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </div>
        <div className="col-6 d-flex justify-content-center">
          <p className="p-2 w-75">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
