require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json({ limit: '10mb' }));

const convertTextToSpeech = async (text, voiceId) => {
  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    { text },
    {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      responseType: 'arraybuffer'
    }
  );
  return response.data;
};

app.post('/webhook/vapi', async (req, res) => {
  const { userId, audio } = req.body;
  const text = "Hello, how can I help you?"; // Stubbed transcription
  const voiceId = process.env.ELEVENLABS_VOICE_US;

  try {
    const audioData = await convertTextToSpeech(text, voiceId);
    res.set({ 'Content-Type': 'audio/mpeg' });
    res.send(audioData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Vapi Webhook running'));