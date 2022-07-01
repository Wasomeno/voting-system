import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Buffer } from "buffer/";

const root = ReactDOM.createRoot(document.getElementById("root"));
window.Buffer = window.Buffer || Buffer;
root.render(<App />);
