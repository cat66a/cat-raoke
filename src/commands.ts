import { IBaseSlashCommand } from "./ISlashCommand";
import { readdirSync } from "fs";

export let commands = new Map<string, IBaseSlashCommand>();
export let commandPropertiesArray = () => {
  const commandArray = Array.from(commands.values());

  return commandArray.map((command) => command.properties);
};

export async function loadCommands() {
  const files = readdirSync("./built/commands/");

  files.forEach((fileName) => {
    if (fileName.endsWith(".js.map")) return;

    let commandName = fileName.replace(".js", "");

    const command: IBaseSlashCommand =
      require(`./commands/${commandName}`).command;

    // In case the file name and the object properties.name property don't match
    commandName = command.properties.name;

    commands.set(commandName, command);
  });
}
