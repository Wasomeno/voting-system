import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import VotingABI from "./abi/Voting.json";
import DataABI from "./abi/VoterDataMerkle.json";
import ethers from "ethers";
import keccak256 from "keccak256";
import Merkletree from "merkletreejs";
import NotConnected from "./NotConnected";
import { fromUnixTime, getTime } from "date-fns";

import PuffLoader from "react-spinners/PuffLoader";
import { toast } from "react-toastify";

const VotingContract = "0x120E04D5a360C8BE1DE3Ad8140754ef1f18E5774";

const VoterContract = "0xEb48C8a848F195C9e538a1CBea02a3527c29dFE8";

const VotingRoom = ({ account, setAccount, setApp }) => {
  const isConnected = Boolean(account[0]);
  const { roomId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [details, setDetails] = useState();
  const [history, setHistory] = useState();
  const [selected, setSelected] = useState(0);
  const [proof, setProof] = useState("");
  const [verified, setVerified] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const votingContract = new ethers.Contract(
    VotingContract,
    VotingABI.abi,
    signer
  );
  const voterContract = new ethers.Contract(VoterContract, DataABI.abi, signer);

  async function getVotingDetails() {
    const history = await votingContract.getHistory(roomId);
    const details = await votingContract.votingDetails(roomId);
    const verif = await votingContract.checkVerifiedVoter(
      roomId,
      signer.getAddress()
    );
    const candidates = await votingContract.getCandidates(roomId);
    setCandidates(candidates);
    setDetails(details);
    setVerified(verif);
    setHistory(history);
    getStatus();
  }

  function getStatus() {
    const timeNow = getTime(new Date());
    const duration = details.duration * 3600;
    const timeStart = details.startTime * 1000;
    if (timeNow > timeStart && timeNow < timeStart + duration) {
      setStatus("Started");
    } else if (timeStart > timeNow) {
      setStatus("Not Started");
    } else {
      setStatus("Session Ended");
    }
    console.log(timeNow);
    console.log(details.startTime * 1000 + duration);
  }
  async function vote() {
    setSending(true);
    try {
      await votingContract.vote(roomId, signer.getAddress(), selected).then(
        (response) => {
          toast
            .promise(provider.waitForTransaction(response.hash), {
              pending: "🗳️ Sending voting data...",
              success: "Successfully voted for Candidate " + selected,
              error: "Transaction Failed",
            })
            .then(
              () => {
                setSending(false);
                getVotingDetails();
              },
              (error) => {
                setSending(false);
              }
            );
        },
        (error) => {
          setSending(false);
          toast.error(error.message, {
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            progress: undefined,
          });
        },
        (error) => {
          setSending(false);
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  const onRadioChange = (event) => {
    setSelected(event.target.value);
    console.log(selected);
  };

  const onProofChange = (event) => {
    const proof = event.target.value;
    setProof(proof);
  };

  async function sendProof() {
    setSending(true);
    const newProof = proof.split("/");
    const leaves = await voterContract.getLeaves(roomId);
    const hashed = keccak256(newProof);
    const tree = new Merkletree(leaves, keccak256, { sortPairs: true });
    const otherTree = await voterContract.votingToRoot(roomId);
    const toHex = (voter) => "0x" + voter.toString("hex");
    const proofs = tree.getProof(hashed).map((voter) => toHex(voter.data));

    await votingContract.verifyVoter(roomId, proofs, hashed).then(
      (response) => {
        toast
          .promise(provider.waitForTransaction(response.hash), {
            pending: "🗳️ Validating your data...",
            success: "Validation Success!",
            error: "Transaction Failed",
          })
          .then(() => {
            setSending(false);
            getVotingDetails();
          });
      },
      (error) => {
        setSending(false);
      }
    );
  }

  useEffect(() => {
    getVotingDetails();
    setApp(true);
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    provider.on("network", (newNetwork, oldNetwork) => {
      if (oldNetwork) {
        window.location.reload();
      }
    });

    window.ethereum.on("accountsChanged", function (accounts) {
      window.location.reload();
    });
  }, [isConnected]);

  return (
    <div className="container-fluid h-100 w-75">
      {isConnected ? (
        verified ? (
          <>
            <div className="row justify-content-center">
              <h2 id="voting-title" className="text-center col-12">
                {ethers.utils.parseBytes32String(details.title)}
              </h2>
              <div className="col-12 d-flex justify-content-between">
                <h5 id="voting-status" className="p-2 px-3 rounded-pill">
                  {status}
                </h5>
                <h5 id="voting-proposed" className="p-2 rounded-pill">
                  Proposed by {details.proposer.slice(0, 10)}...
                </h5>
              </div>
            </div>

            <div className="row justify-content-center">
              {candidates.map((candidate, index) => (
                <div id="candidates-card" key={index} className="col p-3 m-2">
                  <h5 id="candidate">
                    {ethers.utils.parseBytes32String(candidate.candidate)}
                  </h5>
                  <h6 id="votes">{candidate.votes.toString()}</h6>
                </div>
              ))}
            </div>
            <div className="row justify-content-between h-50">
              <div id="vote-history-card" className="col-4 m-2 p-0">
                <table class="table">
                  <thead>
                    <tr>
                      <th scope="col" className="text-center fw-normal">
                        Address
                      </th>
                      <th scope="col" className="text-center fw-normal">
                        Candidate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((hist, index) => (
                      <tr>
                        <td className="text-center">
                          {hist.voter.slice(0, 12)}...
                        </td>
                        <td className="text-center">
                          {hist.candidateId.toString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div id="vote-candidates-card" className="col m-2">
                <h3 id="title" className="text-center p-3">
                  Vote for the Candidates Test
                </h3>
                <div className="row justify-content-center">
                  {candidates.map((candidate, index) => (
                    <div
                      key={index}
                      className="col d-flex flex-column align-items-center"
                    >
                      <img src="" alt="candidates" />
                      <h6 className="p-2 text-center">
                        {ethers.utils.parseBytes32String(candidate.candidate)}
                      </h6>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="exampleRadios"
                          id="exampleRadios1"
                          value={candidate.candidateId.toString()}
                          onChange={onRadioChange}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="row justify-content-center">
                  <div className="col-4 text-center">
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
                        <h6 id="form-text">Adding your data..</h6>
                      </div>
                    ) : (
                      <button
                        id="voting-submit"
                        className="btn rounded-pill px-4"
                        onClick={vote}
                      >
                        Submit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div
            id="voter-verify"
            className="vh-100 vw-100 d-flex flex-column justify-content-center align-items-center"
          >
            <h1 id="proof" className="p-3">
              Proof
            </h1>
            <div className="w-25 m-2">
              <input
                type="text"
                className="form-control"
                id="input-voting-room"
                aria-describedby="voting-room"
                value={proof}
                onChange={onProofChange}
              />
              <div
                id="form-text"
                className="form-text text-center"
                placeholder="identifier-your name-birthdate"
              >
                Input the your registered data above
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
                <h6 id="form-text">Adding your data..</h6>
              </div>
            ) : (
              <button id="find-button" className="btn px-3" onClick={sendProof}>
                Send
              </button>
            )}
          </div>
        )
      ) : (
        <NotConnected />
      )}
    </div>
  );
};

export default VotingRoom;
