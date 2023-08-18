import { h, Component } from 'preact';

function LanguageCounter(props) {
  return [...new Array(props.languageCount)].map((_, index) => <LanguageRow handlers={props.handlers} index={index} languages={props.languages} />);
}

function LanguageRow(props) {
  let fieldName = "languageName" + props.index;
  let value = props.languages[props.index] || "";
  let updateHandler = props.handlers.updateLanguage.bind(null, props.index);

  return (
    <>
      <label for={fieldName}>
        <span>Language {props.index + 1} Name</span>
        <input value={value} onInput={updateHandler} id={fieldName} name={fieldName} type="text" />
      </label>
    </>
  );
}

class LanguageDefiner extends Component {
  render(props) {
    let header = props.header;

    return (
      <>
        <h2>Languages</h2>
        <label for="languageCount">
          <span>Language Count</span>
          <input value={header.languageCount} onInput={props.handlers.updateLanguageCount} id="languageCount" name="languageCount" type="number" size="8" min="0" max="255" step="1" inputmode="numeric" pattern="\d*"/>
        </label>

        <LanguageCounter handlers={props.handlers} languageCount={header.languageCount} languages={header.languages} />
      </>
    );
  }
}

export default LanguageDefiner;
