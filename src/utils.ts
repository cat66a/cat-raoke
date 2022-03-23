// This function cleans up and prepares the
// result of our eval command input for sending

import { botToken } from "./loadedConfig.js";

// to the channel
export const clean = async (text: any): Promise<string> => {
  // If our input is a promise, await it before continuing
  if (text && text.constructor.name == "Promise") {
    text = await text;
  }

  // If the response isn't a string, `util.inspect()`
  // is used to 'stringify' the code in a safe way that
  // won't error out on objects with circular references
  // (like Collections, for example)
  if (typeof text !== "string") {
    text = (await import("util")).inspect(text, { depth: 1 });
  }

  // Replace symbols with character code alternatives
  text = (text as string)
    .replace(/`/g, "`" + String.fromCharCode(8203))
    .replace(/@/g, "@" + String.fromCharCode(8203))
    .replaceAll(botToken, "[CENSORED BOT TOKEN]");

  // Send off the cleaned up result
  return text;
};

export type UnknownObject = {
  [key: string]: any;
};
