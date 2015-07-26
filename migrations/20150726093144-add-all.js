var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

var async = require('async');
 
exports.up = function (db, callback) {
  async.series([
    db.runSql.bind(db, "CREATE TABLE location (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, start_point TEXT NOT NULL, created DATETIME DEFAULT CURRENT_TIMESTAMP, updated DATETIME);"),
    db.runSql.bind(db, "CREATE TABLE path (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, created DATETIME DEFAULT CURRENT_TIMESTAMP, updated DATETIME, location_id INTEGER NOT NULL, FOREIGN KEY (location_id) REFERENCES location(id) ON DELETE CASCADE);"),
    db.runSql.bind(db, "CREATE TABLE path_segment (id INTEGER PRIMARY KEY AUTOINCREMENT, bearing REAL NOT NULL, distance REAL NOT NULL, elevation REAL NOT NULL, angle_format TEXT NOT NULL, distance_format TEXT NOT NULL, created DATETIME DEFAULT CURRENT_TIMESTAMP, path_id INTEGER NOT NULL, FOREIGN KEY (path_id) REFERENCES path(id) ON DELETE CASCADE);"),
    db.runSql.bind(db, "CREATE TABLE path_annotation (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT NOT NULL, message TEXT NOT NULL, created DATETIME DEFAULT CURRENT_TIMESTAMP, path_id INTEGER NOT NULL, start_segment_id INTEGER NOT NULL, end_segment_id INTEGER NOT NULL, FOREIGN KEY (path_id) REFERENCES path(id), FOREIGN KEY (start_segment_id) REFERENCES path_segment(id), FOREIGN KEY (end_segment_id) REFERENCES path_segment(id) ON DELETE CASCADE);")
  ], callback);
};
 
exports.down = function (db, callback) {
  async.series([
    db.dropTable.bind(db, 'location'),
    db.dropTable.bind(db, 'path'),
    db.dropTable.bind(db, 'path_segment'),
    db.dropTable.bind(db, 'path_annotation')
  ], callback);
};