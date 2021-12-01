import { CheckPrimeOptions } from "crypto";

export type Check = {
  protocol?: 'tcp' | 'http' | 'http-get' | 'https' | 'https-get';
  host?: string;
  port?: number;
  path?: string;
}

export type Service = {
  name: string;
  check: string | CheckPrimeOptions;
  logs?: boolean;
}

export type Stage = {
  name: string;
  services: Service[];
  timeout?: number;
  interval?: number;
}

export type Config = {
  skipPull?: boolean;
  skipBuild?: boolean;
  files: string[],
  stages: Stage[];
  timeout?: number;
  interval?: number;
};
