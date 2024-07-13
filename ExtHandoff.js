// Glitch.com server (server.js)
const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for your Wix site
app.use(cors({
  origin: 'https://your-wix-site.com'  // Replace with your Wix site's URL
}));

app.use(express.json());

// Example endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Glitch!' });
});

const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

// Wix frontend code (in your page's .js file)
import {fetch} from 'wix-fetch';

$w.onReady(function () {
  $w('#myButton').onClick(() => callGlitchAPI());
});

async function callGlitchAPI() {
  try {
    const response = await fetch('https://your-glitch-project.glitch.me/api/hello');
    const data = await response.json();
    console.log(data.message);
    $w('#myText').text = data.message;
  } catch (error) {
    console.error('Error calling Glitch API:', error);
  }
}
