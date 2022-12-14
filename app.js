var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var editRouter = require('./routes/edit');
const { exit } = require('process');
const sqlite3 = require('sqlite3').verbose()

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/delete', function(req, res) {
  console.log("post received");
  var db = new sqlite3.Database('mydb.sqlite3', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("error occurred: " + err);
        exit(1);
      }

      db.exec(`DELETE FROM blogEntries WHERE blog_id = ${req.body.delete_id}`);
      res.render('message', {message: "Delete Successful"});

    });
});

app.post('/edit', function(req, res) {
  console.log("editing");
  var db = new sqlite3.Database('mydb.sqlite3', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("error occurred: " + err);
        exit(1);
      }

      db.exec(`UPDATE blogEntries SET author= '${req.body.author}', 
                                      title = '${req.body.title}',
                                      content = '${req.body.content}'
                                  WHERE blog_id = '${req.body.update_id}'`);
      res.render('message', {message: "Edits Saved"});

    });
})

app.post('/search', function(req, res) {
  console.log("searching");
  var db = new sqlite3.Database('mydb.sqlite3', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("error occurred: " + err);
      }

      db.all(` SELECT name FROM sqlite_master WHERE type='table' AND name = 'blogEntries'`, 
        (err, rows) => {
          if (rows.length === 1) {
            db.all(` SELECT blog_id, author, title, content FROM blogEntries WHERE author='${req.body.searchName}'`, (err, rows) => {
              if (rows.length === 0) {
                res.render('edit', {title: 'No Matches Found', data: null})
              }
              
              console.log("returning " + rows.length + " records");
              res.render('edit', { title: 'Blog entries', data: rows});
            })

          }
          else {
            res.render('edit', { title: "Table is empty", data: null})              
          }

        })
    })
})

app.use('/', indexRouter);
app.use('/index', indexRouter);
app.use('/edit', editRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
