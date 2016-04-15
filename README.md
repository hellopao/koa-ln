# koa-ln

ln logger middleware for koa2

## Installation

```bash
npm install koa-ln 
```

## Usage

### access log

```javascript

const Koa = require('koa');
const logger = require('koa-ln');

const app = new Koa();

app.use(logger());

app.listen(80)
```

### app log 

```javascript

const Koa = require('koa');
const logger = require('koa-ln');

const app = new Koa();

app.use(logger());
app.use(logger.appLogger());

app.use(ctx => {
    ctx.logger.info("hello world");
    ctx.body = "hello world";
})
app.listen(80)
```

## Options

### name

name of the logger,it will be the log file's prefix name too

default is access/app;

### type

log type

default is console

### dateFormat

date format of the log's filename

default is 'Y-M-D', that means the log's filename will be app/access-2016-04-15.log

### format

format string

default is ":remote-addr :method :http-version :url :referrer :content-length :user-agent :status :request-time :body-bytes"

### formatter

function to convert the json data to string

### level

log level

default is info

### path

log path

it is required when type is file