import { useState, useEffect } from "react";
import { mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
import PropTypes from 'prop-types'; 
import { Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import nacl from "tweetnacl";
import { getSolanaBalance, getSolanaTransactionHistory } from '../services/SolanaService'; // Import your services

export function SolanaWallet({ walletType, setWalletType }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [publicKeys, setPublicKeys] = useState(() => JSON.parse(localStorage.getItem('solanaPublicKeys')) || []);
  const [selectedPublicKey, setSelectedPublicKey] = useState(publicKeys[0] || '');
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false); // New state for loading
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  

  useEffect(() => {
    localStorage.setItem('solanaPublicKeys', JSON.stringify(publicKeys));
  }, [publicKeys]);

  useEffect(() => {
    if (selectedPublicKey) {
      fetchSolanaBalance(selectedPublicKey);
      fetchTransactionHistoryOnce(selectedPublicKey);
    }
  }, [selectedPublicKey]);

  const fetchSolanaBalance = async (address) => {
    try {
      const balance = await getSolanaBalance(address);
      setBalance(balance);
    } catch (error) {
      console.error('Error fetching Solana balance:', error);
    }
  };

  const fetchTransactionHistoryOnce = async (address) => {
    setLoadingTransactions(true); // Set loading state to true
    try {
      const transactions = await getSolanaTransactionHistory(address);
      const lastTenTransactions = transactions.slice(0, 10);
      setTransactions(lastTenTransactions);
    } catch (error) {
      console.error('Error fetching Solana transaction history:', error);
    } finally {
      setLoadingTransactions(false); // Set loading state to false regardless of success or error
    }
  };

  const handleAddWallet = async () => {
    const mnemonic = localStorage.getItem('mnemonic');
    const seed = await mnemonicToSeed(mnemonic);
    const path = `m/44'/501'/${currentIndex}'/0'`;
    const derivedSeed = derivePath(path, seed.toString("hex")).key;
    const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
    const keypair = Keypair.fromSecretKey(secret);
    const newPublicKey = keypair.publicKey.toBase58();

    setPublicKeys([...publicKeys, newPublicKey]);
    setSelectedPublicKey(newPublicKey);
    setCurrentIndex(currentIndex + 1);

    localStorage.setItem(`solanaPrivateKey_${newPublicKey}`, keypair.secretKey.toString('base58'));
  };

  const sendSolTokens = async () => {
    try {
      const senderPrivateKeyBase58 = localStorage.getItem(`solanaPrivateKey_${selectedPublicKey}`);
      const senderPrivateKeyUint8Array = new Uint8Array((senderPrivateKeyBase58, 'base64'));
      const senderKeypair = Keypair.fromSecretKey(senderPrivateKeyUint8Array);
      const recipient = new PublicKey(recipientAddress);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: senderKeypair.publicKey,
          toPubkey: recipient,
          lamports: amount * 1e9,
        })
      );

      const connection = new window.solanaWeb3.Connection("https://api.mainnet-beta.solana.com", 'confirmed');
      const signature = await sendAndConfirmTransaction(connection, transaction, [senderKeypair]);

      console.log("Transaction signature", signature);
      alert(`Transaction sent! Signature: ${signature}`);
    } catch (error) {
      console.error("Error sending SOL:", error);
      alert(`Failed to send SOL: ${error.message}`);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const formatLamportsToSol = (lamports) => {
    return (lamports / 1e9).toFixed(6);
  };

  const truncateAddress = (address) => {
    return address.slice(0, 4) + '...' + address.slice(-4);
  };

  return (
    <div>

      <div className="nav-bar">
        <select onChange={(e) => setWalletType(e.target.value)} value={walletType}>
          <option value="solana">Solana</option>
          <option value="ethereum">Ethereum</option>
        </select>
        <select onChange={(e) => setSelectedPublicKey(e.target.value)} value={selectedPublicKey}>
          {publicKeys.map((key, index) => (
            <option key={index} value={key}>
              {key}
            </option>
          ))}
        </select>
          <button onClick={handleAddWallet}>Add</button>
      </div>

      <div>Balance: {balance !== null ? `${balance} SOL` : 'Loading...'}</div>

      <div>
        <h3>Transaction History</h3>
        {loadingTransactions ? (
          <div>Loading transactions...</div>
        ) : transactions.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Transaction Signature</th>
                <th>From</th>
                <th>To</th>
                <th>Amount (SOL)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, index) => {
                const fromPubkey = truncateAddress(tx.transaction.message.accountKeys[0]);
                const toPubkey = truncateAddress(tx.transaction.message.accountKeys[1]);
                const amount = tx.meta.postBalances[1] - tx.meta.preBalances[1];
                const shortSignature = tx.transaction.signatures[0].slice(0, 3) + '...' + tx.transaction.signatures[0].slice(-2);

                return (
                  <tr key={index}>
                    <td>{shortSignature} <button onClick={() => copyToClipboard(tx.transaction.signatures[0])}>Copy</button></td>
                    <td>{fromPubkey} <button onClick={() => copyToClipboard(tx.transaction.message.accountKeys[0])}>Copy</button></td>
                    <td>{toPubkey} <button onClick={() => copyToClipboard(tx.transaction.message.accountKeys[1])}>Copy</button></td>
                    <td>{formatLamportsToSol(amount)} SOL</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div>No transactions found for this wallet.</div>
        )}
      </div>

      <div className="tranfersection">
        <h3>Send SOL Tokens</h3>
        <input
          type="text"
          placeholder="Recipient Address"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount (SOL)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={sendSolTokens}>Send SOL</button>
      </div>
    </div>
  );
}


SolanaWallet.propTypes = {
  walletType: PropTypes.string.isRequired,
  setWalletType: PropTypes.func.isRequired,
};
