import { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';

import Navigation from "./components/Navigation";

function App() {
  const [account, setAccount] = useState(null);

  const accountsChanged = async () => {
    window.ethereum.on("accountsChanged", async () => {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);
    });
  };

  
  useEffect(() => {
    accountsChanged();
  }, []);

  return (
     <div>
      <Navigation account={account} setAccount={setAccount} />

    </div>
  );
}

export default App;
