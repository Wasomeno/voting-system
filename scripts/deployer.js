const hre = require("hardhat");

async function main() {
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
  console.log("Voter Data contract deployed to:", voterData.address);
  console.log("Ballot Token contract deployed to:", ballot.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
