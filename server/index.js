const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const { SpeechClient } = require('@google-cloud/speech');
const { Storage } = require('@google-cloud/storage');
const path = require('path');

const app = express();
app.use(cors());

const upload = multer({ dest: 'uploads/' });

const GOOGLE_CLOUD_KEY = 'your-google-cloud-key.json'; // path to your key
const BUCKET_NAME = 'echomentor-audio-bucket'; // replace with your actual bucket name

const speechClient = new SpeechClient({ keyFilename: GOOGLE_CLOUD_KEY });
const storage = new Storage({ keyFilename: GOOGLE_CLOUD_KEY });

async function uploadToBucket(localPath, destFileName) {
  await storage.bucket(BUCKET_NAME).upload(localPath, {
    destination: destFileName,
  });

  console.log(`Uploaded ${localPath} to gs://${BUCKET_NAME}/${destFileName}`);
  return `gs://${BUCKET_NAME}/${destFileName}`;
}

app.post('/transcribe', upload.single('audio'), async (req, res) => {
  const localFilePath = req.file.path;
  const destFileName = req.file.filename + path.extname(req.file.originalname); // retain extension

  try {
    // Upload to GCS
    const gcsUri = await uploadToBucket(localFilePath, destFileName);

    // Transcribe from GCS
    const request = {
      audio: { uri: gcsUri },
      config: {
        encoding: 'WEBM_OPUS', // change if different (e.g. LINEAR16 for .wav)
        sampleRateHertz: 48000,
        languageCode: 'en-US',
      },
    };

    const [operation] = await speechClient.longRunningRecognize(request);
    const [response] = await operation.promise();

    const transcription = response.results
      .map((result) => result.alternatives[0].transcript)
      .join('\n');

    // Clean up
    fs.unlinkSync(localFilePath);

    res.json({ transcript: transcription });
  } catch (err) {
    console.error('Transcription Error:', err);
    res.status(500).send('Transcription failed');
  }
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
