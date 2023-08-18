/* eslint-disable react/prefer-stateless-function */
import { h, Component } from 'preact';
import style from '../../routes/editor/style.css';
import rowStyle from './mp3-row.css';


class Mp3Row extends Component {
   render(props) {
    let updateLanguage = (event) => {
      props.handlers.updateLanguage(event, props.mp3);
    }
    let updateDescription = (event) => {
      props.handlers.updateDescription(event, props.mp3);
    }
    let playMp3 = (event) => {
      props.handlers.play(event, props.mp3);
    }
    let replaceMp3 = (event) => {
      props.handlers.replace(props.mp3, event);
    }
    let deleteMp3 = () => {
      props.handlers.delete(props.mp3);
    }

    let details = `${props.mp3.mpegVersion} ${props.mp3.layer} ${props.mp3.bitrate}kbps ${props.mp3.samplingRate}Hz (${props.mp3.channelMode})`;

    return (
      <tr id={props.mp3.hash}>
        <td>{props.mp3.hash}</td>
        <td>{props.mp3.fileName}</td>
        <td>{props.mp3.size}</td>
        <td>{details}</td>
        <td>
          <select value={props.mp3.languageIndex} onChange={updateLanguage}>
            <option value="">Select language</option>
            {props.languages.map((language, index) => <option selected={props.mp3.languageIndex === index} value={index}>{language}</option>)}
          </select>
        </td>
        <td><input type="text" value={props.mp3.description} onInput={updateDescription} /></td>
        <td className={rowStyle.playback}><button type="button" onClick={playMp3}>Play</button></td>
        <td><a className={style.button} href={props.mp3.objectURL} download={props.mp3.fileName || props.mp3.hash}>💾 Save</a></td>
        <td>
          <input type="file" id={`replace-${props.mp3.hash}`} name={`replace-${props.mp3.hash}`} className={style.inputfile} onChange={replaceMp3} accept=".mp3,audio/mpeg" />
          <label className={style.button} for={`replace-${props.mp3.hash}`}>🔧 Replace</label>
        </td>
        <td><button type="button" onClick={deleteMp3}>🗑 Remove</button></td>
      </tr>
    );
  }
}

export default Mp3Row;
