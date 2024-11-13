const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const externalUrl = process.env.RENDER_EXTERNAL_URL;
const PORT = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'game.html'));
});

const hostname = '0.0.0.0';
  app.listen(PORT, hostname, () => {
  console.log(`Server locally running at http://${hostname}:${PORT}/ and from
  outside on ${externalUrl}`);
  });