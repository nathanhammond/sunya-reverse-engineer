import { MANUAL_CODES, SYSTEM_SOURCES, LITTLE_ENDIAN, BIG_ENDIAN } from './constants';
import { mp3FromBuffer } from './mp3';

const decoder = new TextDecoder("utf-8");

const SYSTEM_CODE_DECRIPTIONS = {
  52001: "Language Switch: English",
  52002: "Language Switch: Cantonese?",
  52003: "Language Switch: Mandarin",
  52006: "Exit",
  52007: "Volume Up (Xylophone Ding)",
  52008: "Volume Down (Xylophone Ding)",
  52026: "Start Recording",
  52027: "Recording Finished",
  52030: "Let's Listen to the Music",
  52033: "Unknown (Marimba Ding)",
  52046: "粵語朗讀故事",
  52100: "Spelling Game Instructions for letters at bottom of page",
  52101: "Spelling Game Instructions for letter cards",
  52102: "Dictionary, please choose your language",
  68000: "Greeting",
  68001: "Goodbye",
  68002: "Low Power Notification",
  68006: "Idle Reminder",
  68007: "Book Select Instruction",
  68008: "Memory Full",
  68009: "No Music, please download files",
  68010: "No Audio found, please download files",
  68011: "No Recordings",
  68031: "Instructions For Recording",
  68040: "Child Protective Lock On",
  68041: "Maximum Volume Reached",
  68042: "Child Protective Lock Off",
  68084: "Please Unlock",
  68085: "Twinkle 1",
  68086: "Language Name",
  68087: "Twinkle 1",
  68088: "DIY Recording Start (Digital Ding)",
  68089: "DIY Recording Finished (Marimba Ding)",
  68090: "Silent",
};

export async function read(event) {
  let file = event.target.files[0];

  return file.arrayBuffer().then(async content => {
    let reader = new DataView(content);
    let bodyStart = 0x118;

    let editor = decoder.decode(content.slice(0, 32));
    let bookId = reader.getUint16(0x7C, LITTLE_ENDIAN);

    // TODO: Figure out what's going on for 5654 and 5664
    // This value is 61 for both of them.
    // let unknown = reader.getUint16(0x7E, LITTLE_ENDIAN);

    let bookName = file.name.replace(/\.tid$/, '');

    let fileSizeOffBy2000 = reader.getUint32(0x84, BIG_ENDIAN)
    let fileSize = fileSizeOffBy2000 + 2000;
    let codeStartId = reader.getUint32(0x114, LITTLE_ENDIAN)
    let arrayLength = reader.getUint32(0x110, LITTLE_ENDIAN)

    // WARN: Possible that some future version doesn't keep this consistent.
    let languageCount = reader.getUint8(bodyStart + 1);
    let languages = [];

    // TODO: Read the bonus data for 49000
    // let unknown = reader.getUint32(0x80, BIG_ENDIAN)

    let codeLookup = {};

    let codes = [];
    let bookCode = {};
    let systemCodes = [];

    for (let i = 0; i < arrayLength; i++) {
      let offset = i * 7;
      let code = codeStartId + i;
      if (
        reader.getUint8(bodyStart + offset) == 0x01 &&
        reader.getUint8(bodyStart + offset + 1) == languageCount &&
        reader.getUint8(bodyStart + offset + 2) == 0x00
      ) {
        codeLookup[code] = reader.getUint32(bodyStart + offset + 3);
      }
    }

    let mp3s = {};
    let uuid = 0;

    for (let code in codeLookup) {
      let lookupAddress = codeLookup[code];
      if (!lookupAddress) { continue; }

      let languages = [];
      for (let languageIndex = 0; languageIndex < languageCount; languageIndex++) {
        let offset = 8 * languageIndex;
        languages.push({
          start: reader.getUint32(lookupAddress + offset),
          length: reader.getUint32(lookupAddress + offset + 4),
        });
      }

      let codeMp3s = await Promise.all(languages.map(({ start, length }) => mp3FromBuffer(content.slice(start, start + length))));
      let singleMp3 = codeMp3s.every(mp3 => mp3.hash === codeMp3s[0].hash);

      codeMp3s.forEach((mp3, languageIndex) => {
        const existing = mp3s[mp3.hash];
        if (existing && existing.languageIndex !== languageIndex) {
          existing.languageIndex = NaN;
        } else {
          mp3.languageIndex = languageIndex;
          mp3s[mp3.hash] = mp3;
        }
      });

      code = parseInt(code, 10);

      // Regular codes.
      if (code < 49000) {
        codes.push({
          uuid: uuid++,
          id: code,
          description: '',
          singleMp3,
          mp3s: codeMp3s.map(mp3 => mp3.hash),
        });
        continue;
      }

      // Book code.
      if (code === bookId) {
        bookCode = {
          uuid: uuid++,
          id: code,
          description: bookName,
          singleMp3,
          mp3s: codeMp3s.map(mp3 => mp3.hash),
        };
        continue;
      }

      // System codes.
      if (code > bookId) {
        systemCodes.push({
          uuid: uuid++,
          id: code,
          description: SYSTEM_CODE_DECRIPTIONS[code],
          singleMp3,
          mp3s: codeMp3s.map(mp3 => mp3.hash),
        });
        continue;
      }
    }

    let output = {
      header: {
        editor,
        bookName,
        bookId,
        codeStartId,
        arrayLength,
        languageCount,
        languages,
        fileSizeOffBy2000,
        fileSize,
        codeStrategy: MANUAL_CODES
      },
      mp3s,
      codes,
      bookCode,
      systemSource: SYSTEM_SOURCES.CUSTOM,
      systemCodes,
    };

    return output;
  });
}
