import React, { useEffect, useState } from "react";
import VotingABI from "./abi/Voting.json";
import { ethers, BigNumber } from "ethers";
import NotConnected from "./NotConnected";

import PuffLoader from "react-spinners/PuffLoader";
import { toast } from "react-toastify";

const VotingContract = "0x120E04D5a360C8BE1DE3Ad8140754ef1f18E5774";

const CreateVoting = ({ account, setAccount, setApp }) => {
  const isConnected = Boolean(account[0]);
  const [count, setCount] = useState(3);
  const [room, setRoom] = useState("");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [startTime, setStartTime] = useState("");
  const [sending, setSending] = useState(false);

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(VotingContract, VotingABI.abi, signer);

  async function createVoting() {
    setSending(true);
    let array = [];
    let data;
    for (let i = 1; i <= count; i++) {
      data = ethers.utils.formatBytes32String(
        document.getElementById("candidate" + i).value
      );
      array.push(data);
    }
    console.log(array);
    const titleHashed = ethers.utils.formatBytes32String(title);
    const durationBig = BigNumber.from(duration);
    const startTimeBig = BigNumber.from(startTime);
    const roomBig = BigNumber.from(room);

    try {
      await contract
        .createVoting(titleHashed, durationBig, startTimeBig, roomBig, array)
        .then((response) => {
          toast
            .promise(provider.waitForTransaction(response.hash), {
              pending: "🗳️Creating Room " + room + "...",
              success: "Room " + room + " creation success",
              error: "Transaction Failed",
            })
            .then(setSending(false));
        });
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    setApp(true);
  });

  return (
    <div className="container-fluid w-50 d-flex flex-column justify-content-center align-items-center h-100">
      {isConnected ? (
        <>
          <h1 id="create-voting-title" className="p-2 mb-3 text-center">
            Create Voting
          </h1>
          <div>
            <div className="row justify-content-center">
              <div className="mb-3">
                <label
                  id="create-voting-label"
                  htmlFor="voting-title"
                  className="form-label"
                >
                  Voting Room Number
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="voting-room-number"
                  aria-describedby="emailHelp"
                  onChange={(e) => setRoom(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label
                  id="create-voting-label"
                  htmlFor="voting-title"
                  className="form-label"
                >
                  Voting Session Title
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="voting-session-title"
                  aria-describedby="emailHelp"
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label
                  id="create-voting-label"
                  htmlFor="voting-duration"
                  className="form-label"
                >
                  Voting Duration (in hour)
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="voting-duration"
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label
                  id="create-voting-label"
                  htmlFor="voting-time"
                  className="form-label"
                >
                  Voting Session Start Time
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="voting-time"
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label
                  id="create-voting-label"
                  htmlFor="voting-candidates"
                  className="form-label"
                >
                  Candidates
                </label>
                <div className="row g-2 flex-wrap">
                  {(() => {
                    let td = [];
                    for (let i = 1; i <= count; i++) {
                      td.push(
                        <div className="col-4" key={i}>
                          <input
                            type="text"
                            className="form-control"
                            id={"candidate" + i}
                          />
                        </div>
                      );
                    }
                    return td;
                  })()}
                </div>
              </div>

              {sending ? (
                <div className="w-20 m-2 d-flex flex-column justify-content-center align-items-center">
                  <PuffLoader
                    id="loader"
                    color="black"
                    loading={sending}
                    speedMultiplier="1"
                    size={60}
                    className="m-3"
                  />
                  <h6 id="form-text">Creating voting room..</h6>
                </div>
              ) : (
                <button
                  className="btn rounded-pill bg-primary w-25 m-3 text-white"
                  onClick={createVoting}
                >
                  Create
                </button>
              )}
            </div>
          </div>
        </>
      ) : (
        <NotConnected />
      )}
    </div>
  );
};

export default CreateVoting;
