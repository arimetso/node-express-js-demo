
var express = require("express");
var app = express.createServer();

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(":memory:");

db.serialize(function() {
    db.run("create table user (id integer primary key autoincrement, login text, password text, fullname text)");
    var stmt = db.prepare("insert into user (login, password, fullname) values (?, ?, ?)");
    stmt.run("juuseri", "passu0", "Testi I. Juuseri");
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
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: "23fc88c72a02e801223813723ed012f6" }));

app.set('view options', {
  layout: false
});

app.get("/", function(req, res) {
    res.render("index.jade", {
        title: "Node.js + Express + Jade",
        user: req.session.user
    });
});

app.post("/login", function(req, res) {
    var username = req.param("login_name"),
        password = req.param("login_passwd");
    if (username == undefined || password == undefined) {
        console.log("Login failed: no username or password");
        res.send(400);
        return;
    }

    db.get("select id, fullname from user where login = ? and password = ?", [ username, password ], function(err, row) {
        if (row) {
            req.session.user = { id: row.id, name: row.fullname };
            res.redirect('back');
        } else if (err) {
            console.log("Login failed due to SQLite error", err);
            res.send(400);
        } else {
            console.log("Login failed: user not found.");
            res.send(403);
        }
    });
});

app.listen(8080);

