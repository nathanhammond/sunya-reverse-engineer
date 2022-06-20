import { h } from 'preact';
import { Router } from 'preact-router';

import Header from './header';

import style from "./app.css";

// Code-splitting is automated for `routes` directory
import Home from '../routes/home';
import Editor from '../routes/editor';

const App = () => (
	<div id="app" class={style.app}>
		<Header />
		<Router>
			<Home path="/" />
			<Editor path="/editor" />
		</Router>
	</div>
)

export default App;
