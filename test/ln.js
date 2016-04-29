"use strict";

const fs = require('fs');
const path = require('path');

const test = require('ava').test;
const request = require('supertest');
const Moment = require('mini-moment');
const Koa = require('koa');
const Router = require('koa-router');
const logger = require('../src/');

function getDateFmt(moment) {
    return `${moment.get('year')}-${moment.get('month')}-${moment.get('date')}`;
}

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

test.cb('access file log', t => {
    const app = new Koa();
    const router = new Router();

    app.use(logger.access({ type: "file", "path": "./logs/" }));

    router.get('/', ctx => {
        ctx.body = "hello";
    });

    app.use(router.routes());

    request(app.listen())
        .get('/')
        .expect(200)
        .end(function (err, res) {
            const file = `./logs/access.${getDateFmt(new Moment())}.log`;
            t.is(true, fs.existsSync(file));
            const log = fs.readFileSync(file);
            t.is(true, log.indexOf('200') > -1);
            t.end();
        })
});

test.cb('app file log', t => {
    const app = new Koa();
    const router = new Router();

    app.use(logger.app({ type: "file", "path": "./logs/" }));

    router.get('/', ctx => {
        ctx.logger.info('hello')
        ctx.body = "hello";
    });

    app.use(router.routes());

    request(app.listen())
        .get('/')
        .expect(200)
        .end(function (err, res) {
            t.is(true, fs.existsSync(`./logs/app.${getDateFmt(new Moment())}.log`));
            t.end();
        })
});

// test.cb('json log', t => {
//     const app = new Koa();
//     const router = new Router();

//     app.use(logger.access({type: "file" , "path": "./logs/" , json: true}));

//     router.get('/', ctx => {
//         ctx.body = "hello";
//     });

//     app.use(router.routes());

//     request(app.listen())
//         .get('/')
//         .expect(200)
//         .end(function (err, res) {
//             const moment = new Moment();
//             const log = fs.readFileSync(`./logs/access.${getDateFmt(new Moment())}.log`);
//             const json = JSON.parse(log);
//             t.is(true, json.m.split(' - ')[3] === "/");
//             t.end();
//         })
// });

