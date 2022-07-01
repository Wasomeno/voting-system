const hre = require("hardhat");

async function main() {
  const [owner, user1] = await hre.ethers.getSigners();
  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();

  const VoterData = await hre.ethers.getContractFactory("VoterDataMerkle");
  const voterData = await VoterData.deploy();

  const Ballot = await hre.ethers.getContractFactory("BallotToken");
  const ballot = await Ballot.deploy(voting.address);

  await voting.deployed();
  await voterData.deployed();

  await voting.setInterface(ballot.address, voterData.address);

  console.log("Voting contract deployed to:", voting.address);
  console.log("Voter Data contract deployed to:", voting.address);

  console.log("");

  const root =
    "0x40a849fd64fc2cdbc850a5b0e66170f8115e6a466c7b5ee1dcc8e00256ca9061";
  const leaf =
    "0xe4dd56d5e2f519525edb5665356a4e692845c99743276481c38b985558081733";
  const proof = [
    "0xcfee7c08a98f4b565d124c7e4e28acc52e1bc780e3887db0a02a7d2d5bc66728",
  ];

  console.log("=== Add voter data ===========");
  console.log("Adding voter data......");
  await voterData.addLeaf(1, leaf);
  await voterData.setRoot(1, root);

  const leaves = await voterData.getLeaves(1);
  console.log(leaves);
  console.log("");
  console.log("=== Voter validation =============");
  console.log("Validating voter......");
  console.log("");

  const result = await voting.connect(user1).verifyVoter(1, proof, leaf);
  console.log("User 1 validation result: validated");

  let candidates = [
    hre.ethers.utils.formatBytes32String("Kevin"),
    hre.ethers.utils.formatBytes32String("Kepon"),
    hre.ethers.utils.formatBytes32String("Kebin"),
  ];

  let title = hre.ethers.utils.formatBytes32String("Voting Test");

  await voting.createVoting(title, 8, 48, 123, candidates);

  console.log("");
  console.log("=== Voting Session 1 ===========");
  console.log("Voting session 1 details: ");

  const votingDetail = await voting.votingDetails(1);
  const votingCandidates = await voting.getCandidates(1);

  console.log("Duration: " + votingDetail.duration.toString() + " hours");
  console.log("Start in: " + votingDetail.startTime.toString());
  console.log("Candidates : ");
  console.log(
    "1. Candidate " +
      hre.ethers.utils.parseBytes32String(votingCandidates[0].candidate) +
      " (" +
      votingCandidates[0].votes +
      " votes)"
  );
  console.log(
    "1. Candidate " +
      hre.ethers.utils.parseBytes32String(votingCandidates[1].candidate) +
      " (" +
      votingCandidates[1].votes +
      " votes)"
  );
  console.log(
    "1. Candidate " +
      hre.ethers.utils.parseBytes32String(votingCandidates[2].candidate) +
      " (" +
      votingCandidates[2].votes +
      " votes)"
  );

  console.log("");
  console.log("=== Voting Start ============");
  console.log("Voting on candidate 1 on session 1......");

  await voting.vote(1, user1.getAddress(), 1);

  const candidatesAfter = await voting.getCandidates(1);
  console.log("Candidates After vote : ");
  console.log(
    "1. Candidate " +
      candidatesAfter[0].candidateId +
      " (" +
      candidatesAfter[0].votes +
      " votes)"
  );
  console.log(
    "1. Candidate " +
      candidatesAfter[1].candidateId +
      " (" +
      candidatesAfter[1].votes +
      " votes)"
  );
  console.log(
    "1. Candidate " +
      candidatesAfter[2].candidateId +
      " (" +
      candidatesAfter[2].votes +
      " votes)"
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
