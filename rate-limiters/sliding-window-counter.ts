const DEFAULT_REQUEST_LIMIT = 100;
const DEFAULT_WINDOW_SIZE = 5000;

type UserWindow = {
  prevCounter: number;
  prevWindow: number;
  currentCounter: number;
  currentWindow: number;
};

export class SlidingWindowCounter {
  requestLimit: number;
  userWindows: Map<string, UserWindow>;

  constructor(requestLimit = DEFAULT_REQUEST_LIMIT) {
    this.requestLimit = requestLimit;
    this.userWindows = new Map();
  }

  isRequestAllowed = (userId: string): boolean => {
    const counter = this.userWindows.get(userId);
    const requestTimestamp = Date.now();

    const currentWindow = Math.floor(requestTimestamp / DEFAULT_WINDOW_SIZE) * DEFAULT_WINDOW_SIZE;
    const prevWindow = currentWindow - DEFAULT_WINDOW_SIZE;

    if (counter === undefined) {
      this.userWindows.set(userId, {
        currentCounter: 1,
        currentWindow: currentWindow,
        prevCounter: 0,
        prevWindow: prevWindow,
      });
      return true;
    }

    if (currentWindow != counter.currentWindow) {
      if (counter.currentWindow === prevWindow) {
        counter.prevCounter = counter.currentCounter;
        counter.prevWindow = counter.currentWindow;
      } else {
        counter.prevCounter = 0;
        counter.prevWindow = prevWindow;
      }
      counter.currentWindow = currentWindow;
      counter.currentCounter = 0;
    }

    const currentWindowWeight = (requestTimestamp - currentWindow) / DEFAULT_WINDOW_SIZE;
    const prevWindowWeight = 1 - currentWindowWeight;
    const count =
      counter.currentCounter * currentWindowWeight + counter.prevCounter * prevWindowWeight;

    if (count >= this.requestLimit) {
      this.userWindows.set(userId, counter);
      return false;
    }

    counter.currentCounter++;
    this.userWindows.set(userId, counter);
    return true;
  };
}
