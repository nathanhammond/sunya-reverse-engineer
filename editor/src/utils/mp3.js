import { calculateHash, uint8ToHex } from './buffer';

const mpegVersionMask = 0b0000_0000_0001_1000_0000_0000_0000_0000; // 21,2
const layerMask = 0b0000_0000_0000_0110_0000_0000_0000_0000; // 19,2
const bitrateMask = 0b0000_0000_0000_0000_1111_0000_0000_0000; // 16,4
const samplingRateMask = 0b0000_0000_0000_0000_0000_1100_0000_0000; // 12,2
const paddingMask = 0b0000_0000_0000_0000_0000_0010_0000_0000; // 10,1
const channelModeMask = 0b0000_0000_0000_0000_0000_0000_1100_0000; // 8,2

const V1 = "MPEG Version 1";
const V2 = "MPEG Version 2";
const V25 = "MPEG Version 2.5";

const MPEG_VERSION = {
  "00": V25,
  "01": null,
  "10": V2,
  "11": V1,
};

const L1 = "Layer 1"
const L2 = "Layer 2"
const L3 = "Layer 3"

const LAYER_DESCRIPTION = {
  "00": null,
  "01": L3,
  "10": L2,
  "11": L1,
};

const BITRATE_LOOKUP = {
  "0000": { [V1]: { [L1]: "free", [L2]: "free", [L3]: "free"}, [V2]: { [L1]: "free", [L2]: "free", [L3]: "free" } },
  "0001": { [V1]: { [L1]: 32, [L2]: 32, [L3]: 32}, [V2]: { [L1]: 32, [L2]: 8, [L3]: 8 } },
  "0010": { [V1]: { [L1]: 64, [L2]: 48, [L3]: 40}, [V2]: { [L1]: 48, [L2]: 16, [L3]: 16 } },
  "0011": { [V1]: { [L1]: 96, [L2]: 56, [L3]: 48}, [V2]: { [L1]: 56, [L2]: 24, [L3]: 24 } },
  "0100": { [V1]: { [L1]: 128, [L2]: 64, [L3]: 56}, [V2]: { [L1]: 64, [L2]: 32, [L3]: 32 } },
  "0101": { [V1]: { [L1]: 160, [L2]: 80, [L3]: 64}, [V2]: { [L1]: 80, [L2]: 40, [L3]: 40 } },
  "0110": { [V1]: { [L1]: 192, [L2]: 96, [L3]: 80}, [V2]: { [L1]: 96, [L2]: 48, [L3]: 48 } },
  "0111": { [V1]: { [L1]: 224, [L2]: 112, [L3]: 96}, [V2]: { [L1]: 112, [L2]: 56, [L3]: 56 } },
  "1000": { [V1]: { [L1]: 256, [L2]: 128, [L3]: 112}, [V2]: { [L1]: 128, [L2]: 64, [L3]: 64 } },
  "1001": { [V1]: { [L1]: 288, [L2]: 160, [L3]: 128}, [V2]: { [L1]: 144, [L2]: 80, [L3]: 80 } },
  "1010": { [V1]: { [L1]: 320, [L2]: 192, [L3]: 160}, [V2]: { [L1]: 160, [L2]: 96, [L3]: 96 } },
  "1011": { [V1]: { [L1]: 352, [L2]: 224, [L3]: 192}, [V2]: { [L1]: 176, [L2]: 112, [L3]: 112 } },
  "1100": { [V1]: { [L1]: 384, [L2]: 256, [L3]: 224}, [V2]: { [L1]: 192, [L2]: 128, [L3]: 128 } },
  "1101": { [V1]: { [L1]: 416, [L2]: 320, [L3]: 256}, [V2]: { [L1]: 224, [L2]: 144, [L3]: 144 } },
  "1110": { [V1]: { [L1]: 448, [L2]: 384, [L3]: 320}, [V2]: { [L1]: 256, [L2]: 160, [L3]: 160 } },
  "1111": { [V1]: { [L1]: "bad", [L2]: "bad", [L3]: "bad"}, [V2]: { [L1]: "bad", [L2]: "bad", [L3]: "bad" } },
};

