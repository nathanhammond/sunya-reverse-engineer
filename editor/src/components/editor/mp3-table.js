import { h, Component, createRef } from 'preact';
import Mp3Row from './mp3-row';
import style from '../../routes/editor/style.css';
import Mp3RowStyles from './mp3-row.css';

class Mp3Table extends Component {
  constructor(props) {
    super(props);

    this.playbackElement = createRef();
    this.listeners = [];

    this.play = (event, mp3) => {
      let audio = this.playbackElement.current;

      let loadstart = function() {
        event.target.className = Mp3RowStyles.loading;
      }

      let playing = function() {
        event.target.className = Mp3RowStyles.playing;
      }

      let ended = function() {
        event.target.className = "";
      }

      this.listeners.forEach(({ target, loadstart, playing, ended }) => {
        target.className = "";
        audio.removeEventListener('loadstart', loadstart);
        audio.removeEventListener('playing', playing);
        audio.removeEventListener('ended', ended);
      });

      this.listeners.length = 0;

      audio.addEventListener('loadstart', loadstart);
      audio.addEventListener('playing', playing);
      audio.addEventListener('ended', ended);

      this.listeners.push({ target: event.target, loadstart, playing, ended });

      audio.src = mp3.objectURL;
      audio.play();
    }
  }

  render(props) {
    let mp3s = Object.values(props.mp3s);

    let rowHandlers = {
      ...props.rowHandlers,
      play: (event, mp3) => {
        this.play(event, mp3)
      },
    };

    return (
      <>
        <h2>MP3s</h2>
        <audio ref={this.playbackElement} id="playback" />
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>File Name</th>
              <th>Size</th>
              <th>Details</th>
              <th>Language</th>
              <th>Description</th>
              <th />
              <th />
              <th />
              <th />
            </tr>
          </thead>
          <tbody>
            {mp3s.map(mp3 => <Mp3Row key={mp3.hash} mp3={mp3} languages={props.languages} handlers={rowHandlers} />)}
          </tbody>
        </table>
        <label className={style.button} for="addMp3">Add MP3</label>
        <input type="file" id="addMp3" name="addMp3" className={style.inputfile} onChange={props.handlers.add} multiple accept=".mp3,audio/mpeg" />
      </>
    );
  }
}

export default Mp3Table;
