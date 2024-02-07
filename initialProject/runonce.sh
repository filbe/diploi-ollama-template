#!/bin/bash
echo "Pulling the first Ollama AI model..."

ollama pull llama2-uncensored

cd /app
npm i
supervisorctl start tale
echo "Runonce Done!"