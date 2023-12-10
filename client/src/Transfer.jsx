import { useState } from "react";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { utf8ToBytes } from "ethereum-cryptography/utils";
import { toHex } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";
import server from "./server";

function Transfer({ setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function SignTransaction() {
    const publicKey = toHex(secp256k1.getPublicKey(privateKey));
    const msg = {
      amount: parseInt(sendAmount),
      recipient,
    };
    const hash = toHex(keccak256(utf8ToBytes(JSON.stringify(msg))));
    const signature = secp256k1.sign(hash, privateKey);
    if (typeof signature.r === "bigint") signature.r = signature.r.toString();
    if (typeof signature.s === "bigint") signature.s = signature.s.toString();

    const signObject = {
      signature: JSON.parse(JSON.stringify(signature)),
      hash,
      publicKey,
    };
    return signObject;
  }

  async function transfer(evt) {
    evt.preventDefault();

    if (privateKey.length != 64) {
      alert("Invalid PrivateKey");
      setPrivateKey("");
    } else if (recipient.length != 66) {
      alert(recipient.length);
      alert("Invalid recipient publicKey");
      setRecipient("");
    } else {
      try {
        const {
          data: { balance },
        } = await server.post(`send`, {
          sender: await toHex(secp256k1.getPublicKey(privateKey)),
          amount: parseInt(sendAmount),
          recipient,
          signature: await SignTransaction(),
        });
        setBalance(balance);
      } catch (ex) {
        console.log("error");
        alert(ex.response.data.message);
      }
    }
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
        Sign The Transaction
        <input
          placeholder="Type Senders's Private Key"
          value={privateKey}
          onChange={setValue(setPrivateKey)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type Recipient's Public Key"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
