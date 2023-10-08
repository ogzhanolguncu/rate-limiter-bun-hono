const DEFAULT_REQUEST_LIMIT = 100;
const DEFAULT_WINDOW_SIZE_MS = 60 * 1000; // 1 minute

type UserWindow = {
  currentWindowCount: number;
  previousWindowCount: number;
  currentWindowStart: number;
};

export class SlidingWindowCounter {
  windowSizeMs: number;
  requestLimit: number;
  userWindows: Map<string, UserWindow>;

  constructor(windowSizeMs = DEFAULT_WINDOW_SIZE_MS, requestLimit = DEFAULT_REQUEST_LIMIT) {
    this.windowSizeMs = windowSizeMs;
    this.requestLimit = requestLimit;
    this.userWindows = new Map();
  }

  isRequestAllowed = (userId: string): boolean => {
    const currentMs = Date.now();
    let userWindow = this.userWindows.get(userId);

    if (!userWindow) {
      // Initialize if userWindow doesn't exist
      userWindow = {
        currentWindowCount: 1,
        previousWindowCount: 0,
        currentWindowStart: currentMs,
      };
      this.userWindows.set(userId, userWindow);
      return true;
    }

    // Calculate elapsed time and weightings
    const elapsedTime = currentMs - userWindow.currentWindowStart;
    const weightCurrent = Math.floor((this.windowSizeMs - elapsedTime) / this.windowSizeMs);
    const weightPrevious = 1 - weightCurrent;

    // Calculate the weighted request count
    const weightedRequestCount =
      weightCurrent * userWindow.currentWindowCount +
      weightPrevious * userWindow.previousWindowCount;

    if (weightedRequestCount > this.requestLimit) {
      return false; // Request is rejected
    }

    // If the elapsed time exceeds the window size, slide the window
    if (elapsedTime > this.windowSizeMs) {
      userWindow.previousWindowCount = userWindow.currentWindowCount;
      userWindow.currentWindowCount = 0; // Reset for the new window
      userWindow.currentWindowStart = currentMs;
    }

    // Increment the current window count
    userWindow.currentWindowCount++;
    this.userWindows.set(userId, userWindow);
    console.log({ sdsd: this.userWindows.get(userId) });
    return true; // Request is allowed
  };
}
