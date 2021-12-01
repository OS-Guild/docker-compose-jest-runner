import TestRunner, {
  OnTestFailure,
  OnTestStart,
  OnTestSuccess,
  Test,
  TestRunnerContext,
  TestRunnerOptions,
  TestWatcher,
} from "jest-runner";
import { Config } from "@jest/types";

import {init, up, down} from './stages';
export default class DockerComposeJestRunner extends TestRunner {
  constructor(globalConfig: Config.GlobalConfig, context?: TestRunnerContext) {
    super(globalConfig, context);
  }

  async runTests(
    tests: Array<Test>,
    watcher: TestWatcher,
    onStart: OnTestStart | undefined,
    onResult: OnTestSuccess | undefined,
    onFailure: OnTestFailure | undefined,
    options: TestRunnerOptions
  ) {
    await init();
    await up();

    super.runTests(tests, watcher, onStart, onResult, onFailure, options);

    await down();
  }
}
