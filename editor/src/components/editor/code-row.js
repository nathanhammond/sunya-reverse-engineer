import { h, Component } from 'preact';
import { AUTO_CODES } from '../../utils/constants';
import Mp3Selector from './mp3-selector';

function SingleCell(props) {
  return <td colspan={props.languageCount}><Mp3Selector single={true} chooseMp3={props.chooseMp3} selected={props.code.mp3s[0]} languageIndex={NaN} mp3s={props.mp3s} /></td>
}

function MultiCell(props) {
  return [...new Array(props.languageCount)].map((_, index) => {
    let mp3 = props.code.mp3s[index];
    return <td><Mp3Selector chooseMp3={props.chooseMp3} selected={mp3} languages={props.languages} languageIndex={index} mp3s={props.mp3s} /></td>
  });
}

class CodeRow extends Component {
  state = {}

  render(props) {
    let code = props.code;
    let disabled = props.codeStrategy === AUTO_CODES;
    let id = props.codeStrategy === AUTO_CODES ? props.codeStartId + props.index : code.id;

    let updateId = (event) => {
      props.handlers.updateId(event, props.code);
    }
    let updateDescription = (event) => {
      props.handlers.updateDescription(event, props.code);
    }
    let updateSingleMp3 = (event) => {
      props.handlers.updateSingleMp3(event, props.code);
    }
    let deleteCode = () => {
      props.handlers.delete(props.code);
    }
    let chooseMp3 = props.handlers.chooseMp3.bind(null, props.code);

    return (
      <tr>
        <td><input type="number" value={id} disabled={disabled} min="2000" max="48999" size="8" step="1" inputMode="numeric" pattern="\d*" onInput={updateId} /></td>
        <td><input type="text" value={code.description} onInput={updateDescription} /></td>
        <td><input type="checkbox" checked={code.singleMp3} onInput={updateSingleMp3} /></td>
        {props.code.singleMp3 ? <SingleCell languageCount={props.languageCount} code={props.code} chooseMp3={chooseMp3} mp3s={props.mp3s} /> : <MultiCell languageCount={props.languageCount} languages={props.languages} code={props.code} chooseMp3={chooseMp3} mp3s={props.mp3s} />}
        <td><button type="button" onClick={deleteCode}>🗑 Remove</button></td>
      </tr>
    );
  }
}
export default CodeRow;
