import { h, Component } from 'preact';
import Mp3Selector from './mp3-selector';

function SingleCell(props) {
  return <td colspan="3"><Mp3Selector single={true} chooseMp3={props.chooseMp3} selected={props.code.cantonese} language={"cantonese"} mp3s={props.mp3s} /></td>
}

function MultiCell(props) {
  return (
    <>
      <td><Mp3Selector chooseMp3={props.chooseMp3} selected={props.code.cantonese} language={"cantonese"} mp3s={props.mp3s} /></td>
      <td><Mp3Selector chooseMp3={props.chooseMp3} selected={props.code.english} language={"english"} mp3s={props.mp3s} /></td>
      <td><Mp3Selector chooseMp3={props.chooseMp3} selected={props.code.mandarin} language={"mandarin"} mp3s={props.mp3s} /></td>
    </>
  );
}

class SystemCodeRow extends Component {
  state = {}

  render(props) {
    let id = props.code.id || "______";
    let chooseMp3 = props.handlers.chooseMp3.bind(null, props.code);

    return (
      <tr>
        <th>{id}</th>
        <td><span title={props.code.comment}>{props.code.description}</span></td>
        {props.code.singleMp3 ? <SingleCell code={props.code} chooseMp3={chooseMp3} mp3s={props.mp3s} /> : <MultiCell code={props.code} chooseMp3={chooseMp3} mp3s={props.mp3s} />}
      </tr>
    );
  }
}
export default SystemCodeRow;
