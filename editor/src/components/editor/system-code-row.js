import { h, Component } from 'preact';
import Mp3Selector from './mp3-selector';

function SingleCell(props) {
  let mp3 = props.code.mp3s[0];
  return <td colspan={props.languageCount}><Mp3Selector single={true} chooseMp3={props.chooseMp3} selected={mp3} languageIndex={NaN} mp3s={props.mp3s} /></td>
}

function MultiCell(props) {
  return [...new Array(props.languageCount)].map((_, index) => {
    let mp3 = props.code.mp3s[index];
    return <td><Mp3Selector chooseMp3={props.chooseMp3} selected={mp3} languages={props.languages} languageIndex={index} mp3s={props.mp3s} /></td>
  });
}

class SystemCodeRow extends Component {
  state = {}

  render(props) {
    let id = props.code.id || "______";

    let updateSingleMp3 = (event) => {
      props.handlers.updateSingleMp3(event, props.code);
    }
    let chooseMp3 = props.handlers.chooseMp3.bind(null, props.code);

    return (
      <tr>
        <th>{id}</th>
        <td><span title={props.code.comment}>{props.code.description}</span></td>
        <td><input type="checkbox" checked={props.code.singleMp3} onInput={updateSingleMp3} /></td>
        {props.code.singleMp3 ? <SingleCell languageCount={props.languageCount} code={props.code} chooseMp3={chooseMp3} mp3s={props.mp3s} /> : <MultiCell languageCount={props.languageCount} languages={props.languages} code={props.code} chooseMp3={chooseMp3} mp3s={props.mp3s} />}
      </tr>
    );
  }
}
export default SystemCodeRow;
