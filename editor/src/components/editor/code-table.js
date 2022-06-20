import { h, Component } from 'preact';
import CodeRow from "./code-row";
import { AUTO_CODES } from '../../utils/constants';
import style from "../../routes/editor/style.css";

class CodeTable extends Component {
  state = {};

  render(props) {
    let isAutoNumbered = props.header.codeStrategy === AUTO_CODES;
    let codeStartId;

    if (isAutoNumbered) {
      codeStartId = props.header.codeStartId;
    } else {
      codeStartId = Math.min(...props.codes.map(code => isNaN(code.id) ? Infinity : code.id));
    }

    return (      
      <>
        <h2>Book Codes</h2>
        <label for="codeStrategy">
          <input checked={isAutoNumbered} onChange={props.handlers.updateCodeStrategy} id="codeStrategy" name="codeStrategy" type="checkbox" />
          <span>Automatically set code IDs.</span>
        </label>
        <label for="codeStartId">
          <span>Code Start ID</span>
          <input disabled={!isAutoNumbered} value={codeStartId} onInput={props.handlers.updateCodeStartId} id="codeStartId" name="codeStartId" type="number" size="8" min="2000" max="48999" step="1" inputmode="numeric" pattern="\d*" />
        </label>
        <table>
          <thead>
            <tr><th>Code</th><th>Description</th><th>Cantonese</th><th>English</th><th>Mandarin</th><th>Remove</th></tr>
          </thead>
          <tbody>
            {props.codes.map((code, index) => <CodeRow key={code.uuid} index={index} code={code} mp3s={props.mp3s} codeStartId={props.header.codeStartId} codeStrategy={props.header.codeStrategy} handlers={props.rowHandlers} />)}
          </tbody>
        </table>
        <button className={style.button} type="button" onClick={props.handlers.add}>Add Code</button>
      </>
    );
  }
}

export default CodeTable;