const DEFAULT_TOKEN = 10;
const DEFAULT_TOKEN_RENEWAL_MS = 5000;
const DEFAULT_EXPIRATION = 1000 * 30;

/**First one is timerId for clean up and second one is activity timestamp in ms*/
type ActivityMap = [Timer, number];

export class TokenBucket {
  userTokenBucket: Map<string, number>;
  userActivityBucket: Map<string, ActivityMap>;

  constructor() {
    this.userTokenBucket = new Map();
    this.userActivityBucket = new Map();
    setInterval(this.cleanUpUnusedBuckets, DEFAULT_TOKEN_RENEWAL_MS);
  }

  private cleanUpUnusedBuckets = () => {
    this.userActivityBucket.forEach(([timer, timestampInMs], userId) => {
      try {
        if (timestampInMs + DEFAULT_EXPIRATION <= Date.now()) {
          clearInterval(timer); // Always clear timers to prevent memory leaks
          this.userActivityBucket.delete(userId); // Remove user activity
          this.userTokenBucket.delete(userId); // Remove user tokens
          console.log(`Cleaning up userId:${userId}`);
        }
      } catch (error) {
        console.error(`Failed to clean up for user ${userId}:`, error);
      }
    });
  };

  private refreshToken = (userId: string) => {
    const timerId = setInterval(() => {
      const currentTokenCount = this.userTokenBucket.get(userId);
      if (currentTokenCount === undefined) throw new Error("UserId is missing in setInterval!");
      if (currentTokenCount === DEFAULT_TOKEN) console.log(`${userId}:Bucket is full!`);
      else {
        this.userTokenBucket.set(userId, currentTokenCount + 1);
        console.log(`add:${userId}]:${currentTokenCount + 1}`);
      }
    }, DEFAULT_TOKEN_RENEWAL_MS);

    this.userActivityBucket.set(userId, [timerId, Date.now()]);
  };

  public startRateLimitingForUser = (userId: string) => {
    if (!this.userTokenBucket.has(userId)) {
      console.log(`New user added to bucket:${userId}`);
      this.userTokenBucket.set(userId, DEFAULT_TOKEN);
      this.refreshToken(userId);
    }
    return this.userTokenBucket.get(userId);
  };

  public removeToken = (userId: string) => {
    const tokenInUsersBucket = this.checkIfUserInBucket(userId);

    this.userTokenBucket.set(userId, tokenInUsersBucket - 1);
    console.log(`remove:${userId}]:${tokenInUsersBucket - 1}`);
  };

  private checkIfUserInBucket(userId: string) {
    const tokenInUsersBucket = this.userTokenBucket.get(userId);
    if (tokenInUsersBucket === undefined) throw new Error("UserId is missing!");
    return tokenInUsersBucket;
  }
}
