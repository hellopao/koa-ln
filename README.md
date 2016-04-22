# koa-ln

ln logger middleware for koa2

## Installation

```bash
npm install koa-ln 
```

## Usage

```javascript

const Koa = require('koa');
const logger = require('koa-ln');

const app = new Koa();

app.use(logger.access());
app.use(logger.app());

app.use(ctx => {
    ctx.logger.info("hello world");
    ctx.body = "hello world";
})
app.listen(80)
```

## Options

- `name` {string}

 name of the logger, defaults to app/access

- `type` {"file" | "console"}

 log type, defaults to console

- `dateFormat` {string}

 date format of the log's filename, defaults to Y-M-D

- `format` {string| Function} 

 log body format , defaults to ":remote-addr :method :http-version :url :referrer :content-length :user-agent :status :request-time :body-bytes"

- `formatter` {Function}

 function to convert the json data to string

- `json` {boolean}

 use json log , defaults to false

- `level` {"trace" | "debug" | "info" | "warn" | "error" | "fatal"}

 log level, defaluts to info

- `path` {string}

 log path, it is required when opts.type is file

## example

```javascript
const Koa = require('koa');
const logger = require('koa-ln');

const app = new Koa();

app.use(logger.access({type: "file", path: "./logs/"}));
app.use(logger.app({type: "file", path: "./logs/", level: "debug"}));

app.use(ctx => {
    ctx.logger.debug("hello world");
    ctx.body = "hello world";
})
app.listen(80)
```

### access.log

    2016-04-18 10:50:50.819 - INFO - access - 908 - ::ffff:127.0.0.1 - GET - HTTP/1.1 - /koa-ln - http://127.0.0.1 - 0Bytes - Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.75 Safari/537.36 - 404 - 12.90ms - 9Bytes

### app.log

    2016-04-18 10:50:50.902 - DEBUG - app - 908 - hello world