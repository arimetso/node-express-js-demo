
var express = require("express");
var app = express.createServer();

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(":memory:");

db.serialize(function() {
    db.run("create table user (id integer primary key autoincrement, login text, password text)");
    var stmt = db.prepare("insert into user (login, password) values (?, ?)");
    stmt.run("juuseri", "passu0");
    stmt.finalize();
});

process.on("exit", function() {
    console.log("Closing database.");
    db.close();
});

app.configure(function() {
    app.use(express.static(__dirname + "/public"));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.set('view options', {
  layout: false
});

app.get("/", function(req, res) {
    res.render("index.jade", {
        title: "Node.js + Express + Jade",
        user: null
    });
});

app.listen(8080);

