import axios from 'axios';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

// Set up Alchemy API URL for Solana devnet
const ALCHEMY_URL = import.meta.env.VITE_ALCHEMY_SOLANA_DEVNET_URL;

// Fallback to public Solana devnet RPC if Alchemy URL is not configured
const SOLANA_RPC_URL = ALCHEMY_URL || 'https://api.devnet.solana.com';

// Create connection instance
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// Function to fetch Solana balance
export const getSolanaBalance = async (walletAddress) => {
  try {
    // Validate wallet address
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }

    // Try using native Solana connection first
    try {
      const publicKey = new PublicKey(walletAddress);
      const balanceInLamports = await connection.getBalance(publicKey);
      const balanceInSol = balanceInLamports / 1e9;
      
      console.log(`Balance: ${balanceInSol} SOL`);
      return balanceInSol;
    } catch (connectionError) {
      // Fallback to direct RPC call if connection fails
      console.log('Falling back to direct RPC call...');
      
      const response = await axios.post(SOLANA_RPC_URL, {
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [walletAddress]
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      const balanceInLamports = response.data.result.value;
      const balanceInSol = balanceInLamports / 1e9;
      
      console.log(`Balance: ${balanceInSol} SOL`);
      return balanceInSol;
    }
  } catch (error) {
    console.error("Error fetching Solana balance:", error);
    throw error;
  }
};
// Function to get Solana transaction history
export const getSolanaTransactionHistory = async (walletAddress) => {
  try {
    // Validate wallet address
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }

    // Try using native Solana connection first
    try {
      const publicKey = new PublicKey(walletAddress);
      
      // Get recent transaction signatures
      const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 10 });
      
      const transactions = [];
      for (const signature of signatures) {
        try {
          // Get transaction details
          const transaction = await connection.getTransaction(signature.signature, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0
          });
          
          if (transaction) {
            transactions.push({
              signature: signature.signature,
              slot: signature.slot,
              blockTime: signature.blockTime,
              confirmationStatus: signature.confirmationStatus,
              err: signature.err,
              memo: signature.memo,
              transaction: transaction
            });
          }
        } catch (txError) {
          console.warn(`Failed to fetch transaction ${signature.signature}:`, txError);
          // Continue with other transactions even if one fails
        }
      }
      
      console.log("Transactions:", transactions);
      return transactions;
      
    } catch (connectionError) {
      // Fallback to direct RPC calls if connection fails
      console.log('Falling back to direct RPC calls for transaction history...');
      
      // Get signatures using direct RPC call with updated method name
      const response = await axios.post(SOLANA_RPC_URL, {
        jsonrpc: "2.0",
        id: 1,
        method: "getSignaturesForAddress",
        params: [
          walletAddress,
          {
            limit: 10
          }
        ]
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      const confirmedSignatures = response.data.result;
      console.log("Confirmed signatures:", confirmedSignatures);

      const transactions = [];
      for (const signature of confirmedSignatures) {
        try {
          // Fetch each transaction using updated method
          const txResponse = await axios.post(SOLANA_RPC_URL, {
            jsonrpc: "2.0",
            id: 1,
            method: "getTransaction",
            params: [
              signature.signature,
              {
                commitment: "confirmed",
                maxSupportedTransactionVersion: 0,
                encoding: "json"
              }
            ]
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (txResponse.data.result) {
            transactions.push({
              signature: signature.signature,
              slot: signature.slot,
              blockTime: signature.blockTime,
              confirmationStatus: signature.confirmationStatus,
              err: signature.err,
              memo: signature.memo,
              transaction: txResponse.data.result
            });
          }
        } catch (txError) {
          console.warn(`Failed to fetch transaction ${signature.signature}:`, txError);
          // Continue with other transactions even if one fails
        }
      }
      
      console.log("Transactions:", transactions);
      return transactions;
    }
  } catch (error) {
    console.error("Error fetching Solana transaction history:", error);
    throw error;
  }
};

// Function to request airdrop (only works on devnet/testnet)
export const requestAirdrop = async (walletAddress, amount = 1) => {
  try {
    // Validate wallet address
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }

    // Convert SOL to lamports
    const lamports = amount * 1e9;
    
    // Try using native connection first
    try {
      const publicKey = new PublicKey(walletAddress);
      const signature = await connection.requestAirdrop(publicKey, lamports);
      
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature);
      
      console.log(`Airdrop successful: ${signature}`);
      return {
        signature,
        amount,
        success: true
      };
    } catch (connectionError) {
      // Fallback to direct RPC call
      console.log('Falling back to direct RPC call for airdrop...');
      
      const response = await axios.post(SOLANA_RPC_URL, {
        jsonrpc: "2.0",
        id: 1,
        method: "requestAirdrop",
        params: [
          walletAddress,
          lamports
        ]
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      const signature = response.data.result;
      console.log(`Airdrop successful: ${signature}`);
      
      return {
        signature,
        amount,
        success: true
      };
    }
  } catch (error) {
    console.error("Error requesting airdrop:", error);
    
    // Provide user-friendly error messages
    if (error.message.includes('rate limit')) {
      throw new Error('Airdrop rate limit reached. Please try again later.');
    } else if (error.message.includes('insufficient funds')) {
      throw new Error('Airdrop faucet has insufficient funds.');
    } else if (error.message.includes('mainnet')) {
      throw new Error('Airdrops are only available on devnet/testnet networks.');
    }
    
    throw error;
  }
};

// Function to send SOL transaction
export const sendSolanaTransaction = async (fromKeypair, toAddress, amount) => {
  try {
    // Validate inputs
    if (!fromKeypair || !toAddress || !amount) {
      throw new Error('All parameters are required');
    }

    const fromPublicKey = fromKeypair.publicKey;
    const toPublicKey = new PublicKey(toAddress);
    const lamports = Math.floor(amount * 1e9); // Convert SOL to lamports

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();

    // Create transaction
    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: fromPublicKey,
    });

    // Add transfer instruction
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: fromPublicKey,
        toPubkey: toPublicKey,
        lamports: lamports,
      })
    );

    // Sign and send transaction
    const signature = await connection.sendTransaction(transaction, [fromKeypair]);

    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(signature);

    console.log(`Transaction successful: ${signature}`);
    return {
      signature,
      success: true,
      amount,
      from: fromPublicKey.toString(),
      to: toAddress
    };

  } catch (error) {
    console.error("Error sending transaction:", error);
    
    // Provide user-friendly error messages
    if (error.message.includes('insufficient funds')) {
      throw new Error('Insufficient balance to complete the transaction.');
    } else if (error.message.includes('invalid')) {
      throw new Error('Invalid recipient address.');
    }
    
    throw error;
  }
};

// Utility function to validate Solana address
export const isValidSolanaAddress = (address) => {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};

// Utility function to check network connection
export const checkSolanaConnection = async () => {
  try {
    const version = await connection.getVersion();
    console.log('Connected to Solana devnet:', version);
    return true;
  } catch (error) {
    console.error('Failed to connect to Solana network:', error);
    return false;
  }
};
