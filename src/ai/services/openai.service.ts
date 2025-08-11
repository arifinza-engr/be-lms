import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenaiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateContent(prompt: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Kamu adalah asisten pembelajaran AI yang membantu siswa memahami materi pelajaran. Berikan penjelasan yang jelas, mudah dipahami, dan menarik.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || 'Maaf, tidak dapat menghasilkan konten saat ini.';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return 'Maaf, terjadi kesalahan dalam menghasilkan konten. Silakan coba lagi nanti.';
    }
  }

  async generateQuiz(topic: string, difficulty: string = 'medium'): Promise<any> {
    try {
      const prompt = `Buatkan 5 soal pilihan ganda untuk topik "${topic}" dengan tingkat kesulitan ${difficulty}.
      
      Format JSON:
      {
        "questions": [
          {
            "question": "Pertanyaan...",
            "options": ["A. Pilihan 1", "B. Pilihan 2", "C. Pilihan 3", "D. Pilihan 4"],
            "correctAnswer": "A",
            "explanation": "Penjelasan jawaban..."
          }
        ]
      }`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Kamu adalah pembuat soal ujian yang ahli. Buatkan soal yang berkualitas dan sesuai dengan kurikulum Indonesia.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.5,
      });

      const response = completion.choices[0]?.message?.content;
      return JSON.parse(response || '{"questions": []}');
    } catch (error) {
      console.error('OpenAI Quiz Generation Error:', error);
      return { questions: [] };
    }
  }
}