"use strict";

const fs = require('fs');
const path = require('path');

const test = require('ava').test;
const request = require('supertest');
const Moment = require('mini-moment');
const Koa = require('koa');
const Router = require('koa-router');
const logger = require('../src/');

function removeLogs() {
    const files = fs.readdirSync('./logs/');

    files.forEach(file => {
        try {
            fs.unlinkSync(path.join('./logs/', file));
        } catch (err) {
            console.log(err)
        }
    });
}

test.beforeEach("remove logs", t => {
    removeLogs();
});

test.cb('exist access.log', t => {
    const app = new Koa();
    const router = new Router();

    app.use(logger.access({ type: "file", path: "./logs/" }));

    router.get('/', ctx => {
        ctx.body = "hello";
    });

    app.use(router.routes());

    request(app.listen())
        .get('/')
        .expect(200)
        .end(function (err, res) {
            const file = `./logs/access.${new Moment().format()}.log`;
            t.is(true, fs.existsSync(file));
            const log = fs.readFileSync(file);
            t.is(true, log.indexOf('200') > -1);
            t.end();
        })
});

test.cb('correct access log items', t => {
    const app = new Koa();
    const router = new Router();

    app.use(logger.access({ type: "file", path: "./logs/" }));

    router.get('/', ctx => {
        ctx.body = "hello";
    });

    app.use(router.routes());

    request(app.listen())
        .get('/')
        .expect(200)
        .end(function (err, result) {
            const res = result;
            const file = `./logs/access.${new Moment().format()}.log`;
            const log = fs.readFileSync(file).toString();
            const items = log.split(/[\n\r]+/);
            items.pop();
            const current = items.pop();
            
            const logItems = current.split(' - ');
            const headers = res.headers;
            
            t.is(true, logItems[13] === `${headers['content-length']}Bytes`);
            t.is(true, logItems[11] === "" + res.statusCode);
            t.is(true, logItems[7] === res.req.path);
            t.is(true, logItems[5] === res.req.method);
            t.end();
        })
});

test.cb('exist app.log', t => {
    const app = new Koa();
    const router = new Router();

    app.use(logger.app({ type: "file", path: "./logs/" }));

    router.get('/', ctx => {
        ctx.logger.info('hello')
        ctx.body = "hello";
    });

    app.use(router.routes());

    request(app.listen())
        .get('/')
        .expect(200)
        .end(function (err, res) {
            t.is(true, fs.existsSync(`./logs/app.${new Moment().format()}.log`));
            t.end();
        })
});


