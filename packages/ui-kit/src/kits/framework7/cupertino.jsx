/**
 * Cupertino design language (iOS · macOS) — Framework7 in its `ios` theme,
 * with the Framework7 icon font. Only this entry point pulls that font in, so
 * the Material chunk stays independent.
 */
import './setup.js';
import 'framework7-icons/css/framework7-icons.css';
import F7Root from './App.jsx';

export default function CupertinoRoot() {
  return <F7Root theme="ios" />;
}
