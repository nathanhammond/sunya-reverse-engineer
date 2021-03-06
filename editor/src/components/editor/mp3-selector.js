import { h, Component } from 'preact';
import style from "../../routes/editor/style.css";

function Selected(props) {
  return (
    <>
      <span>{props.mp3.description || props.mp3.fileName}</span>
      <a className={style.button} href={`#${props.mp3.hash}`}>Jump to MP3</a>
      {/* <button type="button">Play</button> */}
      <button type="button" onClick={props.chooseMp3}>Change</button>
      {props.unmatchedLanguage ? <span>⚠️ {props.mp3.language.substr(0,1).toUpperCase() + props.mp3.language.substr(1)}</span> : ""}
    </>
  );
}

function Unselected(props) {
  return (
    <>
      <select onChange={props.chooseMp3}>
        <option>Choose MP3</option>
        {props.mp3Array.map(mp3 => <option key={mp3.hash} value={mp3.hash}>{mp3.fileName}</option>)}
      </select>
      {/* <button type="button">Upload</button> */}
      {/* <button type="button">Record</button> */}
    </>
  );
}

class Mp3Selector extends Component {
  state = {};

  render(props) {
    let mp3Array = Object.values(props.mp3s);

    let mp3 = false;
    if (props.selected) {
      mp3 = props.mp3s[props.selected];
    }

    let unmatchedLanguage = false;
    if (mp3 && !props.single) {
      unmatchedLanguage = mp3.language !== props.language;
    }

    let chooseMp3 = (event) => {
      props.chooseMp3(props.language, event.target.value)
    }

    return props.selected ? <Selected mp3={mp3} chooseMp3={chooseMp3} unmatchedLanguage={unmatchedLanguage} /> : <Unselected chooseMp3={chooseMp3} mp3Array={mp3Array} />
  }
}

export default Mp3Selector;
