
/**
 * Dépendances
 */

var fs = require('fs')
  , https = require('https')
  , querystring = require('querystring')
  , f = require('./functions');

/**
 * Retourne un objet EdT au client (POST: {relativeWeek, group})
 */

exports.edt = function(req, res)
{
    var data = {
        year: req.params.year,
        week: req.params.week,
        group: req.params.group
    };
    
    // Vérification des paramètres
    if (!f.isNumber(data.year) || !f.isNumber(data.week) || !f.isNumber(data.group))
    {
        res.redirect('/404.html');
        return;
    }
    
    // Calcul de la semaine relative
    data.relativeWeek = f.getRelativeWeek(data.year, data.week);
    
    // Impossible de voyager dans le passé
    if (!f.isNumber(data.relativeWeek) || data.relativeWeek < 0 || data.relativeWeek > 99)
    {
        data.error = "Impossible d'afficher les semaines passées";
        res.send(data);
        return;
    }
    
    // Chargement des groupes
    var groups = f.getGroups();
    
    // Intervalle minimale entre les mises à jours
    var interval = new Date((new Date).getTime() - 1000 * 60 * 60);
    
    // Chargement de la semaine
    f.getEdT(data.year, data.week, data.group, (req.params.update ? interval : null), function(edt, err)
    {
        if (!edt && !err) {
            data.err = "Une erreur est survenue, l'emploi du temps est introuvable.";
        }
        else if (!edt && err) {
            data.err = err;
        }
        else {
            data.edt = edt;
        }
        
        res.send(data);
    });
}
