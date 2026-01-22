import express from 'express';
import fetch from 'node-fetch';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, '../temp');

// Ensure temp directory exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Download audio from TikTok video using yt-dlp
async function downloadAudio(url, outputPath) {
  try {
    // Download audio only, convert to mp3
    await execAsync(
      `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${outputPath}" "${url}" 2>/dev/null`,
      { timeout: 60000 }
    );
    return true;
  } catch (err) {
    console.error('Download error:', err.message);
    return false;
  }
}

// Transcribe audio using Hugging Face Whisper API
async function transcribeAudio(audioPath, apiKey) {
  try {
    const audioBuffer = fs.readFileSync(audioPath);
    
    const response = await fetch(
      'https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'audio/mpeg'
        },
        body: audioBuffer
      }
    );

    if (response.ok) {
      const result = await response.json();
      return result.text || '';
    }
    return '';
  } catch (err) {
    console.error('Transcription error:', err.message);
    return '';
  }
}

// Get video metadata using yt-dlp
async function getVideoMeta(url) {
  try {
    const { stdout } = await execAsync(`yt-dlp --dump-json "${url}" 2>/dev/null`, {
      timeout: 30000
    });
    const data = JSON.parse(stdout);
    return {
      title: data.title || '',
      description: data.description || '',
      uploader: data.uploader || ''
    };
  } catch {
    return null;
  }
}

router.post('/', async (req, res) => {
  try {
    const { urls = [] } = req.body;
    const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
    
    if (!HUGGINGFACE_API_KEY) {
      return res.status(400).json({ error: 'Set HUGGINGFACE_API_KEY in server env' });
    }

    if (urls.length === 0) {
      return res.status(400).json({ error: 'No URLs provided' });
    }

    const extracted = [];

    for (const url of urls.slice(0, 3)) { // Limit to 3 videos at a time
      const videoId = Date.now() + Math.random().toString(36).slice(2);
      const audioPath = path.join(tempDir, `${videoId}.mp3`);
      
      try {
        console.log(`Processing: ${url}`);
        
        // Get video metadata
        const meta = await getVideoMeta(url);
        
        // Download and transcribe audio
        let transcript = '';
        const downloaded = await downloadAudio(url, audioPath);
        
        if (downloaded && fs.existsSync(audioPath)) {
          console.log('Transcribing audio...');
          transcript = await transcribeAudio(audioPath, HUGGINGFACE_API_KEY);
          console.log('Transcript:', transcript.slice(0, 100) + '...');
          
          // Clean up audio file
          fs.unlinkSync(audioPath);
        }

        // Use AI to extract travel info from transcript + metadata
        const prompt = `Extract travel information from this TikTok video:

Video Title: ${meta?.title || 'Unknown'}
Video Description: ${meta?.description || 'None'}
Creator: ${meta?.uploader || 'Unknown'}

TRANSCRIPT OF WHAT THEY SAY IN THE VIDEO:
"${transcript || 'Could not transcribe'}"

Based on the transcript and metadata, extract:
1. The travel destination mentioned (city, country)
2. Key travel tips, recommendations, or places they mention

Return ONLY a JSON object:
{"destination": "City, Country", "tips": "key tips/places mentioned", "summary": "brief summary of video content"}`;

        const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`
          },
          body: JSON.stringify({
            model: 'Qwen/Qwen2.5-72B-Instruct',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 300
          })
        });

        let destination = '';
        let tips = '';
        let summary = '';

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content || '';
          
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[0]);
              destination = parsed.destination || '';
              tips = parsed.tips || '';
              summary = parsed.summary || '';
            } catch {}
          }
        }

        extracted.push({
          url,
          title: meta?.title || '',
          transcript: transcript.slice(0, 500), // First 500 chars
          destination: destination || 'Could not extract',
          tips: tips || '',
          summary: summary || ''
        });

      } catch (err) {
        console.error('Error processing URL:', url, err.message);
        extracted.push({ 
          url, 
          destination: 'Error processing video', 
          tips: '',
          error: err.message 
        });
        
        // Clean up on error
        if (fs.existsSync(audioPath)) {
          fs.unlinkSync(audioPath);
        }
      }
    }

    res.json({ extracted });
  } catch (err) {
    console.error('Extract error:', err);
    res.status(500).json({ error: 'Failed to extract info' });
  }
});

export default router;
