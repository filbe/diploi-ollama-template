import http from 'http';
import { shellExec } from './shellExec.mjs';

const Status = {
  GREEN: 'green',
  GREY: 'gray',
  YELLOW: 'yellow',
  RED: 'red',
};

const getOllamaServerStatus = async () => {
  let ollamaServerProcessStatus = {
    status: Status.GREY,
    message: 'Initializing',
  };
  try {
    const response = (await shellExec('supervisorctl status ollama-server')).stdout;
    if (response && response.indexOf('RUNNING') !== -1) {
      const models = (await shellExec('ollama list | grep -v NAME')).stdout;
      const modelsList = (models.split("\n").filter((r) => !!r).map((r) => r.split(":")[0].split("\t")[0]).join(", ")).trim();
      ollamaServerProcessStatus = {
        status: Status.GREEN,
        message: `Installed models: ${modelsList ? modelsList : '[no AI models installed]'}`,
      };
    } else {
      ollamaServerProcessStatus = {
        status: Status.RED,
        message: response,
      };
    }
  } catch (e) {
    ollamaServerProcessStatus = {
      status: Status.YELLOW,
      message: JSON.stringify(e),
    };
  }
  return {
    identifier: 'ollama-server',
    name: 'Ollama Server Host',
    description: 'AI model runner',
    ...ollamaServerProcessStatus,
  };
};

const getStatus = async () => {
  const ollamaServerStatus = await getOllamaServerStatus();

  const status = {
    diploiStatusVersion: 1,
    items: [ollamaServerStatus],
  };

  return status;
};

const requestListener = async (req, res) => {
  res.writeHead(200);
  const status = await getStatus();
  res.end(JSON.stringify(status));
};

const server = http.createServer(requestListener);
server.listen(3000);

const podReadinessLoop = async (lastStatusIsOK) => {
  const status = await getStatus();
  let allOK = !status.items.find((s) => s.status !== Status.GREEN);
  if (allOK) {
    if (!lastStatusIsOK) {
      console.log(
        new Date(),
        '<STATUS> Status is OK, logging is off until next error (checks every 30s)'
      );
    }
    await shellExec('touch /tmp/pod-ready');
  } else {
    console.log(new Date(), '<STATUS> Status not OK', status);
    setTimeout(() => {
      podReadinessLoop(allOK);
    }, 1000 + (allOK ? 1 : 0) * 30000);
  }
};
(async () => {
  podReadinessLoop(false);
})();
