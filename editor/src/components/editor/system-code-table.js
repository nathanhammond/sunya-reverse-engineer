import { h, Component } from 'preact';
import { SYSTEM_SOURCES } from '../../utils/constants';
import SystemCodeRow from "./system-code-row";

class SystemCodeTable extends Component {
  state = {}

  render(props) {
    return (
      <>
        <h2>System Codes</h2>
        <fieldset onChange={props.handlers.selectSystemSource}>
          <legend>System Code Audio Source</legend>
          <label for="useSunYaSystemCodes"><input type="radio" id="useSunYaSystemCodes" name="systemSource" value={SYSTEM_SOURCES.SUNYA} checked={props.systemSource === SYSTEM_SOURCES.SUNYA} /> Use Sun Ya System Code Audio</label>
          <label for="useOSSSystemCodes"><input type="radio" id="useOSSSystemCodes" name="systemSource" value={SYSTEM_SOURCES.OSS} checked={props.systemSource === SYSTEM_SOURCES.OSS} /> Use OSS System Code Audio</label>
          <label for="useCustomSystemCodes"><input type="radio" id="useCustomSystemCodes" name="systemSource" value={SYSTEM_SOURCES.CUSTOM} checked={props.systemSource === SYSTEM_SOURCES.CUSTOM} /> Use Custom System Code Audio</label>
        </fieldset>
        <table>
          <thead>
            <tr><th>Code</th><th>Description</th><th>Cantonese</th><th>English</th><th>Mandarin</th></tr>
          </thead>
          <tbody>
            <SystemCodeRow code={props.bookCode} mp3s={props.mp3s} handlers={props.bookCodeRowHandlers} />
            { props.systemSource === SYSTEM_SOURCES.CUSTOM ? props.codes.map((code) => <SystemCodeRow key={code.id} code={code} mp3s={props.mp3s} handlers={props.rowHandlers} />) : <></>}
          </tbody>
        </table>
      </>
    );
  }
}

export default SystemCodeTable;