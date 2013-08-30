
/**
 * Dépendances
 */

var express = require('express')
  , indexRoute = require('./routes')
  , edtRoute = require('./routes/edt')
  , http = require('http')
  , swig = require('swig')
  , consolidate = require('consolidate')
  , path = require('path')
  , gzippo = require('gzippo');

var app = express();

/**
 * Configuration
 */

app.configure(function()
{
    process.env.TZ = 'Europe/Paris';
    app.set('port', process.env.PORT || 3443);
    app.set('views', __dirname + '/views');
    app.engine('swig', consolidate.swig);
    app.set('view engine', 'swig');
    app.set('view options', { layout: false });
    app.set('view cache', false);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('fuojXpdxyw7f1zKm9P80tUzVijEVtAEEozpZtuPrP0miIXcngSCM7mIeYEEnP8I'));
    app.use(express.session());
    app.use(app.router);
    
    app.use(require('less-middleware')({ src: __dirname + '/public' }));
 // app.use(express.static(path.join(__dirname, 'public')));
    app.use(gzippo.staticGzip(path.join(__dirname, 'public')));
    
    // Filtre(s) personnalisé(s) pour Swig
    swig.init({ filters: {
        isNumber: function(input) {
            return !isNaN(parseFloat(input)) && isFinite(input);
        }
    }});
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

/**
 * Routes
 */

app.get('/', indexRoute.index);
app.get('/edt/:year/:week/:group.json', edtRoute.edt);
app.get('/edt/:year/:week/:group/:update.json', edtRoute.edt);

// Page 404
app.use(function(req, res, next) {
    console.log(new Date + ' : ' + req.ip);
    res.status(404);
    res.render('error-404');
});

/**
 * Serveur
 */

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
