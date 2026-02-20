import { useEffect, useState } from "react";
import { ethers } from "ethers";

import Navigation from "./components/Navigation";
import Section from "./components/Section";
import Product from "./components/Product";

import Dappazon from "./abis/Dappazon.json";
import config from "./config.json";

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [dappazon, setDappazon] = useState(null);
  const [item, setItem] = useState({});

  const [electronics, setElectronics] = useState(null);
  const [clothing, setClothing] = useState(null);
  const [toys, setToys] = useState(null);

  const [toggle, setToggle] = useState(false);

  const accountsChanged = async () => {
    window.ethereum.on("accountsChanged", async () => {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);
    });
  };

  const loadBlockChainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    const network = await provider.getNetwork();

    const dappazon = new ethers.Contract(
      config[network.chainId].dappazon.address,
      Dappazon,
      provider
    );
    setDappazon(dappazon);

    const items = [];

    for (let i = 0; i < 9; i++) {
      const item = await dappazon.items(i + 1);
      items.push(item);
    }

    const electronics = items.filter(
      (item) => item.category === "electronics"
    );
    const clothing = items.filter(
      (item) => item.category === "clothing"
    );
    const toys = items.filter(
      (item) => item.category === "toys"
    );

    setElectronics(electronics);
    setClothing(clothing);
    setToys(toys);
  };

  const togglePop = (item) => {
    setItem(item);
    setToggle(!toggle);
  };

  useEffect(() => {
    accountsChanged();
    loadBlockChainData();
  }, []);

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />

      <h2>Best Sellers</h2>

      {electronics && clothing && toys && (
        <>
          <Section
            title={"Clothing & Jewelry"}
            items={clothing}
            togglePop={togglePop}
          />
          <Section
            title={"Electronics & Gadgets"}
            items={electronics}
            togglePop={togglePop}
          />
          <Section title={"Toys & Gaming"} items={toys} togglePop={togglePop} />
        </>
      )}

      {toggle && (
        <Product
          item={item}
          provider={provider}
          account={account}
          dappazon={dappazon}
          togglePop={togglePop}
        />
      )}
    </div>
  );
}

export default App;
