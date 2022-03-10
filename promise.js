function Promise(executor) {
    const self = this;
    self.status = 'pending'
    self.resolvedCallbackList = []
    self.rejectedCallbackList = []
    self.data = undefined;
    self.error = undefined;

    function resolve(value) {
        setTimeout(() => {
            if (self.status === 'pending') {
                self.status = 'resolved'
                self.data = value;
                setTimeout(() => {
                    for (let i = 0; i < self.resolvedCallbackList.length; i++) {
                        self.resolvedCallbackList[i]()
                    }
                }, 0);
            }
        }, 0);
    }

    function reject(error) {
        setTimeout(() => {
            if (self.status === 'pending') {
                self.status = 'rejected'
                self.error = error;
                setTimeout(() => {
                    for (let i = 0; i < self.rejectedCallbackList.length; i++) {
                        self.rejectedCallbackList[i]()
                    }
                }, 0);
            }
        }, 0);
    }

    try {
        executor(resolve, reject)
    } catch (error) {
        reject(error)
    }
}

Promise.prototype.then = function (onResolved, onRejected) {
    const self = this;
    const promise2 = new Promise((resolve, reject) => {

        if (self.status === 'resolved') {
            if (typeof onResolved === 'function') {
                const res = onResolved(self.data);
                if (res instanceof Promise) {
                    res.then(resolve, reject)
                } else {
                    resolve(res)
                }
            } else {
                resolve(self.data)
            }
        }
        if (self.status === 'rejected') {
            // 错误也要继续抛出去
            if (typeof onRejected === 'function') {
                const res = onRejected(self.error)
                if (res instanceof Promise) {
                    res.then(resolve, reject)
                } else {
                    resolve(res)
                }
            } else {
                reject(self.error)
            }
        }

        if (self.status === 'pending') {
            self.resolvedCallbackList.push(function () {
                if (typeof onResolved === 'function') {
                    const res = onResolved(self.data)
                    if (res instanceof Promise) {
                        res.then(resolve, reject)
                    } else {
                        resolve(res)
                    }
                } else {
                    resolve(self.data)
                }
            })
            self.rejectedCallbackList.push(function () {
                if (typeof onRejected === 'function') {
                    const res = onRejected(self.error)
                    if (res instanceof Promise) {
                        res.then(resolve, reject)
                    } else {
                        resolve(res)
                    }
                } else {
                    reject(self.error)
                }
            })
        }
    })

    return promise2;
}

Promise.prototype.catch = function (onRejected) {
    return this.then(null, onRejected)
}


Promise.deferred = Promise.defer = function () {
    var dfd = {}
    dfd.promise = new Promise(function (resolve, reject) {
        dfd.resolve = resolve
        dfd.reject = reject
    })
    return dfd
}

module.exports = Promise;