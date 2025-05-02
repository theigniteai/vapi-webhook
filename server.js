require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json({ limit: '10mb' }));

// Simulated user preference (would be pulled from DB in real app)
const userVoiceMap = {
  "freelancer-001": process.env.ELEVENLABS_VOICE_US,
  "callcenter-002": process.env.ELEVENLABS_VOICE_UK
};

const transcribeAudio = async (audioUrl) => {
  const whisperResponse = await axios.post(
    'https://api.openai.com/v1/audio/transcriptions',
    {
      file: audioUrl,  // Or pass Buffer
      model: 'whisper-1'
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return whisperResponse.data.text;
};

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
  const { userId, audioUrl } = req.body;

  const voiceId = userVoiceMap[userId] || process.env.ELEVENLABS_VOICE_US;

  try {
    const text = await transcribeAudio(audioUrl);
    const audioData = await convertTextToSpeech(text, voiceId);
    res.set({ 'Content-Type': 'audio/mpeg' });
    res.send(audioData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Vapi Webhook + Whisper running on port ${PORT}`));
