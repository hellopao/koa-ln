/// <reference path="typings/koa/koa.d.ts" />

import * as Koa from "koa";

export interface LogOptions {
    /**
     * name of the logger, defaults to app/access
     */
    name?: string;

    /**
     * log type, defaults to console
     */
    type?: "file" | "console";

    /**
     * log file path, it is required when opts.type is file
     */
    path?: string;

    /**
     * use json log , defaults to false
     */
    json?: boolean;
    
    /**
     * date format of the log's filename, defaults to YYYY-MM-DD
     */
    dateFormat?: string;

    /**
     * log body format , defaults to ":remote-addr :method :http-version :url :referrer :content-length :user-agent :status :request-time :body-bytes" 
    */
    format?: ((ctx: Koa.Context) => string) | string;

    /**
     * function to convert the json data to string
     */
    formatter?: (json: JSON) => string;

    /**
     * log level, defaluts to info
     */
    level?: "trace" | "debug" | "info" | "warn" | "error" | "fatal";

}

export interface Logger {
    trace: (...msg: string[]) => void;
    debug: (...msg: string[]) => void;
    info: (...msg: string[]) => void;
    warn: (...msg: string[]) => void;
    error: (...msg: string[]) => void;
    fatal: (...msg: string[]) => void;
}

export interface Context extends Koa.Context {
    logger: Logger;
}

export function access(opts?: LogOptions): { (ctx: Koa.Context, next?: () => any): any };

export function app(opts?: LogOptions): { (ctx: Koa.Context, next?: () => any): any };
