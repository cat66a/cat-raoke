// based on https://github.com/Vendicated/pfp.lgbt-wrapper, license: https://github.com/Vendicated/pfp.lgbt-wrapper/blob/master/LICENSE

import FormData from "form-data";
import fetch, { RequestInfo, RequestInit } from "node-fetch";

export const baseUrl = "https://api.pfp.lgbt/v5/";

// @ts-ignore
async function _fetch(
  url: RequestInfo,
  init?: RequestInit,
  type?: "json",
): Promise<Object>;
async function _fetch(
  url: RequestInfo,
  init?: RequestInit,
  type?: "img",
): Promise<ArrayBuffer>;
async function _fetch(
  url: RequestInfo,
  init?: RequestInit,
  type: "img" | "json" = "json",
) {
  const res = await fetch(url, init);

  if (res.status > 299 || res.status < 200) {
    throw `${res.status}: ${res.statusText}`;
  }

  if (type === "img") return await res.arrayBuffer();
  else if (type === "json") return await res.json();
  else throw `${type} is not a valid mime type`;
}

function _fetchImage(url: string, buf: Buffer, alpha?: number) {
  const data = new FormData();
  data.append("file", buf, "image.png");
  if (alpha) data.append("alpha", alpha);

  return _fetch(
    url,
    {
      method: "POST",
      body: data,
      headers: { ...data.getHeaders() },
    },
    "img",
  );
}

function _urlToBuf(url: string) {
  return fetch(url)
    .then((res) => res.buffer())
    .catch(() => null);
}
/**
 * Get an object containing all valid flags and their defaults
 * @returns `Promise<FlagResponse>`
 */
export function getFlags(): Promise<FlagResponse> {
  return _fetch(baseUrl + "flags", {}, "json") as Promise<
    FlagResponse
  >;
}

/**
 * Get an object containing all valid flags and their defaults
 * @returns `Promise<string[]>`
 */
export async function getFlagNames(): Promise<string[]> {
  const flags = await _fetch(baseUrl + "flags", {}, "json") as Promise<
    FlagResponse
  >;

  return Object.keys(flags);
}

/**
 * Get an image of the provided flag
 * @param flag The target flag. You can get a list of all flags with the `getFlags()` method
 * @returns `Promise<Buffer>`
 */
export function getFlag(flag: string = "pride") {
  return _fetch(getFlagUrl(flag), {}, "img");
}

/**
 * Get an image of the provided flag
 * @param flag The target flag. You can get a list of all flags with the `getFlags()` method
 * @returns `Promise<Buffer>`
 */
export function getFlagUrl(flag: string = "pride") {
  return baseUrl + "icon/" + flag;
}

/**
 * Create a static lgbtifed image
 * @param image Buffer/Url of the image to lgbtify
 * @param flag The Pride flag to add
 * @param type The effect type
 * @param style The effect style
 * @param format The format of the resulting image
 * @param alpha The alpha the effect will have
 * @returns `Promise<Buffer>`
 */
export async function createStatic(
  image: Buffer | string,
  flag: string,
  type: "circle" | "overlay" | "square" | "background" = "circle",
  style: "solid" | "gradient" = "solid",
  format: "jpg" | "png" = "png",
  alpha?: number,
) {
  const url = `${baseUrl}image/static/${type}/${style}/${flag}.${format}`;
  if (!(image instanceof Buffer)) {
    image = (await _urlToBuf(image)) as Buffer;
  }
  if (!image) throw new Error("Invalid image provided");

  return _fetchImage(url, image, alpha);
}

/**
 * Create an animated lgbtifed image
 * @param image Buffer/Url of the image to lgbtify
 * @param flag The Pride flag to add
 * @param type The effect type
 * @param alpha The alpha the effect will have
 * @returns `Promise<Buffer>`
 */
export async function createAnimated(
  image: Buffer | string,
  flag: string,
  type: "circle" | "square" = "circle",
  alpha?: number,
) {
  const url = `${baseUrl}image/animated/${type}/${flag}`;

  if (!(image instanceof Buffer)) {
    image = (await _urlToBuf(image)) as Buffer;
  }
  if (!image) throw new Error("Invalid image provided");

  return _fetchImage(url, image, alpha);
}

type FlagResponse = {
  [key: string]: { defaultAlpha: number; tooltip: string };
};
