const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  const soundDir = path.join(__dirname, '..', 'sound');

  fs.readdir(soundDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to list sound files' });
    }

    const audioFiles = files.filter(file => /\.(mp3|wav|ogg|m4a)$/i.test(file));
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(audioFiles));
  });
};
