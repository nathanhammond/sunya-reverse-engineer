import { LITTLE_ENDIAN, BIG_ENDIAN } from './constants';
// import { uint8ToHex } from './buffer';
const encoder = new TextEncoder("utf-8");
const zip = (a, b) => a.map((k, i) => [k, b[i]]);
var saveData = function (blob, fileName) {
  var a = document.createElement("a");
  a.style = "display: none";
  document.body.appendChild(a);
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export function write(state) {
  let headerSize = 0x118;
  let header = new ArrayBuffer(headerSize);

  // Need different tools for writing into the same buffer.
  let headerDataView = new DataView(header);
  let headerUint8Array = new Uint8Array(header)

  // Source data
  let editorBinary = encoder.encode(state.header.editor);

  // 0x00
  headerUint8Array.set(editorBinary, 0);

  // 0x7C
  headerDataView.setUint16(0x7C, state.header.bookId, LITTLE_ENDIAN)

  // // 0x84: file size in bytes
  // let fileSize = 0;
  // fileSize += headerSize;

  // // Code to lookup.
  // fileSize += state.header.arrayLength * 7;

  // // Total codes:
  // let totalCodes = state.codes.length + !!state.bookCode + state.systemCodes.length;
  // fileSize += state.header.languageCount * 8 * totalCodes;

  // let mp3Size = Object.values(state.mp3s).reduce((sum, mp3) => sum + mp3.size, 0);
  // fileSize += mp3Size;

  // fileSize += 395216;

  // headerDataView.setUint32(0x84, fileSize, BIG_ENDIAN);

  // 0x110: Array length
  headerDataView.setUint32(0x110, state.header.arrayLength, LITTLE_ENDIAN)

  // 0x114: Starting OID
  headerDataView.setUint32(0x114, state.header.codeStartId, LITTLE_ENDIAN)

  // Resolved Codes
  let allCodes = [state.bookCode, ...state.codes, ...state.systemCodes];
  let firstOIDCode = state.header.codeStartId
  let lastOIDCode = state.header.codeStartId + state.header.arrayLength - 1;
  let codeIdLookup = allCodes.reduce((lookup, code) => {
    if (code.id >= firstOIDCode && code.id <= lastOIDCode) {
      lookup[code.id] = code;
    }
    return lookup;
  }, {});

  const resolvedCodes = Object.values(codeIdLookup);

  // MP3s
  const neededMp3s = new Set();
  resolvedCodes.forEach(code => {
    code.mp3s.forEach(mp3Hash => {
      neededMp3s.add(mp3Hash);
    });
  });

  // Ensure consistent ordering.
  const orderedMp3s = [...neededMp3s];
  let mp3Buffers = orderedMp3s.map(mp3Hash => state.mp3s[mp3Hash].buffer);

  // Calculate the information needed to address the mp3 relative to the block.
  let cumulativeOffset = 0;
  let mp3Details = orderedMp3s.map(mp3Hash => {
    let output = {
      start: cumulativeOffset,
      size: state.mp3s[mp3Hash].size
    };
    cumulativeOffset += state.mp3s[mp3Hash].size;
    return output;
  });

  const mp3Lookup = Object.fromEntries(zip(orderedMp3s, mp3Details));

  const mp3Section = new Blob(mp3Buffers);

  // Generate the lookup.
  let codeLookupSize = state.header.arrayLength * 7;
  let codeLookup = new ArrayBuffer(codeLookupSize);
  let codeLookupDataView = new DataView(codeLookup);
  // let codeLookupUint8Array = new Uint8Array(codeLookup);

  let languageLookupPointerLength = 8;
  let languagePointersLength = state.header.languageCount * languageLookupPointerLength;

  let mp3LookupSectionStart = headerSize + codeLookupSize;
  let languagePointerSectionStart = headerSize + codeLookupSize + mp3Section.size;

  for (let codeId = firstOIDCode; codeId <= lastOIDCode; codeId++) {
    let detailsIndex = resolvedCodes.findIndex(code => codeId === code.id);;
    let index = codeId - firstOIDCode;
    let codeLookupOffset = index * 7;
    let code = codeIdLookup[codeId];
    if (code) {
      codeLookupDataView.setUint8(codeLookupOffset, 0x01);
      codeLookupDataView.setUint8(codeLookupOffset+1, state.header.languageCount);
      codeLookupDataView.setUint8(codeLookupOffset+2, 0x00);
      codeLookupDataView.setUint32(codeLookupOffset+3, languagePointerSectionStart + languagePointersLength * detailsIndex);
    } else {
      codeLookupDataView.setUint8(codeLookupOffset, 0xFF);
      codeLookupDataView.setUint8(codeLookupOffset+1, 0xFF);
      codeLookupDataView.setUint8(codeLookupOffset+2, 0xFF);
      codeLookupDataView.setUint32(codeLookupOffset+3, 0xFFFFFFFF)
    }
  }

  let mp3PointerSection = new ArrayBuffer(languagePointersLength * resolvedCodes.length);
  let mp3PointerSectionDataView = new DataView(mp3PointerSection);
  // let mp3PointerSectionUint8Array = new Uint8Array(mp3PointerSection);
  resolvedCodes.forEach((code, codeIndex) => {
    let lookupStart = codeIndex * languagePointersLength;
    code.mp3s.forEach((mp3Hash, languageIndex) => {
      let mp3 = mp3Lookup[mp3Hash];
      let languageStart = languageIndex * languageLookupPointerLength;
      mp3PointerSectionDataView.setUint32(lookupStart + languageStart, mp3LookupSectionStart + mp3.start, BIG_ENDIAN);
      mp3PointerSectionDataView.setUint32(lookupStart + languageStart + 4, mp3.size, BIG_ENDIAN);
    });
  });

  const fileSize = headerSize + codeLookupSize + mp3Section.size + mp3PointerSection.byteLength
  headerDataView.setUint32(0x84, fileSize, BIG_ENDIAN);

  const tidFile = new Blob([header, codeLookup, mp3Section, mp3PointerSection]);
  saveData(tidFile, state.header.bookId + "-processed.tid");

  // console.log(uint8ToHex(headerUint8Array));
  // console.log(uint8ToHex(codeLookupUint8Array));
  // console.log(uint8ToHex(mp3PointerSectionUint8Array));
}
