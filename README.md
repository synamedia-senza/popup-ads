# Popup Ads

Displays scheduled popup ads on top of the video.

The popups.js file contains a list of popup metadata, including start and end times for which to display each popup. 

When not running on Senza, the app uses the setTimeout() function to schedule popups being shown and hidden. When running on Senza, uses AlarmManager to do the same thing, which works even if the app is in background mode.

Uses the lifecycle auto-background feature to switch to background mode after ten seconds of inactivity, if no banner is being shown. Switches back to foreground mode automatically when it's time to display a banner.

## Interface

* OK - toggle between foreground and background mode
* Back - pause and play the video
* Left/Right - skip backwards and forwards by 10 seconds

## Build

```bash
npm install --save-dev webpack
npm ci
npx webpack -w --config webpack.config.js
open index.html
```
