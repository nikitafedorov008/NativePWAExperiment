/**
 * Material look (Android/Linux): the same shared F7 shell as Cupertino, booted
 * in md theme with the material-icons font — one implementation, two native
 * languages, which is Framework7's core idea and this project's cheapest win.
 */
import '../f7/setup.js';
import 'material-icons/iconfont/material-icons.css';
import F7Root from '../f7/App.jsx';

export default function Root() {
  return <F7Root theme="md" />;
}
