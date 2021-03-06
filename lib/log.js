var colors = require("colors");
var hl = require("./highlight/cli-highlight");


var Log = module.exports = function(logger) {
    this.logger = logger || console.log;
};

var fn = Log.prototype;

fn.log = function(str) {
    var msg;

    if (this.logger == console.log) {
        msg = '[GCR] '.bold.blue + str;
        this.logger(msg);
    } else {
        this.logger(str);
    }

    return str;
};

fn.error = function(str, kill) {
    if (kill === null) kill = false;
    var msg;

    if (this.logger == console.log)
        msg = 'ERROR '.bold.red + str;
    else msg = 'ERROR: ' + str;

    this.log(msg);
    if (kill) process.exit(1);
    return new Error(str);
};

fn.warn = function(str) {
    var msg = 'WARNING '.bold.yellow + str;
    return this.log(msg);
};

fn.database = function(str, type, ms) {

    type = type || '';

    function cols(txt) {
        var str = " ", spaces = 16 - txt.length;
        for (var i = 0; i < spaces; i++) str += " ";
        return txt + str;
    }

    var task = (type==='') ? '' : type;
    var time = "(" + convertTime(ms) + ")";

    if (this.logger == console.log) {
        this.logger(cols(task).bold.cyan + hl(str) + ' ' + time.inverse);
    } else {
        this.logger(cols(task) + str + time);
    }
};

function convertTime(ms) {
    if (ms < 1000) return ms +'ms';
    if (ms < 60000) return (ms/1000).toFixed(2) + 's';
    var m = Math.floor(ms/60000);
    var s = Math.round((ms - m * 60000)/1000);
    return m + 'm' + s + 's';
}
