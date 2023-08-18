import { h, Component } from 'preact';
import { SYSTEM_SOURCES } from '../../utils/constants';
import SystemCodeRow from "./system-code-row";

function LanguageHeader(props) {
  return [...new Array(props.languageCount)].map((_, index) => {
    if (props.languages[index]) {
      return <th>{props.languages[index]}</th>
    } else {
      return <th>Unknown {index}</th>
    }
  });
}

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
            <tr><th>Code</th><th>Description</th><LanguageHeader languageCount={props.header.languageCount} languages={props.header.languages} /></tr>
          </thead>
          <tbody>
            <SystemCodeRow code={props.bookCode} mp3s={props.mp3s} languageCount={props.header.languageCount} languages={props.header.languages} handlers={props.bookCodeRowHandlers} />
            { props.systemSource === SYSTEM_SOURCES.CUSTOM ? props.codes.map((code) => <SystemCodeRow key={code.id} code={code} mp3s={props.mp3s} languageCount={props.header.languageCount} languages={props.header.languages} handlers={props.rowHandlers} />) : <></>}
          </tbody>
        </table>
      </>
    );
  }
}

export default SystemCodeTable;
