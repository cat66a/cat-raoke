// Based on https://github.com/radiovisual/convert-seconds, license: https://github.com/radiovisual/convert-seconds/blob/master/LICENSE

export interface ConvertedSeconds {
  hours: number;
  minutes: number;
  seconds: number;
}

export function convertSeconds(seconds: number): ConvertedSeconds {
  if (isNaN(seconds)) {
    throw new TypeError("Value is not a number");
  }

  const results: ConvertedSeconds = {
    hours: Math.floor(seconds / 60 / 60),
    minutes: Math.floor((seconds / 60) % 60),
    seconds: Math.floor(seconds % 60),
  };

  return results;
}
