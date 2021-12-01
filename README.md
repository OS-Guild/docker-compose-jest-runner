# docker-compose-jest-runner

This package allows to run tests that use `docker-compose` and supports multi-stage setup.

## How it works?

This runner creates docker-compose services in stopped state and then starts them accordingly to the stages. It will start the new stage only when all the services on current one will be running. When all the stages are done the actual Jest tests will be run. After the tests will be completed the services will be teared down.

## Setup

1. Run `npm install --save-dev docker-compose-jest-runner`
2. Add `dc-jest-runner.yml` to the root repo or use `DC_JEST_RUNNER_CONFIG` environment variable for path to the config file.
3. Add `runner`: `docker-compose-jest-runner` to `jest.config.js` file.

That's all

## Configuration

```yaml
  files: string | string[] (optional, default 'docker-compose.yaml') # docker-compose yaml files
  skipPull: boolean (optional, default false) # skips pulling docker images
  skipBuild: boolean (optional, default false) # skips building docker images
  timeout: number (optional, default Infinity) # maximum time in ms to wait for service on each stage
  interval: number (optional, default 250) # interval to check service in ms
  stages:
    - name: string
      services:
        - name: string # should be exactly as in docker-compose files
          timeout: number (optional, defaults to stage's value)
          interval: number (optional, defaults to stage's value)
          logs: boolean (optional, default false) # if "true" prints the container logs after tests execution
          check: string or object # based on `wait-on` npm package
            protocol: tcp | http | https | http-get | https-get
            port: number (optional, default 80 for http and 443 for https)
            path: string
```

Look [here](https://github.com/jeffbski/wait-on#usage) for more details regarding service check definition.

## Example

  ```yaml
  files:
    - ./tests/docker-compose.yml
  timeout: 2000
  interval: 100
  stages:
    - name: Infra
      services:
        - name: mongo
          check: 'tcp:localhost:27017'
    - name: Service
      services:
        - name: api
          logs: true
          check:
            port: 3000
            protocol: http-get
            path: /posts

  ```

## Contributing

### Requirements

1. [Docker](https://www.docker.com/)

2. [NodeJS](https://nodejs.org/en/)

### Getting started

1. Clone the repo:

      ```sh
      git clone git@github.com:AleF83/docker-compose-jest-runner.git
      ```

2. Install `npm` packages:

    ```sh
    npm ci
    ```

3. Build the project:

    ```sh
    npm run build
    ```

4. Run tests:

    ```sh
    npm run test
    ```
