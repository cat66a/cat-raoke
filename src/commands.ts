import { BaseSlashCommand } from "./slashCommand";
import { readdirSync } from "fs";

export let commands = new Map<string, BaseSlashCommand>();
export let commandPropertiesArray = () => {
  const commandArray = Array.from(commands.values());

  return commandArray.map((command) => command.properties);
};

export async function loadCommands() {
  const files = readdirSync("./built/commands/");

  console.log(files);
  files.forEach((fileName) => {
    if (fileName.endsWith(".js.map")) return;

    let commandName = fileName.replace(".js", "");

    const command: BaseSlashCommand =
      require(`./commands/${commandName}`).command;

    // In case the file name and the object properties.name property don't match
    commandName = command.properties.name;

    commands.set(commandName, command);
  });
}
