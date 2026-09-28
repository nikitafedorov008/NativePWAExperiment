/**
 * Material design language (Android · ChromeOS) — the same Framework7 shell as
 * Cupertino in its `md` theme, with the material-icons font instead.
 */
import './setup.js';
import 'material-icons/iconfont/material-icons.css';
import F7Root from './App.jsx';

export default function MaterialRoot() {
  return <F7Root theme="md" />;
}
