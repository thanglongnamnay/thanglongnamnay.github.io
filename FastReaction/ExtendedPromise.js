class ExtPromise {
  static all(iterable) {
    return new ExtPromise((res, rej) => 
      Promise.all(iterable)
        .then(res, rej)
      );
  }
  
  static race(iterable) {
    return new ExtPromise((res, rej) => 
      Promise.race(iterable)
        .then(res, rej)
      );
  }
  
  static any(iterable) {
    let fulfilled = false;
    let count = iterable.length;
    const rejected = [];
    const notUndefined = x => !!x;

    return new ExtPromise((res, rej) => {
      iterable.forEach((promise, index) => {
        promise.then((value) => {
          if (fulfilled) return;
          res(value);
        }, (value) => {
          rejected[index] = value;
          if (--count > 0) return;
          rej(rejected);
        });
      });
    });
  }
  
  static allSettled(iterable) {
    let count = iterable.length;
    const result = [];
    const handleSettled = (res, index, status) => (value) => {
      result[index] = { status, value };
      if (--count > 0) return;
      res(result);
    }
    return new ExtPromise((res) => {
      iterable.forEach((promise, index) => {
        promise.then(handleSettled(res, index, 'fulfilled'),
          handleSettled(res, index, 'rejected'));
      });
    });
  }
  
  static reject(value) {
    return new ExtPromise((res, rej) => 
      Promise.reject(value)
        .then(res)
        .catch(rej)
      );
  }
  
  static resolve(value) {
    return new ExtPromise((res, rej) => 
      Promise.resolve(value)
        .then(res)
        .catch(rej)
      );
  }

  constructor(executor) {
    if (executor.constructor.name === 'Promise') {
      this.promise_ = Promise.race([executor]);
    } else {
      this.promise_ = new Promise(executor);
    }
    this.stoped = false;
    this.thenCallbacks_ = [];
    this.catchCallbacks_ = [];
    this.chidrenPromises_ = [];
  }

  then(res = x => x, rej) {
    this.thenCallbacks_.push(res);
    if (rej) this.catchCallbacks_.push(rej);
    const nextCancelable = new ExtPromise(this.promise_.then((value) => {
      if (this.stoped) return;
      return res(value);
    }, (value) => {
      if (this.stoped) return;
      return rej(value);
    }));
    if (this.stoped) nextCancelable.cancel();
    this.chidrenPromises_.push(nextCancelable);
    return nextCancelable;
  }

  catch(rej) {
    return this.then(undefined, rej);
  }

  resolve(value) {
    if (!this.stoped) {
      this.promise_ = Promise.resolve(value);
      this.chidrenPromises_.forEach(promise => promise.cancel());
      this.chidrenPromises_ = this.chidrenPromises_.map((_, index) => (
        this.promise_.then(this.thenCallbacks_[index])
      ));
    }
    this.stoped = true;
    return this;
  }

  reject(value) {
    if (!this.stoped) {
      this.promise_ = Promise.reject(value);
      this.thenCallbacks_.forEach(fn => {
          this.promise_.catch(fn);
      });
    }
    this.chidrenPromises_.forEach(promise => promise.reject(value));
    return this;
  }

  cancel() {
    if (!this.stoped) {
      this.stoped = true;
    }
    this.chidrenPromises_.forEach(promise => promise.cancel());
    return this;
  }
}