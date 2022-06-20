import { h } from 'preact';
import { Link } from 'preact-router/match';
import style from './style.css';

const Header = () => (
	<header className={style.header}>
		<h1><Link href="/">Sun Ya OID Pen</Link></h1>
		<nav>
			<Link activeClassName={style.active} href="/editor">Editor</Link>
		</nav>
	</header>
);

export default Header;
