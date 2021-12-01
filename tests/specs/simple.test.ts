import { execSync } from "child_process";

describe("Simple test", () => {
  test("should work", async () => {
    const result = execSync('docker ps --format "{{.Image}}: {{.State}}" | sort', { encoding: "utf8" }).trim();
    expect(result).toMatchSnapshot();
  });
});
