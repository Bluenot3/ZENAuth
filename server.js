import express from 'express';
import { initializeWalletConnect, connectWallet } from './walletConnect.js';

const app = express();

let web3wallet;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/connect', async (req, res) => {
  try {
    if (!web3wallet) {
      web3wallet = await initializeWalletConnect();
    }
    const session = await connectWallet();
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
