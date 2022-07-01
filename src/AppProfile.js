import React, { useEffect, useState } from "react";
import NotConnected from "./NotConnected";
import DataABI from "./abi/VoterDataMerkle.json";
import { ethers } from "ethers";

const VoterContract = "0xEb48C8a848F195C9e538a1CBea02a3527c29dFE8";

const AppProfile = ({ account, setAccount, setApp }) => {
  const isConnected = Boolean(account[0]);
  const [history, setHistory] = useState([]);

  async function getVoterData() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(VoterContract, DataABI.abi, signer);
    const voterHistory = await contract.getVoterHistory(signer.getAddress());
    setHistory(voterHistory);
  }

  useEffect(() => {
    getVoterData();
    setApp(true);
  }, [isConnected]);

  return (
    <div className="container-fluid h-100 w-75">
      {isConnected ? (
        <>
          <div className="d-flex flex-column align-items-center">
            <h1 id="profile-title" className="m-2">
              Your Profile
            </h1>
            <img
              className="p-5 bg-primary rounded-circle"
              alt="..."
              width="120px"
              height="120px"
            />
            <h5 id="profile-address" className="m-2">
              {account[0]}
            </h5>
          </div>

          <div className="d-flex align-items-center">
            <div className="col-2">
              <h6 className="m-0 p-2">Voting History</h6>
            </div>
            <div className="col-8">
              <table class="table">
                <thead>
                  <tr>
                    <th scope="col" className="text-center fw-normal">
                      Address
                    </th>
                    <th scope="col" className="text-center fw-normal">
                      Candidate
                    </th>
                    <th scope="col" className="text-center fw-normal">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((hist, index) => (
                    <tr>
                      <td className="text-center">{hist.votingId}...</td>
                      <td className="text-center">
                        {hist.candidateId.toString()}
                      </td>
                      <td className="text-center">
                        {hist.timeStamp.toString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <NotConnected />
      )}
    </div>
  );
};

export default AppProfile;
