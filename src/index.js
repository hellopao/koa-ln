"use strict";

const assert = require('assert');
const util = require('util');

const ln = require('ln');
const Moment = require('mini-moment');
const debug = require('debug')('koa-logger-ln');

function createLogger(name,opts) {
    opts = opts || {};  
    debug('%j', opts);
    
    if (opts.type === "file") {
        assert(opts.path, "opts.path is required when opts.type is file");
    }
    
    opts.name = opts.name || name;
    opts.dateFormat = opts.dateFormat || "Y-M-D";
    opts.formatter = opts.formatter || function (json) {
        return util.format("%s - %s - %s - %d - %s", new Moment(json.t).format('yyyy-MM-dd hh:mm:ss.SSS'), Ln.LEVEL[json.l], json.n, json.p, json.m);
    };
    
    return new ln({
        name: opts.name,
        level: opts.level || "info",
        appenders: [{
            type: opts.type || "console",
            path: `[${opts.path}/${opts.name}]${opts.dateFormat}[.log]`,
            formatter: opts.formatter
        }]
    });
}

module.exports = function (opts) {
    
    opts.format = opts.format || ":remote-addr :method :http-version :url :referrer :content-length :user-agent :status :request-time :body_bytes_sent";

    const logger = createLogger("access",opts);
    
    return function (ctx, next) {
        const start = process.hrtime();
        
        return next().then(() => {
            const end = process.hrtime(start);
            
            const formats = {
                "remote-addr": ctx.ip,
                "method": ctx.method,
                "http-version": `HTTP/${ctx.req.httpVersion}`,
                "url": ctx.originalUrl,
                "content-length": `${ctx.headers['content-length'] || 0}Bytes`,
                "status": ctx.status,
                "user-agent": ctx.headers['user-agent'],
                "request-time": `${end[0] * 1e3 + end[1] / 1e6}ms`,
                "referrer": ctx.headers['referrer'] || ctx.origin,
                "body-bytes": `${Buffer.byteLength(ctx.body)}Bytes`
            };
            
            try {
                const logStr = opts.format.split(' ').map(item => {
                    return formats[':' + item];
                });
                const customStr = opts.custom && opts.custom(ctx);
                logger.info(customStr + logStr);
            } catch (err) {
                ctx.throw(err);
            }
        });
    }
}

module.exports.appLogger = function (opts) {
    return function (ctx,next) {
        ctx.logger = createLogger("app",opts);
    }
}