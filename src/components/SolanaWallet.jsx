import { useState, useEffect } from "react";
import { mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
import PropTypes from 'prop-types'; 
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import { 
  getSolanaBalance, 
  getSolanaTransactionHistory, 
  requestAirdrop, 
  sendSolanaTransaction,
  isValidSolanaAddress 
} from '../services/SolanaService';



export function SolanaWallet({ walletType, setWalletType }) {

  const [currentIndex, setCurrentIndex] = useState(0);
  const [publicKeys, setPublicKeys] = useState(() => JSON.parse(localStorage.getItem('solanaPublicKeys')) || []);
  const [selectedPublicKey, setSelectedPublicKey] = useState(publicKeys[0] || '');
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [airdropAmount, setAirdropAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  

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
    if (!mnemonic) {
      alert('No mnemonic found. Please create a wallet first.');
      return;
    }
    
    const seed = await mnemonicToSeed(mnemonic);
    const path = `m/44'/501'/${currentIndex}'/0'`;
    const derivedSeed = derivePath(path, seed.toString("hex")).key;
    const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
    const keypair = Keypair.fromSecretKey(secret);
    const newPublicKey = keypair.publicKey.toBase58();

    setPublicKeys([...publicKeys, newPublicKey]);
    setSelectedPublicKey(newPublicKey);
    setCurrentIndex(currentIndex + 1);

    // Store the secret key properly
    localStorage.setItem(`solanaPrivateKey_${newPublicKey}`, JSON.stringify(Array.from(keypair.secretKey)));
  };

  const sendSolTokens = async () => {
    try {
      setLoading(true);

      if (!recipientAddress || !amount) {
        throw new Error('Please fill in all fields');
      }

      if (!isValidSolanaAddress(recipientAddress)) {
        throw new Error('Invalid recipient address');
      }

      if (parseFloat(amount) <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Get the stored private key
      const storedPrivateKey = localStorage.getItem(`solanaPrivateKey_${selectedPublicKey}`);
      if (!storedPrivateKey) {
        throw new Error('Private key not found for selected wallet');
      }

      // Parse the stored private key back to Uint8Array
      const privateKeyArray = JSON.parse(storedPrivateKey);
      const senderKeypair = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));

      // Use the service function to send the transaction
      const result = await sendSolanaTransaction(senderKeypair, recipientAddress, parseFloat(amount));

      if (result.success) {
        alert(`Transaction successful! Signature: ${result.signature}`);
        // Clear form and refresh balance
        setRecipientAddress('');
        setAmount('');
        fetchSolanaBalance(selectedPublicKey);
        fetchTransactionHistoryOnce(selectedPublicKey);
      }

    } catch (error) {
      console.error("Error sending SOL:", error);
      alert(`Failed to send SOL: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };


  // Airdrop function
  const airdropSolTokens = async () => {
    try {
      setLoading(true);

      if (!airdropAmount || parseFloat(airdropAmount) <= 0) {
        throw new Error('Please enter a valid airdrop amount');
      }

      const result = await requestAirdrop(selectedPublicKey, parseFloat(airdropAmount));

      if (result.success) {
        alert(`Airdrop successful! Signature: ${result.signature}. Please wait a few seconds for balance to update.`);
        
        // Clear the airdrop amount
        setAirdropAmount(1);
        
        // Refresh balance multiple times with delays to catch the update
        const refreshBalance = async () => {
          for (let i = 0; i < 5; i++) {
            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
            try {
              await fetchSolanaBalance(selectedPublicKey);
              await fetchTransactionHistoryOnce(selectedPublicKey);
            } catch (error) {
              console.log(`Retry ${i + 1} failed:`, error);
            }
          }
        };
        
        // Start the refresh process
        refreshBalance();
      }

    } catch (error) {
      console.error("Error during airdrop:", error);
      alert(`Failed to airdrop SOL: ${error.message}`);
    } finally {
      setLoading(false);
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

      <div>
        Balance: {balance !== null ? `${balance} SOL` : 'Loading...'} 
        <button onClick={() => fetchSolanaBalance(selectedPublicKey)} style={{marginLeft: '10px'}}>
          Refresh
        </button>
      </div>

      <div className="airdrop-section">
        <h3>Airdrop SOL Tokens</h3>
        <input
          type="number"
          placeholder="Amount to Airdrop (SOL)"
          value={airdropAmount}
          onChange={(e) => setAirdropAmount(e.target.value)}
        />
        <button onClick={airdropSolTokens} disabled={loading}>
          {loading ? 'Requesting...' : 'Airdrop'}
        </button>
      </div>

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
                // Safe access to transaction data with fallbacks
                const transaction = tx.transaction || {};
                const message = transaction.message || {};
                const accountKeys = message.accountKeys || [];
                const signatures = transaction.signatures || [];
                const meta = tx.meta || {};
                const preBalances = meta.preBalances || [];
                const postBalances = meta.postBalances || [];

                const fromPubkey = accountKeys[0] ? truncateAddress(accountKeys[0]) : 'Unknown';
                const toPubkey = accountKeys[1] ? truncateAddress(accountKeys[1]) : 'Unknown';
                const amount = postBalances[1] && preBalances[1] 
                  ? postBalances[1] - preBalances[1] 
                  : 0;
                const shortSignature = signatures[0] 
                  ? signatures[0].slice(0, 10) + '...' + signatures[0].slice(-8)
                  : tx.signature ? tx.signature.slice(0, 10) + '...' + tx.signature.slice(-8) : 'Unknown';

                return (
                  <tr key={index}>
                    <td>
                      {shortSignature} 
                      <button onClick={() => copyToClipboard(signatures[0] || tx.signature || '')}>
                        Copy
                      </button>
                    </td>
                    <td>
                      {fromPubkey} 
                      <button onClick={() => copyToClipboard(accountKeys[0] || '')}>
                        Copy
                      </button>
                    </td>
                    <td>
                      {toPubkey} 
                      <button onClick={() => copyToClipboard(accountKeys[1] || '')}>
                        Copy
                      </button>
                    </td>
                    <td>{formatLamportsToSol(Math.abs(amount))} SOL</td>
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
        <button onClick={sendSolTokens} disabled={loading}>
          {loading ? 'Sending...' : 'Send SOL'}
        </button>
      </div>
    </div>
  );
}


SolanaWallet.propTypes = {
  walletType: PropTypes.string.isRequired,
  setWalletType: PropTypes.func.isRequired,
};
