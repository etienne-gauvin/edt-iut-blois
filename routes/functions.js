
/**
 * Dépendances
 */

var fs = require('fs')
  , https = require('https')
  , querystring = require('querystring');

// URL de connexion à la base de données
if(process.env.VCAP_SERVICES) {
    var env = JSON.parse(process.env.VCAP_SERVICES);
    var mongo = env['mongodb-1.8'][0]['credentials'];
}
else {
    var mongo = {
        "hostname":"localhost",
        "port":27017,
        "username":"",
        "password":"",
        "name":"",
        "db":"db"
    }
}
var generate_mongo_url = function(obj) {
    obj.hostname = (obj.hostname || 'localhost');
    obj.port = (obj.port || 27017);
    obj.db = (obj.db || 'test');
    if(obj.username && obj.password){
        return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
    else{
        return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
}

var mongourl = generate_mongo_url(mongo);
var db = require("mongojs").connect(mongourl, ['edts']);

// Juste le user-agent
var userAgent = "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; CIBA; .NET4.0C; .NET4.0E; .NET CLR 2.0.50727; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729)"

/**
 * Cherche un calendrier, dans la base de donnée ou sur le site de l'IUT.
 * @param year
 * @param week
 * @param group
 * @param minUpdate la date minimale de dernière mise à jour de l'emploi du temps (par défaut, "hier")
 * @param callback appelé après l'exécution, avec les paramètres edt (l'emploi du temps, ou null) et err (un éventuel message d'erreur)
 */
exports.getEdT = function(year, week, group, minUpdate, phpsessid, callback)
{
    var relativeWeek = exports.getRelativeWeek(year, week);
    
    if (!minUpdate)
        minUpdate = new Date((new Date()).setTime((new Date).getTime() - 24 * 60 * 60 * 1000));
    
    // Cherche l'emploi du temps dans la base de données
//     console.log(db.error());
    
    db.edts.findOne({year: year, week: week, group: group, lastUpdate: {$gt: minUpdate}}, function(err, edt)
    {
        if (err || !edt)
        {
            console.log("Aucun emploi du temps trouvé en base de donnée.");
            
            // Récupération de l'emploi du temps sur le site de l'IUT
            getCalendarFile(relativeWeek, group, phpsessid, function(content, err)
            {
                if (!content || err) {
                    callback(null, err);
                }
                else {
                    var events = convertEdT(content);
                    
                    if (!events || events.length == 0) {
                        console.log("Emploi du temps vide !");
                        callback(null, "Emploi du temps introuvable, celui-ci n'est peut-être pas encore publié, ou il n'y a pas cours cette semaine.");
                    }
                    else {
                        var edt = {
                            year: year,
                            week: week,
                            group: group,
                            lastUpdate: new Date,
                            events: events
                        }
                        
                        // Insertion en base de donnée
                        db.edts.insert(edt);
                        
                        // Renvoi des données
                        callback(edt);
                    }
                }
            });
        }
        else {
            // Suppression de l'identifiant utilisé par la base de données
            edt._id = undefined;
            delete edt._id;
            
            console.log("Emploi du temps trouvé en base de donnée (dernier maj du " + edt.lastUpdate +").");
            callback(edt);
        }
    });
    
}

/**
 * Cherche l'URL d'un calendrier, et récupère le contenu du fichier associé.
 * @param relativeWeek
 * @param group
 * @param callback est appelé après exécution, avec les paramètres content et err (message d'une éventuelle erreur)
 */
function getCalendarFile(relativeWeek, group, phpsessid, callback)
{
    // Paramètres POST
    var postData = querystring.stringify({
        TYPE: 'ELEVE',
        DEPARTEMENT: '',
        ANNEE: '',
        SEMAINE: relativeWeek,
        GROUPE: group,
        AFFINE: '1',
        EXPORT: '1',
        EXPORT_DECALAGE: '0',
        CODE_PROF: '',
        FORP: '',
        SALLE: ''
    });
    
    console.log("Recherche de l'URL pour la semaine " + relativeWeek + " du groupe " + group);
    
    // Paramètres de la requête HTTPS
    var params1 = {
        hostname: 'wws.blois.univ-tours.fr',
        port: 443,
        path: '/edt/edtksup_affiche.php',
        method: 'POST',
        headers: {
          'Cookie': [phpsessid],
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': postData.length
        }
    };
    
    // Envoi de la requête
    var data = '';
    var req1 = https.request(params1, function(res1)
    {
        res1.setEncoding('utf8');
        
        res1.on('data', function (chunk) {
            data += chunk;
        });
        
        res1.on('end', function ()
        {
            var m = data.match(/window\.open\("(.+)","Export"/);
            
            if (m && m[1] != undefined)
            {
                /// Initialisation de la 2ème requête
                var params2 = {
                    hostname: 'wws.blois.univ-tours.fr',
                    port: 443,
                    path: '/edt/' + m[1],
                    method: 'GET',
                    headers: {
                      'Cookie': [phpsessid]
                    }
                };
                
                var edtStr = '';
                var req1 = https.request(params2, function(res2)
                {
                    res2.setEncoding('utf8');
                    
                    res2.on('data', function (chunk) {
                        edtStr += chunk;
                    });
                    
                    res2.on('end', function ()
                    {
                        console.log('Emploi du temps récupéré, longueur: ' + edtStr.length);
                        callback(edtStr);
                    });
                });
                
                req1.end();
                
                req1.on('error', function(e)
                {
                    console.log("Impossible de récupérer le calendrier : ", e);
                    callback(null, "Une erreur est survenue, l'emploi du temps est introuvable.");
                });
            }
            else {
                console.log('HEADERS: ' + JSON.stringify(res1.headers));
                console.log("URL introuvable dans la page.");
                callback(null, "Emploi du temps introuvable, celui-ci n'est peut-être pas encore publié, ou il n'y a pas cours cette semaine.");
            }
        });
    })
    
    req1.write(postData);
    req1.end();
    
    req1.on('error', function(e)
    {
        console.log("Une erreur de connexion est survenue : ", e);
        callback(null, "Une erreur est survenue, l'emploi du temps est introuvable.");
    });
}

/**
 * Retourne un identifiant de session PHP
 */
exports.getPHPSessId = function(callback)
{
    // Paramètres de la requête HTTPS
    var params = {
        hostname: 'wws.blois.univ-tours.fr',
        port: 443,
        path: '/edt/edtksupn.php',
        method: 'GET'
    };
    
    // Envoi de la requête
    var req = https.request(params, function(res) {
      
      var cookies = res.headers['set-cookie'] || res.headers['Set-Cookie'];
      
      for (var icookie in cookies)
      {
        if (cookies[icookie].search(/^PHPSESSID=/) == 0)
        {
          console.log(cookies[icookie]);
          callback(cookies[icookie])
          break;
        }
      }
      
      req.abort();
    })
    
    req.end();
    
    req.on('error', function(e)
    {
        console.log("Une erreur de connexion est survenue lors de la récupération du PHPSESSID : ", e);
        callback(null, "Une erreur est survenue, l'emploi du temps est introuvable.");
    });
}

/**
 * Traite un emploi du temps textuel et renvoie le résultaten JSON.
 * @param edtStr l'emploi du temps sous forme 'brute'
 * @return object l'emploi du temps, taillé pour la base de donnée
 */

function convertEdT(edtStr)
{
    var edtLines = edtStr.split('\n');
    
    var edt = [];
    var currentEventIndex = null;
    
    for (var i in edtLines)
    {
        var line = edtLines[i];
        
        var m = line.match(/^(.+):(.+)$/);
        
        if (m != null && m.length == 3)
        {
            var key = m[1];
            var val = m[2];
            
            if (key == 'BEGIN' && val == 'VEVENT')
            {
                var currentEventIndex = edt.push({
                    location: null,
                    summary: null,
                    categories: null,
                    description: null,
                    teacher: null,
                    dtstart: null,
                    dtend: null,
                    status: null
                }) - 1;
            }
            
            else if (key == 'BEGIN' || key == 'END') {}
            
            // Datetime de fin du cours
            else if (key == 'DTSTART;TZID=Europe/Paris')
            {
                edt[currentEventIndex].dtstart = exports.parseDate(val);
            }
            
            // Datetime de fin du cours
            else if (key == 'DTEND;TZID=Europe/Paris')
            {
                edt[currentEventIndex].dtend = exports.parseDate(val);
            }
            
            // Description (pour récupérer le nom du prof)
            else if (key == 'DESCRIPTION' && edt[currentEventIndex].summary && edt[currentEventIndex].location)
            {
              // Échapper les caractères pouvant poser quelques problèmes
              // dans l'expression régulière
              var escape = function(s) {
                return s
                  .replace(/\(/g, '\\(')
                  .replace(/\)/g, '\\)')
                  .replace(/\./g, '\\.')
                  .replace(/\[/g, '\\[')
                  .replace(/\]/g, '\\]')
                  .replace(/\*/g, '\\*')
                  .replace(/\+/g, '\\+')
              } 
              
              var summary =  escape(edt[currentEventIndex].summary);
              var location = escape(edt[currentEventIndex].location)
              var m = val.match(new RegExp('^' + summary + ' - (.+) - ' + location + '$'));
              
              if (m && m[1])
                  edt[currentEventIndex].teacher = m[1];
              
              edt[currentEventIndex].description = val;
            }
            
            // Tous les autres éléments
            else {
                edt[currentEventIndex][key.toLowerCase()] = val;
            }
        }
    }
    
    /// Remise en ordre
    edt.sort(function (a, b)
    {
        if (!a.dtstart)
            a.dtstart = new Date(new Date().setTime(0));
        
        if (!b.dtstart)
            b.dtstart = new Date(new Date().setTime(0));
        
        return a.dtstart.getTime() - b.dtstart.getTime();
    });
    
    return edt;
}

/**
 * Retourne la liste des groupes sous forme de JSON.
 * @return string
 */
exports.getGroupsJSON = function() {
    return fs.readFileSync(fs.realpathSync('./public/javascripts/groups.json'));
}

/**
 * Retourne la liste des groupes.
 * @return object
 */
exports.getGroups = function() {
    return JSON.parse(exports.getGroupsJSON());
}

/**
 * Vérifie si une variable est un nombre.
 * @return bool
 */
exports.isNumber = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Parse une date YYYYMMDDTHHMMSS
 * @return Date
 */
exports.parseDate = function(str) {
    return new Date(str.replace(
        /^(\d{4})(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d)$/,
        '$4:$5:$6 $2/$3/$1'
    ));
}

/**
 * Retourne le numéro d'une semaine dans l'année.
 * http://javascript.about.com/library/blweekyear.htm
 */
exports.getWeek = function(date)
{
    var onejan = new Date(date.getFullYear(), 0, 1);
    return Math.ceil(((date - onejan) / 86400000 + onejan.getDay() + 1) / 7);
}

/**
 * Retourne le numéro de d'une semaine relative à maintenant.
 */
exports.getRelativeWeek = function(year, week) {
    var now = new Date;
    return week - exports.getWeek(now) + (year - 1900 - now.getYear()) * 52;
}

/**
 * Retourne le numéro de d'une semaine relatif à maintenant.
 */
exports.getRelativeWeekByDate = function(date) {
    var now = new Date;
    return exports.getWeek(date) - exports.getWeek(now) + (date.getYear() - now.getYear()) * 52;
}
