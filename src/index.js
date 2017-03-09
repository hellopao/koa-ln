"use strict";

const assert = require('assert');
const util = require('util');
const fs = require('fs');

const ln = require('ln');
const Moment = require('mini-moment');
const debug = require('debug')('koa-ln');

function createLogger(name, opts) {
    opts = opts || {};
    debug('%j', opts);

    if (opts.type === "file") {
        assert(opts.path, "opts.path is required when opts.type is file");
        assert(fs.existsSync(opts.path), "log path must be an exist directory");
    }

    opts.name = opts.name || name;
    opts.dateFormat = opts.dateFormat || "YYYY-MM-DD";

    if (opts.json) {
        opts.formatter = null;
    } else {
        opts.formatter = opts.formatter || function (json) {
            return util.format("%s - %s - %s - %d - %s", new Moment(json.t).format('yyyy-MM-dd hh:mm:ss.SSS'), ln.LEVEL[json.l], json.n, json.p, json.m);
        };
    }

    return new ln({
        name: opts.name,
        level: opts.level || "info",
        appenders: [{
            type: opts.type || "console",
            path: `[${opts.path}/${opts.name}.]${opts.dateFormat}[.log]`,
            formatter: opts.formatter
        }]
    });
}

exports.access = function (opts) {
    opts = opts || {};
    var logger = createLogger("access", opts);

    return function (ctx, next) {
        const start = process.hrtime();

        return next().then(() => {
            const end = process.hrtime(start);

            let ignored = false;
            if (util.isFunction(opts.filter)) {
                try {
                    ignored = opts.filter(ctx);
                } catch (err) {
                }
            } else if (util.isRegExp(opts.filter)) {
                ignored = opts.filter.test(ctx.originalUrl)
            }

            if (ignored) return;

            const format = opts.format || ":remote-addr :method :http-version :url :referrer :content-length :user-agent :status :request-time :body-bytes";

            var logStr = "";
            if (util.isFunction(format)) {
                try {
                    logStr = format(ctx);                    
                } catch (err) {
                }
            } else if (util.isString(format)) {
                const formats = {
                    ":remote-addr": ctx.ip,
                    ":method": ctx.method,
                    ":http-version": `HTTP/${ctx.req.httpVersion}`,
                    ":url": ctx.originalUrl,
                    ":content-length": `${ctx.headers['content-length'] || 0}Bytes`,
                    ":status": ctx.status,
                    ":user-agent": ctx.headers['user-agent'],
                    ":request-time": `${(end[0] * 1e3 + end[1] / 1e6).toFixed(2)}ms`,
                    ":referrer": ctx.headers['referrer'] || ctx.origin,
                    ":body-bytes": `${ctx.length}Bytes`,
                    ":body": (ctx.body || "").toString()
                };

                logStr = ("" + format).split(' ').map(item => {
                    let logItem;
                    if (item === ":body") {
                        try {
                            logItem = JSON.stringify(ctx.body)
                        } catch (err) {
                            logItem = "" + ctx.body; 
                        }
                    } else {
                        logItem = formats[item] || ctx.headers[item.replace(/^:/,'')] || ctx.cookies.get(item.replace(/^:/,''));
                    }
                    return logItem;
                }).join(' - ');
            }

            if (logStr) {
                logger.info(logStr);
            }
        });
    }
}

exports.app = function (opts) {
    var logger = createLogger("app", opts);

    return function (ctx, next) {
        if (ctx.logger) return next();

        ctx.logger = {};
        ctx.logger.appenders = logger.appenders;

        ["trace", "debug", "info", "warn", "error", "fatal"].forEach(method => {
            ctx.logger[method] = function () {
                const msg = util.format.apply(util, arguments);
                logger[method](msg);
            };
        });

        try {
            // change the log level dynamically            
            const level = ctx.app.context.logLevel;
            level && ctx.logger.appenders.forEach(appender => {
                appender.level = ln.LEVEL[level.toUpperCase()];
            });
        } catch (err) {
            ctx.throw(err);
        }
        return next();
    }
}