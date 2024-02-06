import http from 'http';
import { shellExec } from './shellExec.mjs';

const Status = {
  GREEN: 'green',
  GREY: 'gray',
  YELLOW: 'yellow',
  RED: 'red',
};

const getMyAppStatus = async () => {
  let myAppProcessStatus = {
    status: Status.GREY,
    message: 'Initializing',
  };
  try {
    const response = (await shellExec('supervisorctl status myapp')).stdout;
    if (response && response.indexOf('RUNNING') !== -1) {
      myAppProcessStatus = {
        status: Status.GREEN,
      };
    } else {
      myAppProcessStatus = {
        status: Status.RED,
        message: response,
      };
    }
  } catch (e) {
    myAppProcessStatus = {
      status: Status.YELLOW,
      message: JSON.stringify(e),
    };
  }
  return {
    identifier: 'myapp',
    name: 'My App',
    description: 'My Test App',
    ...myAppProcessStatus,
  };
};

const getStatus = async () => {
  const myAppStatus = await getMyAppStatus();

  const status = {
    diploiStatusVersion: 1,
    items: [myAppStatus],
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
