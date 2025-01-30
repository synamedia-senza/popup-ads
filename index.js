import { init, uiReady, ShakaPlayer, lifecycle } from "senza-sdk";
import lifecycleAdditions from "./lifecycle-additions.js";
import { scheduleEvent, clearEvents } from "./scheduleEvent.js"
import popups from "./popups.js";

const TEST_VIDEO = "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd";

let player;

window.addEventListener("load", async () => {
  try {
    await init();
    player = new ShakaPlayer(video);
    await player.load(TEST_VIDEO);
    await video.play();

    lifecycleAdditions.autoBackgroundDelay = 10;
    lifecycleAdditions.autoBackground = true;

    calculateTimes();
    scheduleNextEvent();

    uiReady();
  } catch (error) {
    console.error(error);
  }
});

function getNextEvent(currentTime) {
  let item = popups.find(p => p.endTime > currentTime);
  if (item) {
    if (item.startTime > currentTime) {
      return {
        name: "showPopup",
        callback: showPopup,
        detail: item.id,
        seconds: item.startTime - currentTime
      };
    } else {
      return {
        name: "hidePopup",
        callback: hidePopup,
        detail: item.id,
        seconds: item.endTime - currentTime
      };
    }
  } else {
    return null;
  }
}

function scheduleNextEvent() {
  clearEvents();

  let event = getNextEvent(video.currentTime);
  console.log(event);
  if (event) {
    if (event.name == "showPopup") {
      setVisible(false);
    } else {
      updatePopup(event.detail);
      setVisible(true);
    }
    scheduleEvent(event);
  } else {
    setVisible(false);
  }
}

function updatePopup(id) {
  let item = popups.find(p => p.id == id);
  if (item) {
    icon.src = `images/${item.id}.png`;
    title.innerHTML = item.title;
    subtitle.innerHTML = item.subtitle;
  }
}

function showPopup(event) {
  updatePopup(event.detail);
  dissolveIn();
  setTimeout(scheduleNextEvent, 1000);
}

function hidePopup(event) {
  dissolveOut();
  setTimeout(scheduleNextEvent, 1000);
}

function setVisible(visible) {
  popup.style.removeProperty("animation-name");
  popup.style.opacity = visible ? 0.9 : 0.0;
  lifecycleAdditions.autoBackground = !visible;
}

function dissolveIn() {
  popup.style.animationName = "dissolve-in";
  lifecycleAdditions.autoBackground = false;
}

function dissolveOut() {
  popup.style.animationName = "dissolve-out";
  lifecycleAdditions.autoBackground = true;
}

function calculateTimes() {
  popups.forEach(item => {
    item.startTime = timeToSeconds(item.start);
    item.endTime = timeToSeconds(item.end);
  });
}

function timeToSeconds(timeStr) {
  const [minutes, seconds] = timeStr.split(":").map(Number);
  return minutes * 60 + seconds;
}

document.addEventListener("keydown", async function (event) {
  switch (event.key) {
    case "Enter": await toggleBackground(); break;
    case "Escape": await playPause(); break;
    case "ArrowLeft": skip(-10); break;
    case "ArrowRight": skip(10); break;
    default: return;
  }
  event.preventDefault();
});

async function toggleBackground() {
  if (lifecycle.state == lifecycle.UiState.BACKGROUND) {
    await lifecycle.moveToForeground();
  } else {
    await lifecycle.moveToBackground();
  }
}

async function playPause() {
  if (video.paused) {
    await video.play();
  } else {
    await video.pause();
  }
}

function skip(seconds) {
  video.currentTime = video.currentTime + seconds;
  scheduleNextEvent();
}
