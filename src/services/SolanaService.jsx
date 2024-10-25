// import { Alchemy } from 'alchemy-sdk';
import axios from 'axios';  // Using axios for HTTP requests
// import { Connection, PublicKey } from '@solana/web3.js';

// Set up Alchemy API URL for Solana mainnet
const ALCHEMY_URL = import.meta.env.VITE_ALCHEMY_URL;

// Function to fetch Solana balance using Alchemy API
export const getSolanaBalance = async (walletAddress) => {
  try {
    const response = await axios.post(ALCHEMY_URL, {
      jsonrpc: "2.0",
      id: 1,
      method: "getBalance",
      params: [walletAddress]
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Extract balance from response (value in lamports)
    const balanceInLamports = response.data.result.value;
    
    // Convert lamports to SOL (1 SOL = 10^9 lamports)
    const balanceInSol = balanceInLamports / 1e9;
    
    console.log(`Balance: ${balanceInSol} SOL`);
    return balanceInSol;
  } catch (error) {
    console.error("Error fetching Solana balance:", error);
    throw error;
  }
};
// **Function to get Solana transaction history**
// const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

// Function to get Solana transaction history

export const getSolanaTransactionHistory = async (walletAddress) => {
  try {
    // Fetch the last 10 confirmed signatures for the wallet address
    const response = await axios.post(ALCHEMY_URL, {
      jsonrpc: "2.0",
      id: 1,
      method: "getConfirmedSignaturesForAddress2",
      params: [
        walletAddress,
        {
          limit: 10 // Limit to the last 10 transactions
        }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const confirmedSignatures = response.data.result;
    console.log("Confirmed signatures:", confirmedSignatures);

    const transactions = [];
    for (const signature of confirmedSignatures) {
      // Fetch each confirmed transaction
      const txResponse = await axios.post(ALCHEMY_URL, {
        jsonrpc: "2.0",
        id: 1,
        method: "getTransaction",
        params: [
          signature.signature,
          {
            commitment: "confirmed"
          }
        ]
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      transactions.push(txResponse.data.result);
    }
    console.log("Transactions:", transactions);
    return transactions;
  } catch (error) {
    console.error("Error fetching Solana transaction history:", error);
    throw error;
  }
  
};
