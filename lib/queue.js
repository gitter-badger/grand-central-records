var _ = require('lodash');
var Q = require('q');

module.exports = function(fn) {

/////////////////////////////
// Query queue
// var queue = db.queue();
// queue.add('...');

var Queue = function(_this, query) {
    this._queue = [];
    this.db = _this;
    if (query) this.add(query);
    return this;
};

fn.queue = function(query) {
    return new Queue(this, query);
};

Queue.prototype.add = function(query, values) {
    if (!query) return this;
    if (Array.isArray(query)) {
        for (var i=0; i < query.length; i++) this.add(query[i]);
    } else if (typeof query.q === 'object') {
        var q = this.db._replace(query.toString(), values);
        query._rebuild();
        this._queue.push(q);
    } else if (typeof query === 'string') {
        query = query.trim();
        query = this.db._replace(query, values);
        this._queue.push(query);
    }
    return this;
};

Queue.prototype.print = function(sep) {
    var sep = sep || '\n';
    var query = this._queue.join(';' + sep);
    if (query.slice(-1) != ';') query += ';';
    return query;
};

Queue.prototype.get = Queue.prototype.print;

// Runs callback or returns a promise
Queue.prototype.run = function(callback) {
    var q = (this.db.adapter != 'sqlite') ? this.get(' ') : '';

    if (_.isFunction(callback)) {
        if (!this._queue || !this._queue.length) this.db._query(callback);
        else this.db.query(q, callback);
    } else {
        var d = Q.defer();

        this.db.query(q, function(err, res) {
            if (err) return d.reject(err);
            return d.resolve(res);
        });

        return d.promise;
    }
};

Queue.prototype.execute = Queue.prototype.run;

};