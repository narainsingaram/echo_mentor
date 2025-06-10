const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const { SpeechClient } = require('@google-cloud/speech');

const app = express();
app.use(cors());
const upload = multer({ dest: 'uploads/' });

const speechClient = new SpeechClient({
  keyFilename: 'your-google-cloud-key.json',
});

app.post('/transcribe', upload.single('audio'), async (req, res) => {
  const filename = req.file.path;

  const file = fs.readFileSync(filename);
  const audioBytes = file.toString('base64');

  const audio = {
    content: audioBytes,
  };

  const config = {
    encoding: 'WEBM_OPUS', // or use LINEAR16 if you convert the file
    sampleRateHertz: 48000,
    languageCode: 'en-US',
  };

  const request = {
    audio: audio,
    config: config,
  };

  try {
    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      .map((result) => result.alternatives[0].transcript)
      .join('\n');

    fs.unlinkSync(filename); // delete file after processing
    res.json({ transcript: transcription });
  } catch (err) {
    console.error(err);
    res.status(500).send('Transcription failed');
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));
