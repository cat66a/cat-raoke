// Based on https://github.com/discordjs/voice/tree/main/examples/music-bot

import { videoInfo } from "ytdl-core";
import {
  AudioResource,
  createAudioResource,
  demuxProbe,
} from "@discordjs/voice";
import { searchVideos } from "./youtubeApiWrapper.js";

import pkg from "youtube-dl-exec";
// @ts-ignore
const { raw: ytdl } = pkg;

import ytdl_core from "ytdl-core";
import { ConvertedSeconds, convertSeconds } from "../convertSeconds.js";
import { youtube_v3 } from "googleapis";
const { getInfo } = ytdl_core;

/**
 * This is the data required to create a Track object.
 */
export interface TrackData {
  url: string;
  title: string;
  length: string;
}

export interface TrackEvents {
  onStart: () => void;
  onFinish: () => void;
  onError: (err: Error) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export function formatTrackLength(length: ConvertedSeconds): string {
  const hours = length.hours ? `${length.hours}:` : "";
  const minutes = `${
    (length.minutes < 10 && length.hours) ? "0" : ""
  }${length.minutes}`;
  const seconds = `${length.seconds < 10 ? "0" : ""}${length.seconds}`;

  return `${hours}${minutes}:${seconds}`;
}

/**
 * A Track represents information about a YouTube video (in this context) that can be added to a queue.
 * It contains the title and URL of the video, as well as functions onStart, onFinish, onError, that act
 * as callbacks that are triggered at certain points during the track's lifecycle.
 *
 * Rather than creating an AudioResource for each video immediately and then keeping those in a queue,
 * we use tracks as they don't pre-emptively load the videos. Instead, once a Track is taken from the
 * queue, it is converted into an AudioResource just in time for playback.
 */
export class Track {
  public readonly data: TrackData;

  private constructor(
    data: TrackData,
  ) {
    this.data = data;
  }

  /**
   * Creates an AudioResource from this Track.
   */
  public async createAudioResource(): Promise<AudioResource<Track>> {
    return new Promise((resolve, reject) => {
      const process = ytdl(
        this.data.url,
        {
          o: "-",
          q: "",
          f: "bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio",
          r: "100K",
        },
        { stdio: ["ignore", "pipe", "ignore"] },
      );
      if (!process.stdout) {
        reject(new Error("No stdout"));
        return;
      }
      const stream = process.stdout;
      const onError = (err: Error) => {
        if (!process.killed) process.kill();
        stream.resume();
        reject(err);
      };
      process
        .once("spawn", () => {
          demuxProbe(stream)
            .then((probe: { stream: any; type: any }) =>
              resolve(
                createAudioResource(probe.stream, {
                  metadata: this,
                  inputType: probe.type,
                }),
              )
            )
            .catch(onError);
        })
        .catch(onError);
    });
  }

  /**
   * Creates a Track from a video URL and lifecycle callback methods.
   *
   * @param query The URL of the video
   * @param methods Lifecycle callbacks
   *
   * @returns The created Track
   */
  public static async from(
    query: string,
  ): Promise<Track> {
    let info: videoInfo;
    let url: string;

    try {
      url = query;
      info = await getInfo(url);
    } catch (err) {
      if ((((err as Error).message) as string).includes("No video id found")) {
        const searchResults = await searchVideos(query, 1);
        const videoId =
          (searchResults.items as youtube_v3.Schema$SearchResult[])[0]?.id
            ?.videoId;
        url = `https://www.youtube.com/watch?v=${videoId}`;

        info = await getInfo(url);
      } else {
        throw err;
      }
    }
    const parsedTrackLength = parseInt(info.videoDetails.lengthSeconds, 10);
    const formattedTrackLength = formatTrackLength(
      convertSeconds(parsedTrackLength),
    );

    return new Track(
      {
        title: info.videoDetails.title,
        url,
        length: formattedTrackLength,
      },
    );
  }
}
