import { h, Component } from 'preact';
import Menu from '../../components/editor/menu';
import FileHeader from '../../components/editor/file-header';
import LanguageDefiner from '../../components/editor/language-definer';
import Mp3Table from '../../components/editor/mp3-table';
import CodeTable from '../../components/editor/code-table';
import SystemCodeTable from '../../components/editor/system-code-table';
import { AUTO_CODES, MANUAL_CODES, SYSTEM_SOURCES } from '../../utils/constants';
import { read } from '../../utils/tid';
import { mp3FromBuffer } from '../../utils/mp3';
import { readFile } from '../../utils/file';

import style from './style.css';

class Editor extends Component {
  state = {
    header: {
      editor: ' ZHHC GernealOIDDataLinker V2.01',
      bookName: '',
      bookId: NaN,
      codeStartId: 2000,
      arrayLength: NaN,
      languageCount: 0,
      languages: [],
      codeStrategy: AUTO_CODES
    },
    mp3s: {},
    codes: [],
    bookCode: {
      description: "Book Name",
      singleMp3: false,
      mp3s: [],
    },
    systemSource: SYSTEM_SOURCES.SUNYA,
    systemCodes: [
      {
        id: 52001,
        description: "Language Switch: English",
        singleMp3: true,
        mp3s: [],
      },
      {
        id: 52002,
        description: "Language Switch: Cantonese?",
        singleMp3: true,
        mp3s: [],
        comment: "Probably?",
      },
      {
        id: 52003,
        description: "Language Switch: Mandarin",
        singleMp3: true,
        mp3s: [],
      },
      {
        id: 52006,
        description: "Exit",
        singleMp3: false,
        mp3s: [],
        comment: "49000",
      },
      {
        id: 52007,
        description: "Volume Up (Xylophone Ding)",
        singleMp3: true,
        mp3s: [],
      },
      {
        id: 52008,
        description: "Volume Down (Xylophone Ding)",
        singleMp3: true,
        mp3s: [],
      },
      {
        id: 52026,
        description: "Start Recording",
        singleMp3: false,
        mp3s: [],
      },
      {
        id: 52027,
        description: "Recording Finished",
        singleMp3: false,
        mp3s: [],
      },
      {
        id: 52030,
        description: "Let's Listen to the Music",
        singleMp3: false,
        mp3s: [],
      },
      {
        id: 52033,
        description: "Unknown (Marimba Ding)",
        singleMp3: true,
        mp3s: [],
      },
      {
        id: 52046,
        description: "粵語朗讀故事",
        singleMp3: true,
        mp3s: [],
      },
      {
        id: 52100,
        description: "Spelling Game Instructions for letters at bottom of page",
        singleMp3: false,
        mp3s: [],
        comment: "49000",
      },
      {
        id: 52101,
        description: "Spelling Game Instructions for letter cards",
        singleMp3: false,
        mp3s: [],
        comment: "49000",
      },
      {
        id: 52102,
        description: "Dictionary, please choose your language",
        singleMp3: false,
        mp3s: [],
        comment: "49000",
      },
      {
        id: 68000,
        description: "Greeting",
        singleMp3: false,
        mp3s: [],
      },
      {
        id: 68001,
        description: "Goodbye",
        singleMp3: false,
        mp3s: [],
      },
      {
        id: 68002,
        description: "Low Power Notification",
        singleMp3: false,
        mp3s: [],
      },
      {
        id: 68006,
        description: "Idle Reminder",
        singleMp3: false,
        mp3s: [],
      },
      {
        id: 68007,
        description: "Book Select Instruction",
        singleMp3: false,
        mp3s: [],
      },
      {
        id: 68008,
        description: "Memory Full",
        singleMp3: false,
        mp3s: [],
      },
      {
        id: 68009,
        description: "No Music, please download files",
        singleMp3: false,
        mp3s: [],
      },
      {
        id: 68010,
        description: "No Audio found, please download files",
        singleMp3: false,
        mp3s: [],
      },
      {
        id: 68011,
        description: "No Recordings",
        singleMp3: false,
        mp3s: [],
      },
      {
        id: 68031,
        description: "Instructions For Recording",
        singleMp3: false,
        mp3s: [],
      },
      {
        id: 68040,
        description: "Child Protective Lock On",
        singleMp3: false,
        mp3s: [],
      },
      {
        id: 68041,
        description: "Maximum Volume Reached",
        singleMp3: false,
        mp3s: [],
      },
      {
        id: 68042,
        description: "Child Protective Lock Off",
        singleMp3: false,
        mp3s: [],
      },
      {
        id: 68084,
        description: "Please Unlock",
        singleMp3: false,
        mp3s: [],
      },
      {
        id: 68085,
        description: "Twinkle 1",
        singleMp3: true,
        mp3s: [],
        comment: "49000 Uses this sound for touching the cover.",
      },
      {
        id: 68086,
        description: "Language Name",
        singleMp3: false,
        mp3s: [],
      },
      {
        id: 68087,
        description: "Twinkle 1",
        singleMp3: true,
        mp3s: [],
        comment: "49000 Uses this sound for touching the cover.",
      },
      {
        id: 68088,
        description: "DIY Recording Start (Digital Ding)",
        singleMp3: true,
        mp3s: [],
      },
      {
        id: 68089,
        description: "DIY Recording Finished (Marimba Ding)",
        singleMp3: true,
        mp3s: [],
      },
      {
        id: 68090,
        description: "Silent",
        singleMp3: false,
        mp3s: [],
      },
    ],
  };

