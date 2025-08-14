import axios from 'axios';

// Set up Alchemy API URL for Ethereum Sepolia testnet
const ALCHEMY_ETH_URL = import.meta.env.VITE_ALCHEMY_ETH_SEPOLIA_URL;

// Fallback to public Sepolia RPC if Alchemy URL is not configured
const ETH_RPC_URL = ALCHEMY_ETH_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo';

// Function to fetch Ethereum balance using Alchemy API
export const getEthBalance = async (walletAddress) => {
  try {
    // Validate wallet address
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }

    const response = await axios.post(ETH_RPC_URL, {
      jsonrpc: "2.0",
      id: 1,
      method: "eth_getBalance",
      params: [walletAddress, "latest"]
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.error) {
      throw new Error(response.data.error.message);
    }

    // Extract balance from response (value in wei)
    const balanceInWei = response.data.result;
    
    // Convert wei to Ether (1 Ether = 10^18 wei)
    const balanceInEther = parseInt(balanceInWei, 16) / 1e18;
    
    console.log(`Balance: ${balanceInEther} ETH`);
    return balanceInEther;
  } catch (error) {
    console.error("Error fetching Ethereum balance:", error);
    throw error;
  }
};

// Function to get Ethereum transaction history
export const getEthTransactionHistory = async (walletAddress) => {
  try {
    // Validate wallet address
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }

    const response = await axios.post(ETH_RPC_URL, {
      jsonrpc: "2.0",
      id: 1,
      method: "alchemy_getAssetTransfers",
      params: [{
        fromAddress: walletAddress,
        toAddress: walletAddress,
        category: ["external", "internal", "erc20", "erc721", "erc1155"],
        order: "desc",
        maxCount: "0x64", // Limit to 100 transactions
        excludeZeroValue: false
      }],
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.error) {
      console.warn("Error fetching transaction history:", response.data.error);
      return [];
    }
    
    // Return the list of transactions
    return response.data.result?.transfers || [];
  } catch (error) {
    console.error("Error fetching Ethereum transaction history:", error);
    return []; // Return empty array instead of throwing
  }
};

// Function to get current gas price
export const getCurrentGasPrice = async () => {
  try {
    const response = await axios.post(ETH_RPC_URL, {
      jsonrpc: "2.0",
      id: 1,
      method: "eth_gasPrice",
      params: []
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.error) {
      throw new Error(response.data.error.message);
    }

    return response.data.result;
  } catch (error) {
    console.error("Error fetching gas price:", error);
    // Return a default gas price (20 gwei) if fetch fails
    return "0x4a817c800"; 
  }
};

