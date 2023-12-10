const { secp256k1 } = require("ethereum-cryptography/secp256k1");

async function checkSignature({ signature, hash, publicKey }) {
  const parsedSignature = new secp256k1.Signature(
    BigInt(signature.r),
    BigInt(signature.s),
    parseInt(signature.recovery)
  );

  const isValid = secp256k1.verify(parsedSignature, hash, publicKey);
  return isValid;
}

module.exports = { checkSignature };
