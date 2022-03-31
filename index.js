import { init } from "./built/init.js";
import { handleCLIFlags } from "./built/CLI.js";

handleCLIFlags();

await init();
console.log("World invasion started")