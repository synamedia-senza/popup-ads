import { lifecycle } from "senza-sdk";

class LifecycleAdditions {
  constructor() {
    if (LifecycleAdditions.instance) {
      return LifecycleAdditions.instance;
    }
    LifecycleAdditions.instance = this;

    this._autoBackground = false;
    this._autoBackgroundDelay = 30;

    document.addEventListener("keydown", () => {
      if (this.autoBackground) {
        if (lifecycle.state === lifecycle.UiState.BACKGROUND || 
            lifecycle.state === lifecycle.UiState.IN_TRANSITION_TO_BACKGROUND) 
        {
          lifecycle.moveToForeground();
        } else {
          this.startCountdown();
        }
      }
    });
    
    lifecycle.addEventListener("onstatechange", () => {
      if (this._autoBackground && lifecycle.state === lifecycle.UiState.FOREGROUND) {
        this.startCountdown();
      }
    });
  }

  get autoBackground() {
    return this._autoBackground;
  }

  set autoBackground(value) {
    this._autoBackground = value;
    
    if (value) {
      this.startCountdown();
    }
  }

  get autoBackgroundDelay() {
    return this._autoBackgroundDelay;
  }

  set autoBackgroundDelay(value) {
    this._autoBackgroundDelay = value;
    
    if (this.autoBackground) {
      this.startCountdown();
    }
  }
  
  startCountdown() {
    this.stopCountdown();

    this.countdown = setTimeout(() => {
      lifecycle.moveToBackground();
    }, this.autoBackgroundDelay * 1000);
  }
  
  stopCountdown() {
    if (this.countdown) {
      clearTimeout(this.countdown);
    }
    this.countdown = null;
  }
}

export default new LifecycleAdditions(); 
