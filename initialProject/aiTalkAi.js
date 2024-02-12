import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'localhost:11434' });
const ollama2 = new Ollama({ host: 'localhost:11435' });

const formatInstruction = `Output JSON in this format: {"sentence":"Some example sentence."}. Nothing else should be returned.`;
const initialInstruction = `Let's generate a tale about ${
  process.env.TOPIC || '"incompleted environment variables in your Diploi Deployment"'
}, sentence by sentence, only one at a time, no multiple sentences but only, ONLY one! ${formatInstruction}`;
let taleSentences = [];
const completionInstruction = `You are about to read a tale about ${
  process.env.TOPIC || '"incompleted environment variables in your Diploi Deployment"'
} that is incompleted. Generate one sentence to it - only one at a time, no multiple. ${formatInstruction}. You are given the full story before your sentence.`;
console.log('Initial prompt:', initialInstruction);
while (true) {
  const resp = await ollama.generate({
    model: 'llama2',
    format: 'json',
    stream: false,
    system: completionInstruction,
    options: {
      repeat_penalty: 1.23,
      penalize_newline: true,
      temperature: 0.75,
    },
    prompt: taleSentences.length ? `${taleSentences.join('. ')}` : initialInstruction,
  });
  const { sentence } = JSON.parse(resp.response);
  console.log('llama>', sentence);
  taleSentences.push(sentence);

  const resp2 = await ollama2.generate({
    model: 'llama2',
    format: 'json',
    stream: false,
    system: completionInstruction,
    options: {
      repeat_penalty: 1.33,
      penalize_newline: true,
      temperature: 0.99,
    },
    prompt: `${taleSentences.join('. ')}`,
  });
  const { sentence: sentence2 } = JSON.parse(resp2.response);
  console.log('another llama>', sentence2);
  taleSentences.push(sentence2);
}
