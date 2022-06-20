import { h, Component } from 'preact';

class FileHeader extends Component {
  state = {};

  render(props) {
    let header = props.header;

    return (
      <>
        <h2>Header</h2>
        <label for="editor">
          <span>Editor</span>
          <input value={header.editor} id="editor" name="editor" type="text" disabled readonly />
        </label>
        <label for="seriesId">
          <span>Series ID</span>
          <input value={header.seriesId} id="seriesId" name="seriesId" type="number" size="8" inputmode="numeric" pattern="\d*" disabled readonly />
        </label>
        <label for="bookId">
          <span>Book ID</span>
          <input value={header.bookId || null} onInput={props.handlers.updateBookId} id="bookId" name="bookId" type="number" size="8" min="0" max="1000" step="1" inputmode="numeric" pattern="\d*" />
        </label>
        <label for="bookName">
          <span>Book Name</span>
          <input value={header.bookName} onInput={props.handlers.updateBookName} id="bookName" name="bookName" type="text" />
        </label>
      </>
    );
  }
}

export default FileHeader;