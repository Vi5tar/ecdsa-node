import { useState } from "react";
import server from "./server";

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  function transfer(evt) {
    evt.preventDefault();

    getSignatureRequest()
      .then(async (data) => {
        const {
          data: { balance },
        } = await server.post(`send`, data);
        setBalance(balance);
      })
      .catch(err => {
        console.error(err);
        if (err.request) {
          alert(JSON.parse(err.request.response).message);
        } else {
          alert(err.message);
        }
      });
  }

  function getSignatureRequest() {
    // https://docs.metamask.io/guide/signing-data.html#signtypeddata-v4
    const msgParams = JSON.stringify({
      domain: {
        // Give a user friendly name to the specific contract you are signing for.
        name: 'ECDSA Node',
        // Just let's you know the latest version. Definitely make sure the field name is correct.
        version: '1',
      },

      // Defining the message signing data content.
      message: {
        sender: address,
        amount: parseInt(sendAmount),
        recipient
      },
      primaryType: 'Transaction',
      types: {
        Transaction: [
          { name: 'sender', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'recipient', type: 'address' },
        ],
      },
    });

    return window.ethereum.request(
      {
        method: 'eth_signTypedData_v4',
        params: [address, msgParams],
        from: address,
      }
    )
      .then(signature => {
        return {
          signature,
          data: JSON.parse(msgParams),
          from: address
        };
      })
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
