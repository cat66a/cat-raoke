import { getInfo, videoInfo } from "ytdl-core";
import {
  AudioResource,
  createAudioResource,
  demuxProbe,
} from "@discordjs/voice";
import { raw as ytdl } from "youtube-dl-exec";
import { searchVideos } from "./youtube";

/**
 * This is the data required to create a Track object.
 */
export interface TrackData {
  url: string;
  title: string;
}

export interface TrackEvents {
  onStart: () => void;
  onFinish: () => void;
  onError: (error: Error) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

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
  public readonly onStart: () => void;
  public readonly onFinish: () => void;
  public readonly onError: (error: Error) => void;

  private constructor(
    { onStart, onFinish, onError }: TrackEvents,
    data: TrackData,
  ) {
    this.data = data;
    this.onStart = Object.bind(onStart, this);
    this.onFinish = Object.bind(onFinish, this);
    this.onError = Object.bind(onError, this);
  }

  /**
   * Creates an AudioResource from this Track.
   */
  public async createAudioResource(): Promise<AudioResource<Track>> {
    return new Promise((resolve, reject) => {
      const process = ytdl(
        this.data.url,
        {
          // @ts-ignore
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
      const onError = (error: Error) => {
        if (!process.killed) process.kill();
        stream.resume();
        reject(error);
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
    methods: Pick<Track, "onStart" | "onFinish" | "onError">,
  ): Promise<Track> {
    let info: videoInfo;
    let url: string;

    try {
      url = query;
      info = await getInfo(url);
    } catch (error) {
      if (((error.message) as string).includes("No video id found")) {
        const searchResults = await searchVideos(query, 1);
        const videoId = searchResults.items[0].id.videoId;
        url = `https://www.youtube.com/watch?v=${videoId}`;

        info = await getInfo(url);
      } else {
        throw error;
      }
    }

    // The methods are wrapped so that we can ensure that they are only called once.
    const wrappedMethods = {
      onStart() {
        wrappedMethods.onStart = noop;
        methods.onStart();
      },
      onFinish() {
        wrappedMethods.onFinish = noop;
        methods.onFinish();
      },
      onError(error: Error) {
        wrappedMethods.onError = noop;
        methods.onError(error);
      },
    };

    return new Track(
      wrappedMethods,
      {
        title: info.videoDetails.title,
        url,
      },
    );
  }
}
