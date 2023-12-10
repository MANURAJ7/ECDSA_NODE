const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const { checkSignature } = require("./checkSignature");

app.use(cors());
app.use(express.json());

const balances = {
  "030781db8e12fcdb1de56c18d62d1be4a4865be30bdcc4e1a0c3d20a74b4a0ef4a": 100, //user1
  "02bcbf8ec0b780706bd494f4ba6c264aabfda2b12fce4ccf72620826029e089634": 50, //user2
  "02878cb6b809a8bba7e59deb90b1ab2272327af9319c3fb2fbd3590ed9aabad345": 75, //user3
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, amount, recipient, signature } = req.body;

  const isValid = checkSignature(signature);
  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (!isValid) {
    res.status(400).send({ message: "Invalid Signature" });
  } else if (balances[sender] < amount) {
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

// Private Keys for reference
//user1: 7bb6e52c471a6b3575326d8c0f1cb39c3cdb56f7585dc00557181884c371ccae
//user2: 9eea61252d192239d19de096f2f4a75a6d700e54eecd31cab620b6f743b0a8c0
//user3: 83e9053d65b3b0b3a647ad66796540188173465869f796c5a3a800a428d3699c
