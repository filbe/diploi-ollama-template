import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'localhost:11434' });
const ollama2 = new Ollama({ host: 'localhost:11435' });

const formatInstruction = `Output JSON in this format: {"sentence":"Some example sentence."}. Nothing else should be returned.`;
const initialInstruction = `Let's generate a tale about ${
  process.env.TOPIC || '"incompleted environment variables in your Diploi Deployment"'
}, sentence by sentence, only one at a time. ${formatInstruction}`;
let taleSentences = [];
const completionInstruction = `You are about to read a tale about ${
  process.env.TOPIC || '"incompleted environment variables in your Diploi Deployment"'
} that is incompleted. Generate one more sentence to it. ${formatInstruction}. The tale begins here:`;
console.log('Initial prompt:', initialInstruction);
while (true) {
  const resp = await ollama.generate({
    model: 'llama2',
    format: 'json',
    stream: false,
    prompt: taleSentences.length ? `${completionInstruction}\n${taleSentences.join('\n')}` : initialInstruction,
  });
  const { sentence } = JSON.parse(resp.response);
  console.log('ollama1>', sentence);
  taleSentences.push(sentence);

  const resp2 = await ollama2.generate({
    model: 'llama2',
    format: 'json',
    stream: false,
    prompt: `${completionInstruction}\n${taleSentences.join('\n')}`,
  });

  const { sentence: sentence2 } = JSON.parse(resp2.response);
  console.log('ollama2>', sentence2);
  taleSentences.push(sentence2);
}