const SAMPLING_RATE_LOOKUP = {
  "00": { [V1]: 44100, [V2]: 22050,	[V25]: 11025 },
  "01": { [V1]: 48000, [V2]: 24000,	[V25]: 12000 },
  "10": { [V1]: 32000, [V2]: 16000,	[V25]: 8000 },
  "11": { [V1]: null, [V2]: null,	[V25]: null },
};

const SAMPLES_PER_FRAME_LOOKUP = {
  [V1]: { [L1]: 384, [L2]: 1152, [L3]: 1152 },
  [V2]: { [L1]: 384, [L2]: 1152, [L3]: 576 }
};

const CHANNEL_MODE = {
  "00": "Stereo",
  "01": "Joint Stereo",
  "10": "Dual channel",
  "11": "Single channel",
}

const SLOT_SIZE = {
  [L1]: 4,
  [L2]: 1,
  [L3]: 1,
};

export function parseMp3(buffer) {
  // TODO: Make this friendlier by returning an actual error message.
  let scanner = new Uint8Array(buffer);

  let start = 0;
  let mpegVersion;
  let layer;
  let bitrate;
  let samplingRate;
  let channelMode;

  while (start < scanner.length) {
    // ID3
    let id3Header = uint8ToHex(scanner.slice(start, start + 10));
    if (id3Header.startsWith("494433")) {
      let sizeField = scanner.slice(start + 6, start + 10)
      let sizeStrings = [];
      sizeField.forEach((byte, index) => {
        sizeStrings[index] = byte.toString(2).padStart(7, 0);
      });
      let size = parseInt(sizeStrings.join(''), 2);
      start += size + 10;
      continue;
    }

    // TAG+
    let tagPlusHeader = uint8ToHex(scanner.slice(start, start + 4));
    if (tagPlusHeader.startsWith("5441472B")) {
      start += 227;
      continue;
    }

    // TAG
    let tagHeader = uint8ToHex(scanner.slice(start, start + 3));
    if (tagHeader.startsWith("544147")) {
      start += 128;
      continue;
    }

    let frameHeader = uint8ToHex(scanner.slice(start, start + 4));
    let headerInt = parseInt(frameHeader, 16);

    mpegVersion = MPEG_VERSION[(headerInt & mpegVersionMask).toString(2).padStart(21, "0").substring(0, 2)];
    layer = LAYER_DESCRIPTION[(headerInt & layerMask).toString(2).padStart(19, "0").substring(0, 2)];
    bitrate = BITRATE_LOOKUP[(headerInt & bitrateMask).toString(2).padStart(16, "0").substring(0, 4)][mpegVersion][layer];
    samplingRate = SAMPLING_RATE_LOOKUP[(headerInt & samplingRateMask).toString(2).padStart(12, "0").substring(0, 2)][mpegVersion];
    let samplesPerFrame = SAMPLES_PER_FRAME_LOOKUP[mpegVersion][layer];
    let padding = !!(headerInt & paddingMask);
    channelMode = CHANNEL_MODE[(headerInt & channelModeMask).toString(2).padStart(8, "0").substring(0, 2)];

    let frameLengthInBytes = Math.floor((samplesPerFrame / 8) * ((bitrate * 1000) / samplingRate) + (padding ? SLOT_SIZE[layer] : 0));
    start += frameLengthInBytes;

    // TODO: error handling.
  }

  return {
    mpegVersion,
    layer,
    bitrate,
    samplingRate,
    channelMode
  };
}

export async function mp3FromBuffer(buffer) {
  let details = parseMp3(buffer);
  if (!details) {
    console.log("invalid mp3");
    return;
  }

  let fileHash = await calculateHash(buffer);
  return {
    hash: fileHash,
    size: buffer.byteLength,
    objectURL: URL.createObjectURL(new Blob([buffer])),
    ...details
  };
}
