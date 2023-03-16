const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const sigUtil = require('@metamask/eth-sig-util')
require('dotenv').config()

app.use(cors());
app.use(express.json());

const balances = {
  "0x2": 50,
  "0x3": 75,
};
balances[process.env.YOUR_WALLET_ADDRESS] = 1000;

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  console.log(address)
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  console.log(req.body)

  //verify signature
  const recoveredAddress = getPublicKey(req.body.data, req.body.signature)
  if (recoveredAddress !== req.body.data.message.sender) {
    return res.status(403).send({ message: "Invalid signature!" });
  }

  const { sender, recipient, amount } = req.body.data.message;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

function getPublicKey(data, signature) {
  return sigUtil.recoverTypedSignature({data, signature, version: 'V4'})
}
