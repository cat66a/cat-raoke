import { BaseSlashCommand } from "./slashCommand.js";
import { readdirSync } from "fs";

// Where commands are cached
export let commands = new Map<string, BaseSlashCommand>();

export let commandPropertiesArray = () => {
  return Array.from(commands.values());
};

async function handleCommandFiles(filename: string) {
  if (filename.endsWith(".js.map")) return;

  const command: BaseSlashCommand =
    (await import(`./commands/${filename}`)).command;

  // In case the file name and the object's properties.name property don't match
  let commandName = command.properties.name;

  commands.set(commandName, command);
}

export async function loadCommands() {
  const files = readdirSync("./built/commands/");

  for (const filename of files) {
    try {
      await handleCommandFiles(filename);
    } catch (err) {
      console.warn(err);
    }
  }
}
