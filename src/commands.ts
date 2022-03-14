import { BaseSlashCommand } from "./slashCommand.js";
import { readdirSync } from "fs";

export let commands = new Map<string, BaseSlashCommand>();
export let commandPropertiesArray = () => {
  const commandArray = Array.from(commands.values());

  return commandArray.map(
    ({ properties: APIProperties, permissions, admin, global }) => {
      return {
        APIProperties,
        permissions,
        admin,
        global,
      };
    },
  );
};

export async function loadCommands() {
  const files = readdirSync("./built/commands/");

  Promise.all(files.map(async (fileName) => {
    if (fileName.endsWith(".js.map")) return;

    let commandName = fileName.replace(".js", "");

    const command: BaseSlashCommand =
      (await import(`./commands/${fileName}`)).command;

    // In case the file name and the object properties.name property don't match
    commandName = command.properties.name;

    commands.set(commandName, command);
  }));
}
