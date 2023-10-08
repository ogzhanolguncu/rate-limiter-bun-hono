const DEFAULT_REQUEST_LIMIT = 100;
const DEFAULT_TOKEN_RENEWAL_MS = 60 * 1000; //5 minutes

export class SlidingWindowLog {
  windowSizeMs: number;
  requestLimit: number;
  userWindows: Map<string, number[]>;

  constructor(windowSizeMs = DEFAULT_TOKEN_RENEWAL_MS, requestLimit = DEFAULT_REQUEST_LIMIT) {
    this.windowSizeMs = windowSizeMs;
    this.requestLimit = requestLimit;
    this.userWindows = new Map();
  }

  isRequestAllowed = (userId: string): boolean => {
    const currentMs = Date.now();
    let userWindow = this.userWindows.get(userId) || [];

    // If user is new or expired, allow request and create/update log
    if (!userWindow.length) {
      this.userWindows.set(userId, [currentMs]);
      return true;
    }

    // Cleanup
    let index = 0;
    while (
      index < userWindow.length &&
      userWindow[index] &&
      currentMs - userWindow[index]! >= this.windowSizeMs
    ) {
      index++;
    }
    userWindow = userWindow.slice(index);
    console.log(`Deleted log count: ${index}`);

    // Update log
    this.userWindows.set(userId, userWindow);

    // Check and log the request
    if (userWindow.length < this.requestLimit) {
      userWindow.push(currentMs);
      return true;
    }
    return false;
  };
}
