'use strict';


//---------//
// Imports //
//---------//

var bPromise = require('bluebird')
    , Utils = require('node-utils')
    , PGConf = require('pgconf')
    , pg = require('pg').native;


//------//
// Init //
//------//

var using = bPromise.using;
bPromise.promisifyAll(pg);


//-------------//
// Constructor //
//-------------//

function PGWrapper(curPgConf_) {
    PGConf.validatePgConf(curPgConf_);
    this.curPgConf = curPgConf_;
}


//-----------------------//
// Prototyped Extensions //
//-----------------------//

PGWrapper.prototype.RunParameterizedQuery = function RunParameterizedQuery(queryText_, queryValues_) {
    return using(getPostgresConnection(this.curPgConf.GetConnection()), function(conn_) {
        var queryConf = {
            text: queryText_
        };
        if (typeof queryValues_ !== 'undefined') {
            queryConf.values = queryValues_;
        }
        return conn_.queryAsync(queryConf);
    });
};

PGWrapper.prototype.RunQuery = function RunQuery(queryText_) {
    return this.RunParameterizedQuery(queryText_);
};

PGWrapper.prototype.end = function end() {
    return pg.end();
};


//------------------//
// Helper Functions //
//------------------//

function getPostgresConnection(pgConf_) {
    var close;
    return pg.connectAsync(pgConf_).spread(function(client, done) {
        close = done;
        return client;
    }).disposer(function(client) {
        if (close) {
            close();
        }
    });
}


//---------//
// Exports //
//---------//

module.exports = PGWrapper;
