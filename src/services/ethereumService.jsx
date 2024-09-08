import axios from 'axios';  // Using axios for HTTP requests

// Set up Alchemy API URL for Ethereum mainnet
const ALCHEMY_URL = 'https://eth-mainnet.g.alchemy.com/v2/PTVcI7jurEiuKvi97DtShwoj7pCnSV2n';

// Function to fetch Ethereum balance using Alchemy API
export const getEthBalance = async (walletAddress) => {
  try {
    const response = await axios.post(ALCHEMY_URL, {
      jsonrpc: "2.0",
      id: 1,
      method: "eth_getBalance",
      params: [walletAddress, "latest"]  // "latest" to get the most recent balance
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Extract balance from response (value in wei)
    const balanceInWei = response.data.result;
    
    // Convert wei to Ether (1 Ether = 10^18 wei)
    const balanceInEther = parseFloat(balanceInWei) / 1e18;
    
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
    const response = await axios.post(ALCHEMY_URL, {
      jsonrpc: "2.0",
      id: 1,
      method: "alchemy_getAssetTransfers",
      params: [{
        fromAddress: walletAddress,
        category: ["external", "internal", "erc20", "erc721", "erc1155"],
        order: "desc",
      }],
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Return the list of transactions
    return response.data.result.transfers;
  } catch (error) {
    console.error("Error fetching Ethereum transaction history:", error);
    throw error;
  }
};

