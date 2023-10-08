const DEFAULT_REQUEST_LIMIT = 100;
const DEFAULT_TOKEN_RENEWAL_MS = 60 * 1000;

type UserWindow = { count: number; startTime: number };

export class FixedWindow {
  windowSizeMs: number;
  requestLimit: number;
  userWindows: Map<string, UserWindow>;

  constructor(windowSizeMs = DEFAULT_TOKEN_RENEWAL_MS, requestLimit = DEFAULT_REQUEST_LIMIT) {
    this.windowSizeMs = windowSizeMs;
    this.requestLimit = requestLimit;
    this.userWindows = new Map();
  }

  isRequestAllowed = (userId: string) => {
    const currentMs = Date.now();
    const userWindow = this.userWindows.get(userId);

    /* Reset condition of window substracting userWindow.startTime from currentTimestamp will give us current ms and we will check that against predefined windowSizeMs */
    if (!userWindow || currentMs - userWindow.startTime >= this.windowSizeMs) {
      this.userWindows.set(userId, { count: 1, startTime: currentMs });
      console.log(`userid:${userId}-token:${1}-allowed_until:${currentMs}`);
      return true;
    }

    //Check token count
    if (userWindow.count < DEFAULT_REQUEST_LIMIT) {
      userWindow.count++;
      console.log(
        `Refresh Log:\nuser_id:${userId}\ntoken:${userWindow.count}\nallowed_until:${userWindow.startTime}\ncurrent:${currentMs}`
      );
      return true;
    }

    return false;
  };
}
