#!/bin/bash
echo "Pulling the first Ollama AI model..."

# running it only once could give some weird error due to bug of Ollama repository
ollama pull llama2; ollama pull llama2; ollama pull llama2

cd /app
npm i
supervisorctl start tale
echo "Runonce Done!"