const { expect } = require("chai");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const ID = 1;
const NAME = "Shoes";
const CATEGORY = "Clothing";
const IMAGE =
  "https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg";
const COST = tokens(1);
const RATING = 4;
const STOCK = 5;

describe("ECommerce", () => {
  let eCommerce;
  let deployer;
  let buyer;

  beforeEach(async () => {
    [deployer, buyer] = await ethers.getSigners();

    const ECommerce = await ethers.getContractFactory("ECommerce");
    eCommerce = await ECommerce.deploy();
  });

  describe("Deployment", () => {
    it("Sets the owner", async () => {
      expect(await eCommerce.owner()).to.equal(deployer.address);
    });
  });

  describe("Item Listing", () => {
    let transaction;

    beforeEach(async () => {
      transaction = await eCommerce
        .connect(deployer)
        .listItem(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);

      await transaction.wait();
    });

    it("Returns item attributes", async () => {
      const item = await eCommerce.items(ID);
      expect(item.id).to.equal(ID);
      expect(item.name).to.equal(NAME);
      expect(item.category).to.equal(CATEGORY);
      expect(item.image).to.equal(IMAGE);
      expect(item.cost).to.equal(COST);
      expect(item.rating).to.equal(RATING);
      expect(item.stock).to.equal(STOCK);
    });

    it("Emits list event", async () => {
      expect(transaction).to.emit(eCommerce, "List");
    });
  });

  describe("Item Buying", () => {
    let transaction;

    beforeEach(async () => {
      transaction = await eCommerce
        .connect(deployer)
        .listItem(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);
      await transaction.wait();

      transaction = await eCommerce
        .connect(buyer)
        .purchaseItem(ID, { value: COST });
      await transaction.wait();
    });

    it("Updates the buyers order count", async () => {
      const result = await eCommerce.orderCount(buyer.address);
      expect(result).to.equal(1);
    });

    it("Updates the contract balance", async () => {
      const result = await ethers.provider.getBalance(eCommerce.address);
      expect(result).to.equal(COST);
    });

    it("Adds the order", async () => {
      const order = await eCommerce.orders(buyer.address, 1);
      expect(order.time).to.be.greaterThan(0);
      expect(order.item.name).to.equal(NAME);
    });

    it("Emits buy event", async () => {
      expect(transaction).to.emit(eCommerce, "Buy");
    });
  });

  describe("Withdrawing", () => {
    let balanceBefore;

    beforeEach(async () => {
      let transaction = await eCommerce
        .connect(deployer)
        .listItem(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);
      await transaction.wait();

      transaction = await eCommerce
        .connect(buyer)
        .purchaseItem(ID, { value: COST });
      await transaction.wait();

      balanceBefore = await ethers.provider.getBalance(deployer.address);

      transaction = await eCommerce.connect(deployer).withdraw();
      await transaction.wait();
    });

    it("Updates the owner balance", async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });

    it("Updates the contract balance", async () => {
      const result = await ethers.provider.getBalance(eCommerce.address);
      expect(result).to.equal(0);
    });
  });
});
