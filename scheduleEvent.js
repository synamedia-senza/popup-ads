import { isRunningE2E, alarmManager, lifecycle } from "senza-sdk";

let timeout;
let eventNames = [];

// Schedules an event using AlarmManager if running on Senza, otherwise sets a timeout.
// The event should have the following properties:
//  - name: string
//  - callback: function
//  - detail: an event with this property will be passed to the function
//  - seconds: number
export function scheduleEvent(event) {
  if (isRunningE2E()) {
    if (!eventNames.includes(event.name)) {
      alarmManager.addEventListener(event.name, async (e) => {
        await moveToForegroundIfNeeded();
        event.callback(e);
      });
      eventNames.push(event.name);
    }
    alarmManager.addAlarm(event.name, Date.now() + event.seconds * 1000, event.detail);
  } else {
    timeout = setTimeout(() => event.callback(event), event.seconds * 1000);
  }
}

export function clearEvents() {
  if (isRunningE2E()) {
    alarmManager.deleteAllAlarms();
  } else {
    clearTimeout(timeout);
  }
}

async function moveToForegroundIfNeeded() {
  if (lifecycle.state == lifecycle.UiState.BACKGROUND ||
      lifecycle.state == lifecycle.UiState.IN_TRANSITION_TO_BACKGROUND) {
    await lifecycle.moveToForeground();
  }
}

