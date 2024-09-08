// indexedDBService.js

const DB_NAME = 'CryptoWalletDB';
const DB_VERSION = 1;
const USER_STORE = 'users';
const ETH_WALLETS_STORE = 'eth_wallets';
const SOLANA_WALLETS_STORE = 'solana_wallets';

let db;

export function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains(USER_STORE)) {
        db.createObjectStore(USER_STORE, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(ETH_WALLETS_STORE)) {
        db.createObjectStore(ETH_WALLETS_STORE, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(SOLANA_WALLETS_STORE)) {
        db.createObjectStore(SOLANA_WALLETS_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

export function addUser(user) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(USER_STORE, 'readwrite');
    const store = transaction.objectStore(USER_STORE);
    const request = store.add(user);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function getUser(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(USER_STORE, 'readonly');
    const store = transaction.objectStore(USER_STORE);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function addEthWallet(wallet) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ETH_WALLETS_STORE, 'readwrite');
    const store = transaction.objectStore(ETH_WALLETS_STORE);
    const request = store.add(wallet);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function addSolanaWallet(wallet) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SOLANA_WALLETS_STORE, 'readwrite');
    const store = transaction.objectStore(SOLANA_WALLETS_STORE);
    const request = store.add(wallet);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function getEthWallets() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ETH_WALLETS_STORE, 'readonly');
    const store = transaction.objectStore(ETH_WALLETS_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function getSolanaWallets() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SOLANA_WALLETS_STORE, 'readonly');
    const store = transaction.objectStore(SOLANA_WALLETS_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
