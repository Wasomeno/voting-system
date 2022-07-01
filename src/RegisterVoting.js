import React, { useEffect, useState } from "react";
import VotingABI from "./abi/Voting.json";
import DataABI from "./abi/VoterDataMerkle.json";
import ethers from "ethers";
import keccak256 from "keccak256";
import MerkleTree from "merkletreejs";
import NotConnected from "./NotConnected";
import { toast } from "react-toastify";
import PuffLoader from "react-spinners/PuffLoader";

const VotingContract = "0x120E04D5a360C8BE1DE3Ad8140754ef1f18E5774";
const VoterContract = "0xEb48C8a848F195C9e538a1CBea02a3527c29dFE8";

const RegisterVoting = ({ account, setAccount, setApp }) => {
  const isConnected = Boolean(account[0]);
  const [roomId, setRoomId] = useState(0);
  const [data, setData] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [secret, setSecret] = useState("");
  const [sending, setSending] = useState(false);

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const votingContract = new ethers.Contract(
    VotingContract,
    VotingABI.abi,
    signer
  );
  const voterContract = new ethers.Contract(VoterContract, DataABI.abi, signer);
  // const object = Object.values(data.voterData);
  // const finalArray = object.map(function (obj) {
  //   return [obj.identifier, obj.name, obj.birthdate];
  // });
  // const leaves = finalArray.map((voter) =>
  //   keccak256(Buffer.from(voter)).toString("hex")
  // );
  // const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  // const toHex = (voter) => "0x" + voter.toString("hex");
  // const leaf = keccak256(finalArray[0]);
  // tree.addLeaf(leaf);

  // console.log(toHex(tree.getRoot()));

  async function checkRoom(result) {
    const root = await voterContract.votingToRoot(result);
    if (result > 0 && root.slice(3, 8) === "00000") {
      const leaf = [identifier, name, secret];
      const leafHashed = keccak256(leaf);
      const toHex = (voter) => "0x" + voter.toString("hex");
      const leafBytes = toHex(leafHashed);
      const leaves = [
        leafBytes,
        "0xcfee7c08a98f4b565d124c7e4e28acc52e1bc780e3887db0a02a7d2d5bc66728",
      ];
      const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
      const treeHex = toHex(tree.getRoot());
      try {
        await voterContract
          .addLeaf(result, leafBytes, treeHex)
          .then((response) => {
            toast
              .promise(provider.waitForTransaction(response.hash), {
                pending: "🗳️ Adding your data to Room " + roomId + "...",
                success: "Data successfully added",
                error: "Transaction Failed",
              })
              .then(setSending(false));
          });
      } catch (error) {
        console.log(error);
      }
    } else if (result > 0 && root.slice(3, 8) !== "00000") {
      const leaf = [identifier, name, secret];
      const leafHashed = keccak256(leaf);
      const toHex = (voter) => "0x" + voter.toString("hex");
      const leafBytes = toHex(leafHashed);
      const leavesData = await voterContract.getLeaves(result);
      const tree = new MerkleTree(leavesData, keccak256, { sortPairs: true });
      tree.addLeaf(leafBytes);
      tree.addLeaf(
        "0xcfee7c08a98f4b565d124c7e4e28acc52e1bc780e3887db0a02a7d2d5bc66728"
      );
      const treeHex = toHex(tree.getRoot());
      try {
        await voterContract.addLeaf(result, leafBytes, treeHex).then(
          (response) => {
            toast
              .promise(provider.waitForTransaction(response.hash), {
                pending: "🗳️ Adding your data to Room " + roomId + "...",
                success: "Data successfully added to Room " + roomId,
                error: "Transaction Failed",
              })
              .then(
                () => {
                  setSending(false);
                },
                (error) => {
                  setSending(false);
                }
              );
          },
          (error) => {
            setSending(false);
          }
        );
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Wrong room id");
    }
  }

  async function enterRoom() {
    setSending(true);
    try {
      let correct;
      const votingLength = await votingContract.votingCount();
      let votingRoom;
      for (let i = 0; i < votingLength; i++) {
        votingRoom = await votingContract.votingDetails(i);
        if (votingRoom.roomId.toString() === roomId) {
          correct = i;
        }
      }
      checkRoom(correct);
    } catch (error) {
      console.log(error);
    }
  }

  const onInputChange = (event) => {
    setRoomId(event.target.value);
  };

  useEffect(() => {
    setApp(true);
  });

  return (
    <div className="container-fluid d-flex flex-column justify-content-center align-items-center h-100">
      {isConnected ? (
        <>
          <div className="d-flex flex-column align-items-center justify-content-center h-75">
            <h1 id="app-title" className="text-center m-2">
              Register Your Data
            </h1>

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
            <div className="w-20 m-2">
              <h6>Identifier Number</h6>
              <input
                type="text"
                className="form-control"
                id="input-voting-room"
                aria-describedby="voting-room"
                onChange={(e) => setIdentifier(e.target.value)}
                value={identifier}
              />
            </div>
            <div className="w-20 m-2">
              <h6>Your Name</h6>
              <input
                type="text"
                className="form-control"
                id="input-voting-room"
                aria-describedby="voting-room"
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
            </div>
            <div className="w-20 m-2">
              <h6>Secret</h6>
              <input
                type="text"
                className="form-control"
                id="input-voting-room"
                aria-describedby="voting-room"
                onChange={(e) => setSecret(e.target.value)}
                value={secret}
              />
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
              <button id="find-button" className="btn px-3" onClick={enterRoom}>
                Submit
              </button>
            )}
          </div>
        </>
      ) : (
        <NotConnected />
      )}
    </div>
  );
};

export default RegisterVoting;
