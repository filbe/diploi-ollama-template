import {Ollama} from 'ollama'

const ollama = new Ollama({host: 'localhost:11434'});
const ollama2 = new Ollama({host: 'localhost:11435'});

let messageHistory = [{ role: 'user', content: `Let's generate a tale sentence by sentence, only one at a time. You will start with the first, I will write the second, you take the third and so on!` }];
let previousMessage;
while(true) {
    console.log("ollama2> " + messageHistory[messageHistory.length - 1].content);
    previousMessage = (await ollama.chat({
        role: 'user',
        model: 'llama2',
        messages: messageHistory,
    })).message;
    messageHistory.push({...previousMessage, role: 'user'});
    console.log("ollama1> " + messageHistory[messageHistory.length - 1].content);
    previousMessage = (await ollama2.chat({
        role: 'user',
        model: 'llama2',
        messages: messageHistory,
    })).message;
    messageHistory.push({...previousMessage, role: 'user'});

}