import { h, Component } from 'preact';
import style from "../../routes/editor/style.css";

class Menu extends Component {
  state = {}

  render(props) {
    return (
      <nav>
        <button className={style.button} type="button">New Project</button>
        <input type="file" id="open-project" name="open-project" className={style.inputfile} />
        <label className={style.button} for="open-project">Open Project</label>
        <button className={style.button} type="button">Save Project</button>
        <input type="file" id="open-tid" name="open-tid" className={style.inputfile} accept=".tid" onChange={props.handlers.openTidFile} />
        <label className={style.button} for="open-tid">Open .tid</label>
        <button className={style.button} type="button" onClick={props.handlers.exportTidFile} >Export .tid</button>
      </nav>
    );
  }
}

export default Menu;
