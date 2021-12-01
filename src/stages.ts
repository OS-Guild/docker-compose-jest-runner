import { readFile } from "fs/promises";
import * as yaml from 'js-yaml';
import dc, { IDockerComposeOptions } from 'docker-compose';
import * as waitOn from 'wait-on';

import { Check, Config, Service } from "./types";

const configFilePath = process.env.DC_JEST_RUNNER_CONFIG || 'dc-jest-runner.yml';

let config: Config;
let dcOptions: IDockerComposeOptions;

export async function init() {
  const configStr = await readFile(configFilePath, { encoding: "utf8" });
  config = yaml.load(configStr) as Config;

  dcOptions = {
    env: {
      COMPOSE_DOCKER_CLI_BUILD: '1',
      DOCKER_BUILDKIT: '1',
      PATH: process.env.PATH,
      NODE_AUTH_TOKEN: process.env.NODE_AUTH_TOKEN,
    },
    config: config.files,
    log: true,
  };
  return dcOptions;
}

export async function up() {
  if (!config.skipPull) {
    await dc.pullAll(dcOptions);
  }

  if (!config.skipBuild) {
    await dc.buildAll(dcOptions);
  }

  await dc.upAll({ ...dcOptions, commandOptions: ['--no-start'] });

  for (const stage of config.stages) {
    console.log(`Starting stage: ${stage.name}`);
    await dc.restartMany(stage.services.map(s=> s.name), dcOptions);

    console.log(`Waiting for services to be ready: ${stage.services.map(s => s.name).join(',')}`);
    await waitOn({
      resources: buildResources(stage.services),
      timeout: stage.timeout ?? config.timeout,
      interval: stage.interval ?? config.interval,
      simultaneous: 1,
    });
    console.log('Stage completed.');
  }
}

export async function down() {
  const services = config.stages.flatMap(s => s.services).filter(s => s.logs).map(s => s.name);
  if (services.length > 0) {
    await dc.logs(services, dcOptions);
  }
  await dc.down(dcOptions);

  console.log('Waiting for all services to tear down...');
  await waitOn({
    resources: buildResources(config.stages.flatMap(s => s.services)),
    timeout: config.timeout,
    interval: config.interval,
    simultaneous: 1,
    reverse: true,
  });
  console.log('All the services are down.');
}

function buildResources(services: Service[]) {
  return services.map(s => {
    if (typeof s.check === 'string') return s.check;
    const check = s.check as Check;
    const host = check.host ?? 'localhost';
    const port = check.port ?? (check.protocol.startsWith('https') ? 443 : 80);
    const protocol = check.protocol === 'tcp' ? `${check.protocol}:` : `${check.protocol}://`;
    const path = check.path ?? '';
    return `${protocol}${host}:${port}${path}`;
  });
}
