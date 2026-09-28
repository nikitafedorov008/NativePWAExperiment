/**
 * Framework7 bootstrap — `framework7/lite-bundle` keeps the bundle to the
 * components this app actually uses; the React plugin is installed once.
 */
import Framework7 from 'framework7/lite-bundle';
import Framework7React from 'framework7-react';
import 'framework7/css/bundle';

if (!Framework7.__streaksReactInstalled) {
  Framework7.use(Framework7React);
  Framework7.__streaksReactInstalled = true;
}
