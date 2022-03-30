import { setDebugMode } from "./loadedConfig.js";

const args = process.argv.slice(2);

export function handleCLIFlags(): void {
  if (args.length === 0) {
    return;
  }
  if (args.includes("--debug") || args.includes("-D")) {
    setDebugMode(true);
    return;
  }

  throw "Unrecognized flag(s)";
}