  constructor() {
    super();

    this.handlers = {
      menu: {},
      header: {},
      mp3: {},
      mp3Row: {},
      code: {},
      codeRow: {},
      systemCode: {},
      bookCodeRow: {},
      systemCodeRow: {},
    };

    this.handlers.menu.openTidFile = async (event) => {
      let state = await read(event);
      this.setState(state);
    }

    this.handlers.header.updateBookId = (event) => {
      this.setState((state) => {
        return {
          header: {
            ...state.header,
            bookId: event.target.valueAsNumber
          }
        }
      });
    };

    this.handlers.header.updateBookName = (event) => {
      this.setState((state) => {
        return {
          header: {
            ...state.header,
            bookName: event.target.value
          }
        }
      });
    };

    this.handlers.header.updateLanguageCount = (event) => {
      this.setState((state) => {
        return {
          header: {
            ...state.header,
            languageCount: parseInt(event.target.value, 10)
          }
        }
      });
    };

    this.handlers.header.updateLanguage = (index, event) => {
      this.setState((state) => {
        let newValue = [...state.header.languages];
        newValue[index] = event.target.value;

        return {
          header: {
            ...state.header,
            languages: newValue
          }
        }
      });
    };

    this.handlers.mp3.add = async (event) => {
      const output = { ...this.state.mp3s };
      const currentFiles = [].slice.call(event.target.files);

      // TODO: let the user know if an mp3 is invalid.
      for (let i = 0; i < currentFiles.length; i++) {
        let file = currentFiles[i];
        let fileBuffer = await readFile(file);
        let mp3 = await mp3FromBuffer(fileBuffer);

        if (!mp3) {
          continue;
        }

        let current = output[mp3.hash];
        if (current) {
          URL.revokeObjectURL(current.objectURL);
          output[mp3.hash] = {
            fileName: file.name,
            size: file.size,
            language: current.language,
            description: current.description,
            objectURL: mp3.objectURL
          };
        } else {
          output[mp3.hash] = {
            fileName: file.name,
            size: file.size,
            language: '',
            description: '',
            objectURL: mp3.objectURL
          };
        }
      }

      this.setState({
        mp3s: output
      });
    };

    this.handlers.mp3Row.updateLanguage = (event, mp3) => {
      const output = { ...this.state.mp3s };
      output[mp3.hash].languageIndex = parseInt(event.target.value);

      this.setState({
        mp3s: output
      });
    };

    this.handlers.mp3Row.updateDescription = (event, mp3) => {
      const output = { ...this.state.mp3s };
      output[mp3.hash].description = event.target.value;

      this.setState({
        mp3s: output
      });
    };

    function checkAndReplace(sourceObj, oldHash, newHash) {
      let needsUpdate = sourceObj.mp3s.some(language => language.hash === oldHash);
      if (needsUpdate) {
        let newObj = {
          ...sourceObj
        };
        newObj.mp3s.forEach((language, index) => {
          if (language === oldHash) {
            newObj.mp3s[index] = newHash;
          }
        });
        return newObj;
      }

      return sourceObj;
    }

    this.handlers.mp3Row.delete = (mp3) => {
      const output = { ...this.state.mp3s };

      let newBookCode = checkAndReplace(this.state.bookCode, mp3.hash);
      let newCodes = [...this.state.codes].map(code => checkAndReplace(code, mp3.hash))
      let newSystemCodes = [...this.state.systemCodes].map(code => checkAndReplace(code, mp3.hash))

      URL.revokeObjectURL(mp3.objectURL);
      delete output[mp3.hash];

      this.setState({
        mp3s: output,
        codes: newCodes,
        bookCode: newBookCode,
        systemCodes: newSystemCodes,
      });
    };

    this.handlers.mp3Row.replace = async (oldMp3, event) => {
      const output = { ...this.state.mp3s };

      const currentFiles = [].slice.call(event.target.files);

      let file = currentFiles[0];
      let fileBuffer = await readFile(file);
      let newMp3 = await mp3FromBuffer(fileBuffer);

      if (!newMp3) {
        alert('Error validating MP3!');
        return;
      }

      let current = output[newMp3.hash];
      if (current) {
        URL.revokeObjectURL(current.objectURL);
        output[newMp3.hash] = {
          fileName: file.name,
          size: file.size,
          language: current.language,
          description: current.description,
          objectURL: newMp3.objectURL
        };
      } else {
        output[newMp3.hash] = {
          fileName: file.name,
          size: file.size,
          language: '',
          description: '',
          objectURL: newMp3.objectURL
        };
      }

      let newBookCode = checkAndReplace(this.state.bookCode, oldMp3.hash, newMp3.hash);
      let newCodes = [...this.state.codes].map(code => checkAndReplace(code, oldMp3.hash, newMp3.hash))
      let newSystemCodes = [...this.state.systemCodes].map(code => checkAndReplace(code, oldMp3.hash, newMp3.hash))

      URL.revokeObjectURL(oldMp3.objectURL);
      delete output[oldMp3.hash];

      this.setState({
        mp3s: output,
        codes: newCodes,
        bookCode: newBookCode,
        systemCodes: newSystemCodes,
      });
    };

    this.handlers.code.updateCodeStartId = (event) => {
      this.setState((state) => {
        return {
          header: {
            ...state.header,
            codeStartId: event.target.valueAsNumber
          }
        }
      });
    };

    this.handlers.code.updateCodeStrategy = (event) => {
      this.setState((state) => {
        return {
          header: {
            ...state.header,
            codeStrategy: event.target.checked ? AUTO_CODES : MANUAL_CODES
          }
        }
      });
    };

    let uuid = 0;
    this.handlers.code.add = () => {
      let newCode = {
        uuid: uuid++,
        id: NaN,
        description: '',
        singleMp3: false,
        mp3s: [],
        comment: '',
      };

      this.setState({ codes: [...this.state.codes, newCode] });
    };

    this.handlers.codeRow.delete = (code) => {
      let updatedCodes = this.state.codes.filter(checkCode => checkCode !== code)

      this.setState({
        codes: updatedCodes
      });
    };

    this.handlers.codeRow.updateId = (event, code) => {
      let newCode = {
        ...code,
        id: event.target.valueAsNumber
      };

      let updatedCodes = this.state.codes.map(checkCode => {
        if (code === checkCode) {
          return newCode;
        }

        return checkCode;
      });

      this.setState({
        codes: updatedCodes
      });
    };

    this.handlers.codeRow.updateDescription = (event, code) => {
      let newCode = {
        ...code,
        description: event.target.value
      };

      let updatedCodes = this.state.codes.map(checkCode => {
        if (code === checkCode) {
          return newCode;
        }

        return checkCode;
      });

      this.setState({
        codes: updatedCodes
      });
    };

    this.handlers.codeRow.updateSingleMp3 = (event, code) => {
      // Reset mp3s when going from multiple to single.
      let codeMp3s = [...code.mp3s];
      if (event.target.checked && !code.mp3s.every(mp3 => code.mp3s[0] === mp3)) {
        codeMp3s.fill("");
      }

      let newCode = {
        ...code,
        mp3s: codeMp3s,
        singleMp3: event.target.checked
      };

      let updatedCodes = this.state.codes.map(checkCode => {
        if (code === checkCode) {
          return newCode;
        }

        return checkCode;
      });

      this.setState({
        codes: updatedCodes
      });
    };

    this.handlers.codeRow.chooseMp3 = (code, languageIndex, mp3Hash) => {
      let codeMp3s = [...code.mp3s];
      if (!Number.isNaN(languageIndex)) {
        codeMp3s[languageIndex] = mp3Hash;
      } else {
        codeMp3s.fill(mp3Hash)
      }
      let newCode = {
        ...code,
        mp3s: codeMp3s
      };

      let updatedCodes = this.state.codes.map(checkCode => {
        if (code === checkCode) {
          return newCode;
        }

        return checkCode;
      });

      this.setState({
        codes: updatedCodes
      });
    }

    this.handlers.systemCode.selectSystemSource = (event) => {
      this.setState({
        systemSource: parseInt(event.target.value, 10)
      });
    };

    this.handlers.bookCodeRow.updateSingleMp3 = (event, code) => {
      // Reset mp3s when going from multiple to single.
      let codeMp3s = [...code.mp3s];
      if (event.target.checked && !code.mp3s.every(mp3 => code.mp3s[0] === mp3)) {
        codeMp3s.fill("");
      }

      let newCode = {
        ...code,
        mp3s: codeMp3s,
        singleMp3: event.target.checked
      };

      this.setState({
        bookCode: newCode
      });
    };

    this.handlers.bookCodeRow.chooseMp3 = (code, languageIndex, mp3Hash) => {
      let codeMp3s = [...code.mp3s];
      if (!Number.isNaN(languageIndex)) {
        codeMp3s[languageIndex] = mp3Hash;
      } else {
        codeMp3s.fill(mp3Hash)
      }
      let newCode = {
        ...code,
        mp3s: codeMp3s
      };

      this.setState({
        bookCode: newCode
      });
    };

    this.handlers.systemCodeRow.updateSingleMp3 = (event, code) => {
      // Reset mp3s when going from multiple to single.
      let codeMp3s = [...code.mp3s];
      if (event.target.checked && !code.mp3s.every(mp3 => code.mp3s[0] === mp3)) {
        codeMp3s.fill("");
      }

      let newCode = {
        ...code,
        mp3s: codeMp3s,
        singleMp3: event.target.checked
      };

      let updatedCodes = this.state.systemCodes.map(checkCode => {
        if (code === checkCode) {
          return newCode;
        }

        return checkCode;
      });

      this.setState({
        systemCodes: updatedCodes
      });
    };

    this.handlers.systemCodeRow.chooseMp3 = (code, languageIndex, mp3Hash) => {
      let codeMp3s = [...code.mp3s];
      if (!Number.isNaN(languageIndex)) {
        codeMp3s[languageIndex] = mp3Hash;
      } else {
        codeMp3s.fill(mp3Hash)
      }
      let newCode = {
        ...code,
        mp3s: codeMp3s
      };

      let updatedCodes = this.state.systemCodes.map(checkCode => {
        if (code === checkCode) {
          return newCode;
        }

        return checkCode;
      });

      this.setState({
        systemCodes: updatedCodes
      });
    };
  }

