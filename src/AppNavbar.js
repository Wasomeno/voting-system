import React, { useRef } from "react";
import { NavLink, Outlet } from "react-router-dom";
import gsap from "gsap";

const AppNavbar = ({ account, setAccount }) => {
  const isConnected = Boolean(account[0]);

  async function connectAccount() {
    if (window.ethereum) {
      const account = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(account);
    }
  }
  return (
    <>
      <div
        id="navbar"
        className="d-flex justify-content-around align-items-center p-2 m-1"
      >
        <div className="col-2 d-flex flex-column justify-content-center align-items-center">
          <NavLink id="navbar-list" to="/app/">
            {" "}
            App
          </NavLink>
        </div>

        <div className="col-2 d-flex flex-column justify-content-center align-items-center">
          <NavLink id="navbar-list" to="/app/create">
            {" "}
            Create
          </NavLink>
        </div>
        <div className="col-2 d-flex flex-column justify-content-center align-items-center">
          <NavLink id="navbar-list" to="/app/register">
            {" "}
            Register
          </NavLink>
        </div>
        <div className="col-2 d-flex flex-column justify-content-center align-items-center">
          <NavLink id="navbar-list" to="/app/profile">
            {" "}
            Profile
          </NavLink>
        </div>

        {isConnected ? (
          <h5
            id="navbar-button"
            className="btn col-2 m-0 d-flex align-items-center"
          >
            <img
              src="https://www.svgrepo.com/show/313848/dot-circle.svg"
              alt="test"
              width="24px"
              className="mx-2"
            />
            {account[0].slice(0, 6) + "..." + account[0].slice(36, 42)}
          </h5>
        ) : (
          <button
            id="navbar-button"
            href="about"
            onClick={connectAccount}
            className="col-2 btn m-0 p-0 d-flex align-items-center"
          >
            <img
              src="https://www.svgrepo.com/show/313848/dot-circle.svg"
              alt="test"
              width="24px"
              className="mx-2"
            />
            Connect
          </button>
        )}
      </div>
      <Outlet />
    </>
  );
};

export default AppNavbar;
