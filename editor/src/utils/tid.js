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

  return event.target.files[0].arrayBuffer().then(async content => {
    let reader = new DataView(content);

    let editor = decoder.decode(content.slice(0, 32));
    let seriesId = 49000;
    let bookId = reader.getUint32(0x7C, LITTLE_ENDIAN) - seriesId;
    let bookName = file.name.replace(/\.tid$/, '');

    let fileSizeOffBy2000 = reader.getUint32(0x84, BIG_ENDIAN)
    let fileSize = fileSizeOffBy2000 + 2000;
    let codeStartId = reader.getUint32(0x114, LITTLE_ENDIAN)
    let arrayLength = reader.getUint32(0x110, LITTLE_ENDIAN)

    // TODO: Read the bonus data for 49000
    // let unknown = reader.getUint32(0x80, BIG_ENDIAN)

    let codeLookup = {};

    let codes = [];
    let bookCode = {};
    let systemCodes = [];

    let bodyStart = 0x118;
    for (let i = 0; i < arrayLength; i++) {
      let offset = i * 7;
      let code = codeStartId + i;
      if (
        reader.getUint8(bodyStart + offset) == 0x01 &&
        reader.getUint8(bodyStart + offset + 1) == 0x03 &&
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

      let cantoneseStart = reader.getUint32(lookupAddress + 0);
      let cantoneseLength = reader.getUint32(lookupAddress + 4);
      let englishStart = reader.getUint32(lookupAddress + 8);
      let englishLength = reader.getUint32(lookupAddress + 12);
      let mandarinStart = reader.getUint32(lookupAddress + 16);
      let mandarinLength = reader.getUint32(lookupAddress + 20);

      let [cantoneseMp3, englishMp3, mandarinMp3] = await Promise.all([
        mp3FromBuffer(content.slice(cantoneseStart, cantoneseStart + cantoneseLength)),
        mp3FromBuffer(content.slice(englishStart, englishStart + englishLength)),
        mp3FromBuffer(content.slice(mandarinStart, mandarinStart + mandarinLength))
      ]);

      mp3s[cantoneseMp3.hash] = cantoneseMp3;
      mp3s[englishMp3.hash] = englishMp3;
      mp3s[mandarinMp3.hash] = mandarinMp3;

      let singleMp3 = !!(parseInt(cantoneseMp3.hash, 16) | parseInt(englishMp3.hash, 16) | parseInt(mandarinMp3.hash, 16) === parseInt(cantoneseMp3.hash, 16));

      mp3s[cantoneseMp3.hash] = cantoneseMp3;
      mp3s[englishMp3.hash] = englishMp3;
      mp3s[mandarinMp3.hash] = mandarinMp3;

      if (!singleMp3) {
        cantoneseMp3.language = "cantonese";
        englishMp3.language = "english";
        mandarinMp3.language = "mandarin";
      }

      code = parseInt(code, 10);

      // Regular codes.
      if (code < 49000) {
        codes.push({
          uuid: uuid++,
          id: code,
          description: '',
          singleMp3,
          cantonese: cantoneseMp3.hash,
          english: singleMp3 ? cantoneseMp3.hash : englishMp3.hash,
          mandarin: singleMp3 ? cantoneseMp3.hash : mandarinMp3.hash,
        });
        continue;
      }

      // Book code.
      if (code === seriesId + bookId) {
        bookCode = {
          uuid: uuid++,
          id: code,
          description: bookName,
          singleMp3,
          cantonese: cantoneseMp3.hash,
          english: singleMp3 ? cantoneseMp3.hash : englishMp3.hash,
          mandarin: singleMp3 ? cantoneseMp3.hash : mandarinMp3.hash,
        };
        continue;
      }

      // System codes.
      if (code > seriesId + bookId) {
        systemCodes.push({
          uuid: uuid++,
          id: code,
          description: SYSTEM_CODE_DECRIPTIONS[code],
          singleMp3,
          cantonese: cantoneseMp3.hash,
          english: singleMp3 ? cantoneseMp3.hash : englishMp3.hash,
          mandarin: singleMp3 ? cantoneseMp3.hash : mandarinMp3.hash,
        });
        continue;
      }
    }

    let output = {
      header: {
        editor,
        seriesId,
        bookName,
        bookId,
        codeStartId,
        arrayLength,
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