  componentDidUpdate() {
    console.log(this.state);
  }

  render() {
    let bookCode = { ...this.state.bookCode };
    let bookId = this.state.header.bookId;
    if (!isNaN(bookId)) {
      bookCode.id = bookId;
    }

    let bookName = this.state.header.bookName;
    if (bookName) {
      bookCode.description = `Book Name: ${bookName}`;
    } else {
      bookCode.description = 'Book Name';
    }

    return <div className={style.editor}>
      <h1>Editor</h1>

      <Menu handlers={this.handlers.menu} />

      <FileHeader header={this.state.header} handlers={this.handlers.header} />
      <LanguageDefiner header={this.state.header} handlers={this.handlers.header} />
      <Mp3Table mp3s={this.state.mp3s} handlers={this.handlers.mp3} rowHandlers={this.handlers.mp3Row} languages={this.state.header.languages} />
      <CodeTable header={this.state.header} mp3s={this.state.mp3s} codes={this.state.codes} handlers={this.handlers.code} rowHandlers={this.handlers.codeRow} />
      <SystemCodeTable header={this.state.header} bookCode={bookCode} bookCodeRowHandlers={this.handlers.bookCodeRow} mp3s={this.state.mp3s} codes={this.state.systemCodes} systemSource={this.state.systemSource} handlers={this.handlers.systemCode} rowHandlers={this.handlers.systemCodeRow} />
    </div>
  }
}

export default Editor;
