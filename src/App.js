import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Navbar from "./Navbar";
import Home from "./Home";
import About from "./About";
import VotingApp from "./VotingApp";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AppNavbar from "./AppNavbar";
import AppHome from "./AppHome";
import AppProfile from "./AppProfile";
import data from "../src/data/voterdata.json";
import keccak256 from "keccak256";
import Merkletree from "merkletreejs";
import VotingRoom from "./VotingRoom";
import CreateVoting from "./CreateVoting";
import RegisterVoting from "./RegisterVoting";

function App() {
  const [account, setAccount] = useState([]);
  const [app, setApp] = useState(false);
  const object = Object.values(data.voterData);
  const finalArray = object.map(function (obj) {
    return [obj.identifier, obj.name, obj.birthdate];
  });
  const leaves = [
    "0xe4dd56d5e2f519525edb5665356a4e692845c99743276481c38b985558081733",
    "0xcfee7c08a98f4b565d124c7e4e28acc52e1bc780e3887db0a02a7d2d5bc66728",
  ];
  const tree = new Merkletree(leaves, keccak256, { sortPairs: true });
  const toHex = (voter) => "0x" + voter.toString("hex");
  const leaf =
    "0xe4dd56d5e2f519525edb5665356a4e692845c99743276481c38b985558081733";

  console.log(toHex(tree.getRoot()));
  // console.log(finalArray[0]);

  const proofs = tree.getProof(leaf).map((voter) => toHex(voter.data));
  console.log(proofs);
  return (
    <div className="App vh-100">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Navbar
                app={app}
                setApp={setApp}
                account={account}
                setAccount={setAccount}
              />
            }
          >
            <Route index element={<Home app={app} setApp={setApp} />} />
            <Route path="about" element={<About app={app} setApp={setApp} />} />
            <Route path="/app/">
              <Route
                index
                element={
                  <AppHome
                    account={account}
                    setAccount={setAccount}
                    app={app}
                    setApp={setApp}
                  />
                }
              />
              <Route
                path="profile"
                element={
                  <AppProfile
                    account={account}
                    setAccount={setAccount}
                    app={app}
                    setApp={setApp}
                  />
                }
              />
              <Route
                path="voting/:roomId"
                element={
                  <VotingRoom
                    account={account}
                    setAccount={setAccount}
                    app={app}
                    setApp={setApp}
                  />
                }
              />
              <Route
                path="create"
                element={
                  <CreateVoting
                    account={account}
                    setAccount={setAccount}
                    app={app}
                    setApp={setApp}
                  />
                }
              />
              <Route
                path="register"
                element={
                  <RegisterVoting
                    account={account}
                    setAccount={setAccount}
                    app={app}
                    setApp={setApp}
                  />
                }
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer position="bottom-center" closeOnClick={false} />
    </div>
  );
}

export default App;
