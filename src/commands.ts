import { BaseSlashCommand } from "./slashCommand.js";
import { readdirSync } from "fs";

export let commands = new Map<string, BaseSlashCommand>();
export let commandPropertiesArray = () => {
  return Array.from(commands.values());
};

export async function loadCommands() {
  const files = readdirSync("./built/commands/");

  await Promise.all(files.map(async (fileName) => {
    if (fileName.endsWith(".js.map")) return;

    const command: BaseSlashCommand =
      (await import(`./commands/${fileName}`)).command;

    // In case the file name and the object's properties.name property don't match
    let commandName = command.properties.name;

    commands.set(commandName, command);
  }));

  console.log(Array.from(commands.keys()).join(" - "));
}
