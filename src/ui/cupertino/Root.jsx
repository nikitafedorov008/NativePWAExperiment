/**
 * Cupertino look (iOS/macOS): a thin wrapper that boots Framework7 in ios
 * theme with the framework7-icons font and mounts the shared F7 app shell.
 * All screens and navigation live in src/ui/f7 — this file only picks the theme.
 */
import '../f7/setup.js';
import 'framework7-icons/css/framework7-icons.css';
import F7Root from '../f7/App.jsx';

export default function Root() {
  return <F7Root theme="ios" />;
}

