import { useState, useEffect } from "react";
import { mnemonicToSeed } from "bip39";
import { Wallet, HDNodeWallet } from "ethers";
import { ethers } from 'ethers';
import PropTypes from 'prop-types'; 
import { getEthBalance, getEthTransactionHistory } from '../services/ethereumService'; // Import your services

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
      const balance = await getEthBalance(address);
      const transactions = await getEthTransactionHistory(address);
      setBalance(balance);
      setTransactions(transactions);
    } catch (error) {
      console.error('Error fetching Ethereum wallet data:', error);
    }
  };

  const handleAddWallet = async () => {
    const mnemonic = localStorage.getItem('mnemonic');
    const seed = await mnemonicToSeed(mnemonic);
    const derivationPath = `m/44'/60'/${currentIndex}'/0'`;
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
    return parseFloat(value) / 1e18; // Convert from Wei to ETH
  };

  // Function to send ETH tokens
  
const sendEthTokens = async () => {
  try {
    setLoading(true);

    const privateKey = localStorage.getItem(`ethPrivateKey_${selectedAddress}`);
    if (!privateKey) {
      throw new Error("Private key not found.");
    }

    const wallet = new ethers.Wallet(privateKey);

    // Connect to the Ethereum network (using default provider)
    const provider = ethers.getDefaultProvider('mainnet');  // Change to 'ropsten', 'rinkeby', etc., for testnets
    const signer = wallet.connect(provider);

    // Ensure `amount` is converted to string
    const tx = {
      to: recipientAddress,
      value: ethers.utils.parseEther(String(amount)),  // Convert amount to string
      gasLimit: 21000,  // Standard gas limit for ETH transfers
      gasPrice: await provider.getGasPrice(),  // Fetch current gas price
    };

    // Send the transaction
    const transactionResponse = await signer.sendTransaction(tx);
    console.log('Transaction Response:', transactionResponse);

    // Wait for the transaction to be mined
    const receipt = await transactionResponse.wait();
    console.log('Transaction receipt:', receipt);

    alert(`Transaction successful! Hash: ${receipt.transactionHash}`);
    
    // Update wallet data
    fetchEthWalletData(selectedAddress);
    
  } catch (error) {
    console.error('Error sending ETH tokens:', error);
    alert('Transaction failed! Please check the console for details.');
  } finally {
    setLoading(false);
  }
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

      <div>Balance: {balance !== null ? `${balance} ETH` : 'Loading...'}</div>

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
              {transactions.map((tx, index) => (
                <tr key={index}>
                  <td>{truncateHash(tx.hash)} <button onClick={() => copyToClipboard(tx.hash)}>Copy</button></td>
                  <td>{tx.from} <button onClick={() => copyToClipboard(tx.from)}>Copy</button></td>
                  <td>{tx.to} <button onClick={() => copyToClipboard(tx.to)}>Copy</button></td>
                  <td>{formatAmount(tx.value)} ETH</td>
                </tr>
              ))}
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
    </div>
  );
};



EthWallet.propTypes = {
  walletType: PropTypes.string.isRequired,
  setWalletType: PropTypes.func.isRequired,
};
