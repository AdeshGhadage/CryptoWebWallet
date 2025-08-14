import { useState, useEffect } from "react";
import { mnemonicToSeed } from "bip39";
import { Wallet, HDNodeWallet, ethers } from "ethers";
import PropTypes from 'prop-types'; 
import { getEthBalance, getEthTransactionHistory, getCurrentGasPrice } from '../services/ethereumService';

export const EthWallet = ({ walletType, setWalletType }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [addresses, setAddresses] = useState(() => JSON.parse(localStorage.getItem('ethAddresses')) || []);
  const [selectedAddress, setSelectedAddress] = useState(addresses[0] || '');
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('ethAddresses', JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    if (selectedAddress) {
      fetchEthWalletData(selectedAddress);
    }
  }, [selectedAddress]);

  const fetchEthWalletData = async (address) => {
    try {
      console.log('Fetching ETH data for address:', address);
      
      const balance = await getEthBalance(address);
      console.log('ETH Balance received:', balance);
      setBalance(balance);
      
      const transactions = await getEthTransactionHistory(address);
      console.log('ETH Transactions received:', transactions);
      setTransactions(transactions || []); // Ensure it's always an array
      
    } catch (error) {
      console.error('Error fetching Ethereum wallet data:', error);
      // Set default values on error
      setBalance(0);
      setTransactions([]);
    }
  };

  const handleAddWallet = async () => {
    const mnemonic = localStorage.getItem('mnemonic');
    if (!mnemonic) {
      alert('No mnemonic found. Please create a wallet first.');
      return;
    }
    
    const seed = await mnemonicToSeed(mnemonic);
    const derivationPath = `m/44'/60'/${currentIndex}'/0/0`;
    const hdNode = HDNodeWallet.fromSeed(seed);
    const child = hdNode.derivePath(derivationPath);
    const wallet = new Wallet(child.privateKey);
    const newAddress = wallet.address;

    setAddresses([...addresses, newAddress]);
    setSelectedAddress(newAddress);
    setCurrentIndex(currentIndex + 1);

    localStorage.setItem(`ethPrivateKey_${newAddress}`, wallet.privateKey);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const truncateHash = (hash) => {
    return hash.slice(0, 10) + '...' + hash.slice(-8);
  };

  const formatAmount = (value) => {
    if (!value) return '0';
    // Handle both hex string and number values
    const numValue = typeof value === 'string' && value.startsWith('0x') 
      ? parseInt(value, 16) 
      : parseFloat(value);
    return (numValue / 1e18).toFixed(6); // Convert from Wei to ETH with 6 decimal places
  };

  // Function to send ETH tokens
const sendEthTokens = async () => {
  try {
    setLoading(true);

    if (!recipientAddress || !amount) {
      throw new Error("Please fill in all fields.");
    }

    const privateKey = localStorage.getItem(`ethPrivateKey_${selectedAddress}`);
    if (!privateKey) {
      throw new Error("Private key not found.");
    }

    // Use Sepolia testnet provider
    const provider = new ethers.JsonRpcProvider(
      import.meta.env.VITE_ALCHEMY_ETH_SEPOLIA_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo'
    );
    
    const wallet = new ethers.Wallet(privateKey, provider);

    // Get current gas price
    const gasPrice = await getCurrentGasPrice();

    // Create transaction
    const tx = {
      to: recipientAddress,
      value: ethers.parseEther(String(amount)),
      gasLimit: 21000n, // Standard gas limit for ETH transfers
      gasPrice: gasPrice,
    };

    // Send the transaction
    const transactionResponse = await wallet.sendTransaction(tx);
    console.log('Transaction Response:', transactionResponse);

    // Wait for the transaction to be mined
    const receipt = await transactionResponse.wait();
    console.log('Transaction receipt:', receipt);

    alert(`Transaction successful! Hash: ${receipt.hash}`);
    
    // Clear form and update wallet data
    setRecipientAddress('');
    setAmount('');
    fetchEthWalletData(selectedAddress);
    
  } catch (error) {
    console.error('Error sending ETH tokens:', error);
    alert(`Transaction failed: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

const requestSepoliaFaucet = () => {
    const faucetUrl = `https://www.alchemy.com/faucets/ethereum-sepolia`;
    const message = `To get Sepolia ETH for testing:
1. Visit: ${faucetUrl}
2. Enter your wallet address: ${selectedAddress}
3. Complete the captcha and request funds

Your address has been copied to clipboard!`;
    
    copyToClipboard(selectedAddress);
    alert(message);
    
    // Open faucet in new tab
    window.open(faucetUrl, '_blank');
  };

  return (
    <div>

      <div className="nav-bar">
        <select onChange={(e) => setWalletType(e.target.value)} value={walletType}>
          <option value="solana">Solana</option>
          <option value="ethereum">Ethereum</option>
        </select>
        <select onChange={(e) => setSelectedAddress(e.target.value)} value={selectedAddress}>
          {addresses.map((address, index) => (
            <option key={index} value={address}>
              {address}
            </option>
          ))}
        </select>
          <button onClick={handleAddWallet}>Add</button>
      </div>

      <div>
        Balance: {balance !== null ? `${balance} ETH` : 'Loading...'} 
        <button onClick={() => fetchEthWalletData(selectedAddress)} style={{marginLeft: '10px'}}>
          Refresh
        </button>
        <button onClick={requestSepoliaFaucet} style={{marginLeft: '10px'}}>
          Get Test ETH
        </button>
      </div>

      <div>
        <h3>Transaction History</h3>
        {transactions.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Transaction Hash</th>
                <th>From</th>
                <th>To</th>
                <th>Amount (ETH)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, index) => {
                // Safe access with fallbacks
                const hash = tx.hash || tx.transactionHash || 'Unknown';
                const from = tx.from || 'Unknown';
                const to = tx.to || 'Unknown';
                const value = tx.value || '0';
                
                return (
                  <tr key={index}>
                    <td>
                      {truncateHash(hash)} 
                      <button onClick={() => copyToClipboard(hash)}>Copy</button>
                    </td>
                    <td>
                      {from} 
                      <button onClick={() => copyToClipboard(from)}>Copy</button>
                    </td>
                    <td>
                      {to} 
                      <button onClick={() => copyToClipboard(to)}>Copy</button>
                    </td>
                    <td>{formatAmount(value)} ETH</td>
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
        <h3>Send ETH Tokens</h3>
        <input
          type="text"
          placeholder="Recipient Address"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount (ETH)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={sendEthTokens} disabled={loading}>
          {loading ? 'Sending...' : 'Send ETH'}
        </button>
      </div>

      <div>
        <h3>Request Sepolia Faucet</h3>
        <button onClick={requestSepoliaFaucet}>
          Request Faucet
        </button>
      </div>
    </div>
  );
};



EthWallet.propTypes = {
  walletType: PropTypes.string.isRequired,
  setWalletType: PropTypes.func.isRequired,
};
