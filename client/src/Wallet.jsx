import server from "./server";

function Wallet({ address, setAddress, balance, setBalance }) {
  async function connectWallet() {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      ethereum.on("accountsChanged", () => {disconnectWallet()});

      const firstAccount = await ethereum.request({ method: "eth_requestAccounts" }).then((accounts) => accounts[0]);
      setAddress(firstAccount);

      if (firstAccount) {
        const {
          data: { balance },
        } = await server.get(`balance/${firstAccount}`);
        setBalance(balance);
      } else {
        setBalance(0);
      }

    } catch (error) {
      console.log(error);
    }
  }

  function disconnectWallet() {
    setAddress("");
    setBalance(0);
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      {address ? (
        <>
          <label>
            Wallet Address
            <input disabled value={address}></input>
          </label>

          <div className="balance">Balance: {balance}</div>
        </>
      ) : (<button className="button" onClick={connectWallet}>Connect</button>)}
    </div>
  );
}

export default Wallet;
