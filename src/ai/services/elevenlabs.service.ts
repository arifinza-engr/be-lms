import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ElevenlabsService {
  private readonly apiKey: string;
  private readonly voiceId: string;
  private readonly baseUrl = 'https://api.elevenlabs.io/v1';

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY;
    this.voiceId = process.env.ELEVENLABS_VOICE_ID;
  }

  async generateAudio(text: string): Promise<string | null> {
    if (!this.apiKey || !this.voiceId) {
      console.warn('ElevenLabs API key or voice ID not configured');
      return null;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${this.voiceId}`,
        {
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          responseType: 'arraybuffer',
        },
      );

      // In a real application, you would upload this to a cloud storage service
      // and return the URL. For now, we'll return a placeholder URL
      const audioBuffer = Buffer.from(response.data);
      
      // TODO: Upload to cloud storage (AWS S3, Google Cloud Storage, etc.)
      // For now, return a placeholder URL
      const audioUrl = `https://your-storage-service.com/audio/${Date.now()}.mp3`;
      
      console.log(`Generated audio for text (${text.length} chars): ${audioUrl}`);
      return audioUrl;
    } catch (error) {
      console.error('ElevenLabs API Error:', error);
      return null;
    }
  }

  async getVoices() {
    if (!this.apiKey) {
      return [];
    }

    try {
      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      return response.data.voices;
    } catch (error) {
      console.error('ElevenLabs Get Voices Error:', error);
      return [];
    }
  }
}