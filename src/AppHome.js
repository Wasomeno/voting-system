import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ethers from "ethers";
import PuffLoader from "react-spinners/PuffLoader";
import VotingABI from "./abi/Voting.json";
import NotConnected from "./NotConnected";
import { toast } from "react-toastify";

const VotingContract = "0x120E04D5a360C8BE1DE3Ad8140754ef1f18E5774";

const AppHome = ({ account, setAccount, setApp }) => {
  const isConnected = Boolean(account[0]);
  const [roomId, setRoomId] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  function checkRoom(result) {
    if (result > 0) {
      setIsLoading(false);
      toast.success("Voting room " + roomId + " found", {
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        progress: undefined,
      });
      navigate("/app/voting/" + result);
    } else {
      setIsLoading(false);
      toast.error("Voting room " + roomId + " not found", {
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        progress: undefined,
      });
    }
  }

  async function enterRoom() {
    setIsLoading(true);

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        VotingContract,
        VotingABI.abi,
        signer
      );
      try {
        let correct;
        let votingRoom;
        const votingLength = await contract.votingCount();
        for (let i = 0; i < votingLength; i++) {
          votingRoom = await contract.votingDetails(i);
          if (votingRoom.roomId.toString() === roomId) {
            correct = i;
          }
        }
        checkRoom(correct);
      } catch (error) {
        console.log(error);
      }
    }
  }

  const onInputChange = (event) => {
    setRoomId(event.target.value);
  };

  useEffect(() => {
    setApp(true);
  });

  return (
    <div className="container-fluid h-100 d-flex flex-column justify-content-center align-items-center">
      {isConnected ? (
        <div className="d-flex flex-column align-items-center justify-content-center h-75">
          <h1 id="app-title" className="text-center m-2">
            Welcome to the Entrance
          </h1>
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

          {isLoading ? (
            <div className="w-20 m-2 d-flex flex-column justify-content-center align-items-center">
              <PuffLoader
                id="loader"
                color="black"
                loading={isLoading}
                speedMultiplier="1"
                size={60}
                className="m-3"
              />
              <h6 id="form-text">Finding voting room..</h6>
            </div>
          ) : (
            <>
              <div className="w-20 m-2">
                <input
                  type="text"
                  className="form-control"
                  id="input-voting-room"
                  aria-describedby="voting-room"
                  onChange={onInputChange}
                  value={roomId}
                />
                <div id="form-text" class="form-text text-center">
                  Input the voting room code above
                </div>
              </div>
              <button id="find-button" className="btn px-3" onClick={enterRoom}>
                Find
              </button>
            </>
          )}
        </div>
      ) : (
        <NotConnected />
      )}
    </div>
  );
};

export default AppHome;
