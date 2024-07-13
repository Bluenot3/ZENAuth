// File: server.js in your Glitch project

const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for your Wix site
app.use(cors({
  origin: 'https://zenai.biz'  // Your Wix site URL
}));

app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('ZENAuth Glitch server is running. Use /api/hello to test the API.');
});

// Example API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from ZENAuth Glitch server!' });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).send('404: Page not found');
});

const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
