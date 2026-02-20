const hre = require("hardhat");
const { items } = require("../src/items.json");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contract...");
  const ECommerce = await ethers.getContractFactory("ECommerce");
  const eCommerce = await ECommerce.deploy();
  await eCommerce.deployed();
  console.log("Contract deployed to: ", eCommerce.address);

  console.log("Adding items to the blockchain...");
  for (let i = 0; i < items.length; i++) {
    const transaction = await eCommerce
      .connect(deployer)
      .listItem(
        items[i].id,
        items[i].name,
        items[i].category,
        items[i].image,
        tokens(items[i].price),
        items[i].rating,
        items[i].stock
      );
    await transaction.wait();
    console.log(`Listed item ${items[i].id}: ${items[i].name}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
