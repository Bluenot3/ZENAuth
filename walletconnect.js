import { Core } from '@walletconnect/core';
import { Web3Wallet } from '@walletconnect/web3wallet';

let web3wallet;

async function initializeWalletConnect() {
  const core = new Core({
    projectId: 'b699fee0f8ffb0b7c4fed50559921dd0'
  });

  const metadata = {
    name: 'ZEN',
    description: 'AppKit Example',
    url: 'https://your-project-name.glitch.me', // Replace with your Glitch project URL
    icons: ['https://avatars.githubusercontent.com/u/37784886'] // Replace with your app icon URL
  };

  web3wallet = await Web3Wallet.init({
    core,
    metadata
  });

  console.log('WalletConnect initialized');
  return web3wallet;
}

async function connectWallet() {
  if (!web3wallet) {
    console.error('WalletConnect not initialized');
    return;
  }

  try {
    const sessions = await web3wallet.getActiveSessions();
    if (Object.keys(sessions).length) {
      console.log('Already connected');
      return sessions[Object.keys(sessions)[0]];
    } else {
      const { uri, approval } = await web3wallet.core.pairing.create({ metadata: web3wallet.metadata });
      
      // Here you would typically show this URI to the user, often as a QR code
      console.log('Please connect your wallet using this URI:', uri);
      
      // Wait for the user to approve the session
      const session = await approval();
      console.log('Session created', session);
      return session;
    }
  } catch (error) {
    console.error('Failed to connect wallet:', error);
  }
}

export { initializeWalletConnect, connectWallet };
