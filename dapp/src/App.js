import { useState, useEffect } from "react";
import { ethers, utils } from "ethers";
import bankAbi from "./contracts/Bank.json";
import zCoinAbi from "./contracts/ZCoin.json";

import "./App.css";

function App() {
  const [error, setError] = useState(null);
  const [isTokenOwner, setIsTokenOwner] = useState(false);
  const [customerTotalDebts, setCustomerTotalDebts] = useState(null);
  const [customerTotalDeposit, setCustomerTotalDeposit] = useState(null);
  const [customerBalance, setCustomerBalance] = useState(0);
  const [bankOwnerAddress, setBankOwnerAddress] = useState(null);
  const [tokenOwnerAddress, setTokenOwnerAddress] = useState(null);
  const [customerAddress, setCustomerAddress] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [bankSupply, setBankSupply] = useState(0);
  const [accountSupply, setAccountSupply] = useState(0);

  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenTotalSupply, setTokenTotalSupply] = useState(0);

  const [inputValue, setInputValue] = useState({
    deposit: "",
    borrow: "",
  });

  const contractBankABI = bankAbi.abi;
  const bankContractAddress = process.env.REACT_APP_BANK_CONTRACT_ADDRESS;

  const contractZCoinABI = zCoinAbi.abi;
  const zCoinContractAddress = process.env.REACT_APP_ZCOIN_CONTRACT_ADDRESS;

  const depositMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        //write data
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          bankContractAddress,
          contractBankABI,
          signer
        );

        const tokenContract = new ethers.Contract(
          zCoinContractAddress,
          contractZCoinABI,
          signer
        );

        const value = ethers.utils.parseEther(inputValue.deposit);

        const transaction = await tokenContract.approve(
          bankContractAddress,
          value
        );
        console.log("Approving transaction...");
        await transaction.wait();
        console.log("Approving transaction...done", transaction.hash);

        const txn = await bankContract.depositMoney(value);
        console.log("Borrowing money...");
        await txn.wait();
        console.log("Borrowing money...done", txn.hash);

        customerBalanceHandler();
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const borrowMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        //write data
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          bankContractAddress,
          contractBankABI,
          signer
        );

        const txn = await bankContract.borrowMoney(
          ethers.utils.parseEther(inputValue.borrow)
        );
        console.log("Borrowing money...");
        await txn.wait();
        console.log("Borrowing money...done", txn.hash);

        customerBalanceHandler();
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];
        setIsWalletConnected(true);
        setCustomerAddress(account);
        console.log("Account Connected: ", account);
      } else {
        setError("Please install a MetaMask wallet to use our bank.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getBankOwnerHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          bankContractAddress,
          contractBankABI,
          signer
        );

        let owner = await bankContract.bankOwner();
        setBankOwnerAddress(owner);
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const customerBalanceHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          bankContractAddress,
          contractBankABI,
          signer
        );

        const debts = await bankContract.getCustomerDebts();
        const deposit = await bankContract.getCustomerDeposit();
        const balance = utils.formatEther(deposit) - utils.formatEther(debts);
        setCustomerTotalDebts(utils.formatEther(debts));
        setCustomerTotalDeposit(utils.formatEther(deposit));
        setCustomerBalance(balance);

        console.log("Retrieved debts...", debts);
        console.log("Retrieved deposit...", deposit);
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getTokenOwnerHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(
          zCoinContractAddress,
          contractZCoinABI,
          signer
        );

        let owner = await tokenContract.owner();
        setTokenOwnerAddress(owner);

        const [account] = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        if (owner.toLowerCase() === account.toLowerCase()) {
          setIsTokenOwner(true);
        }
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const transferToken = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(
          zCoinContractAddress,
          contractZCoinABI,
          signer
        );

        const txn = await tokenContract.transfer(
          inputValue.walletAddress,
          utils.parseEther(inputValue.transferAmount)
        );
        console.log("Transferring tokens...");
        await txn.wait();
        console.log("Tokens Transferred", txn.hash);
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to get our token.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const burnTokens = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(
          zCoinContractAddress,
          contractZCoinABI,
          signer
        );

        const txn = await tokenContract.burn(
          utils.parseEther(inputValue.burnAmount)
        );
        console.log("Burning tokens...");
        await txn.wait();
        console.log("Tokens burned...", txn.hash);

        let tokenSupply = await tokenContract.totalSupply();
        tokenSupply = utils.formatEther(tokenSupply);
        setTokenTotalSupply(tokenSupply);
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to get our token.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const mintTokens = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(
          zCoinContractAddress,
          contractZCoinABI,
          signer
        );
        let tokenOwner = await tokenContract.owner();
        const txn = await tokenContract.mint(
          tokenOwner,
          utils.parseEther(inputValue.mintAmount)
        );
        console.log("Minting tokens...");
        await txn.wait();
        console.log("Tokens minted...", txn.hash);

        let tokenSupply = await tokenContract.totalSupply();
        tokenSupply = utils.formatEther(tokenSupply);
        setTokenTotalSupply(tokenSupply);
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to get our token.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getTokenInfo = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(
          zCoinContractAddress,
          contractZCoinABI,
          signer
        );
        const [account] = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        let tokenName = await tokenContract.name();
        let tokenSymbol = await tokenContract.symbol();
        let tokenOwner = await tokenContract.owner();
        let tokenSupply = await tokenContract.totalSupply();
        tokenSupply = utils.formatEther(tokenSupply);
        let bankSupply = await tokenContract.balanceOf(bankContractAddress);
        bankSupply = utils.formatEther(bankSupply);
        let accountSupply = await tokenContract.balanceOf(customerAddress);
        accountSupply = utils.formatEther(accountSupply);

        setTokenName(`${tokenName} 🦊`);
        setTokenSymbol(tokenSymbol);
        setTokenTotalSupply(tokenSupply);
        setTokenOwnerAddress(tokenOwner);
        setBankSupply(bankSupply);
        setAccountSupply(accountSupply);

        if (account.toLowerCase() === tokenOwner.toLowerCase()) {
          setIsTokenOwner(true);
        }

        console.log("Token Name: ", tokenName);
        console.log("Token Symbol: ", tokenSymbol);
        console.log("Token Supply: ", tokenSupply);
        console.log("Token Owner: ", tokenOwner);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputChange = (event) => {
    setInputValue((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value,
    }));
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    getBankOwnerHandler();
    getTokenOwnerHandler();
    getTokenInfo();
    customerBalanceHandler();
  }, [isWalletConnected]);

  return (
    <main className="main-container">
      <h2 className="headline">
        <span className="headline-gradient">Bank Contract Project</span> 💰
      </h2>
      <div className="mt-5">
        <span className="mr-5">
          <strong>Bank ZCoin supply:</strong> {bankSupply}{" "}
        </span>
      </div>
      <section className="customer-section px-10 pt-5 pb-10">
        {error && <p className="text-2xl text-red-700">{error}</p>}
        <div className="mt-7 mb-9">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="deposit"
              placeholder="0.0000 ZCN"
              value={inputValue.deposit}
            />
            <button className="btn-purple" onClick={depositMoneyHandler}>
              Deposit Zlaya Coin
            </button>
          </form>
        </div>
        <div className="mt-7 mb-9">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="borrow"
              placeholder="0.0000 ZCN"
              value={inputValue.borrow}
            />
            <button className="btn-purple" onClick={borrowMoneyHandler}>
              Borrow Zlaya Coin
            </button>
          </form>
        </div>
        <div className="mt-5">
          <p>
            <span className="font-bold">Customer Debts: </span>
            {customerTotalDebts} {tokenSymbol}
          </p>
        </div>
        <div className="mt-5">
          <p>
            <span className="font-bold">Customer Deposits: </span>
            {customerTotalDeposit} {tokenSymbol}
          </p>
        </div>
        <div className="mt-5">
          <p>
            <span className="font-bold">Customer Balance: </span>
            {customerBalance} {tokenSymbol}
          </p>
        </div>
        <div className="mt-5">
          <p>
            <span className="font-bold">Bank Owner Address: </span>
            {bankOwnerAddress}
          </p>
        </div>
        <div className="mt-5">
          <p>
            <span className="font-bold">Token Owner Address: </span>
            {tokenOwnerAddress}
          </p>
        </div>
        <div className="mt-5">
          <p>
            <span className="font-bold">Account supply: </span>
            {accountSupply}
          </p>
        </div>
        <div className="mt-5">
          {isWalletConnected && (
            <p>
              <span className="font-bold">Your Wallet Address: </span>
              {customerAddress}
            </p>
          )}
          <button className="btn-connect" onClick={checkIfWalletIsConnected}>
            {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
          </button>
        </div>
      </section>

      {isTokenOwner && (
        <section>
          <h2 className="headline">
            <span className="headline-gradient">Token owner part</span> 💰
          </h2>
          <div className="mt-5">
            <span className="mr-5">
              <strong>Coin:</strong> {tokenName}{" "}
            </span>
            <span className="mr-5">
              <strong>Ticker:</strong> {tokenSymbol}{" "}
            </span>
            <span className="mr-5">
              <strong>Total Supply:</strong> {tokenTotalSupply}
            </span>
          </div>
          <div className="mt-7 mb-9">
            <form className="form-style">
              <input
                type="text"
                className="input-double"
                onChange={handleInputChange}
                name="walletAddress"
                placeholder="Wallet Address"
                value={inputValue.walletAddress}
              />
              <input
                type="text"
                className="input-double"
                onChange={handleInputChange}
                name="transferAmount"
                placeholder={`0.0000 ${tokenSymbol}`}
                value={inputValue.transferAmount}
              />
              <button className="btn-purple" onClick={transferToken}>
                Transfer Tokens
              </button>
            </form>
          </div>
          <div className="mt-10 mb-10">
            <form className="form-style">
              <input
                type="text"
                className="input-style"
                onChange={handleInputChange}
                name="burnAmount"
                placeholder={`0.0000 ${tokenSymbol}`}
                value={inputValue.burnAmount}
              />
              <button className="btn-purple" onClick={burnTokens}>
                Burn Tokens
              </button>
            </form>
          </div>
          <div className="mt-10 mb-10">
            <form className="form-style">
              <input
                type="text"
                className="input-style"
                onChange={handleInputChange}
                name="mintAmount"
                placeholder={`0.0000 ${tokenSymbol}`}
                value={inputValue.mintAmount}
              />
              <button className="btn-purple" onClick={mintTokens}>
                Mint Tokens
              </button>
            </form>
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
