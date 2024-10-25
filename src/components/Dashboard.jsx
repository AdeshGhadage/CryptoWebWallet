import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SolanaWallet } from './SolanaWallet';
// import { EthWallet } from './EthWallet';
import PropTypes from 'prop-types';

export function Dashboard() {
  const [walletType, setWalletType] = useState('solana');
  const navigate = useNavigate(); // Hook for navigation

  const handleLogout = () => {
    localStorage.clear();
      // Reset the mnemonic state
    navigate('/');    // Redirect to WelcomePage
  };

  return (
    <div>
      <h1>Dashboard</h1>
      {walletType === 'solana' ? (
        //pass setWalletType as a prop to SolanaWallet
        <SolanaWallet walletType={walletType} setWalletType={setWalletType}/>
      ) : (
        // <EthWallet walletType={walletType} setWalletType={setWalletType}/>
        <div>ETH Wallet</div>
      )}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}


Dashboard.propTypes = {
  mnemonic: PropTypes.string.isRequired,
  setMnemonic: PropTypes.func.isRequired,
};