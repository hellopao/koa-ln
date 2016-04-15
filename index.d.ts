
export interface LogOptions {
    /**
     * name of the logger,it will be the log file's prefix name too
     * default is access/app;
     */
    name?: string;

    /**
     * log type
     * default is console
     */
    type?: "file" | "console";

    /**
     * log path,it is required when type is file
     */
    path?: string;

    /**
     * date format of the log's filename
     * default is 'Y-M-D', that means the log's filename will be app/access-2016-04-15.log
     */
    dateFormat?: string;

    /**
     * format string
     * default is ":remote-addr :method :http-version :url :referrer :content-length :user-agent :status :request-time :body-bytes" 
    */
    format: string;

    /**
     * function to convert the json data to string
     */
    formatter?: (json: JSON) => string;

    /**
     * log level default is info
     */
    level?: "trace" | "debug" | "info" | "warn" | "error" | "fatal";

}

export interface Logger {
    trace: (msg: string) => void;
    debug: (msg: string) => void;
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
    fatal: (msg: string) => void;
}

export interface Context extends Koa.Context {
    logger: Logger;
}
export default function logger(opts?: LogOptions): { (ctx: Koa.Context, next?: () => any): any };

export function appLogger(opts?: LogOptions): { (ctx: Koa.Context, next?: () => any): any };
