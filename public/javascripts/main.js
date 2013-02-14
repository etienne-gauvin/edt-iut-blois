
/**
    * Affichage / masquage des éléments HTML.
    */

function initHTML()
{
    // Masquage de la sélection des groupes et des sous-groupes
    $('.group-selection-container > div, .group-selection-container .toggle-group + ul').hide();
    
    // Initialisation du contenu du bouton de Validation/Chargement
    $('form.edt [type="submit"] > .valid').show();
    $('form.edt [type="submit"] > .loading').hide();
    
    // Bloquage du bouton de validation
    $('form.edt [type="submit"]').attr('disabled', 'disabled');
    $('form.edt [type="submit"]').hide();
    
    // Sélection automatique du groupe enregistré
    // Et affichage du nom
    // Et débloquage du bouton de validation
    if (Storage && localStorage.group != undefined && groups.list[localStorage.group])
    {
        $('.group-selection-container > h2')
            .addClass('group-selected')
            .text(groups.list[localStorage.group]);
        
        $('[name="group"][value="' + localStorage.group + '"]').attr('checked', true);
        $('#save-group').attr('checked', true);
        
        $('form.edt [type="submit"]').removeAttr('disabled');
        $('form.edt [type="submit"]').show();
    }
}


$(function()
{
    // Initialiser les éléments HTML
    initHTML();
    
    /**
     * Sélection des groupes.
     */
    
    // Afficher/masquer le formulaire
    $('.group-selection-container > h2').click(function()
    {
        $(this).next('div').toggle();
    });
    
    // Afficher/masquer un sous-groupe
    $('button.toggle-group').click(function(evt)
    {
        evt.preventDefault();
        $(this).next('ul').toggle();
    });
    
    // Effacer le groupe sauvegardé
    $('#save-group').click(function()
    {
        if (Storage)
        {
            localStorage.group = undefined;
            delete localStorage.group;
        }
    });
    
    // Sélectioner un groupe : afficher son nom et refermer la sélection des groupes
    $('[name="group"]').click(function(evt)
    {
        if ($('#save-group').attr('checked') && Storage)
            localStorage.group = $(this).val();
        
        $('.group-selection-container > div').hide();
        
        $('.group-selection-container > h2')
            .addClass('group-selected')
            .text(groups.list[$(this).val()]);
        
        $('form.edt [type="submit"]').removeAttr('disabled');
        $('form.edt [type="submit"]').show();
    });
    
    /**
     * Envoi du formulaire et récupération des données.
     */
    
    var isLoading = false;
    $('form.edt').submit(function(evt)
    {
        evt.preventDefault();
        
        if (!isLoading)
        {
            isLoading = true;
            $('form.edt [type="submit"]').attr('disabled', 'disabled');
            $('form.edt [type="submit"] > .valid').hide();
            $('form.edt [type="submit"] > .loading').show();
            
            var year
            , week
            , group = $('[name="group"][value]:checked').val()
            , date = new Date
            , update = !!$('[name="update"]:checked').length;
            
            if ($('#radio-next-week').attr('checked')) {
                console.log('Semaine prochaine.');
                date = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
            }
            
            if (update)
                console.log("Demande de mise à jour.");
            
            // Pré-chargement de la semaine suivante
            var nextWeek = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
            
            getEdt(nextWeek.getYear() + 1900, getWeek(nextWeek), group, update);
            
            // Chargement et affichage de la semaine actuelle
            getEdt(date.getYear() + 1900, getWeek(date), group, update, function (edt)
            {
                $('form.edt [type="submit"]').removeAttr('disabled');
                $('form.edt [type="submit"] > .valid').show();
                $('form.edt [type="submit"] > .loading').hide();
                isLoading = false;
                
                console.log(edt);
                displayEdT(edt);
            });
        }
        
        return false;
    });
    
    /**
     * Récupère un emploi du temps sur le serveur et l'enregistre localement.
     */
    
    function getEdt(year, week, group, update, callback)
    {
        var callback = callback || function(){};
        
        // Vérification du cache
        var existant = getLocalEdT(year, week, group);
        if (Storage && existant && !update)
        {
            console.log("Emploi du temps " + year + '-' + week + '-' + group + " présent en local.");
            callback(existant.edt);
            return;
        }
        
        // Récupération du fichier en ligne
        console.log('/edt/' + year + '/' + week + '/' + group + (update ? '/update.json' : '.json'));
        $.getJSON('/edt/' + year + '/' + week + '/' + group + (update ? '/update.json' : '.json'), function(data)
        {
            if (data && !data.err && Storage)
            {
                var cache = JSON.parse(localStorage.cache || "[]") || [];
                
                // Suppression si il y en avait déjà un avec ces paramètres
                var existant = getLocalEdT(year, week, group);
                if (existant) {
                    cache.splice(existant.i, 1);
                }
                
                cache.push(data);
                
                localStorage.cache = JSON.stringify(cache);
                console.log("Emploi du temps " + year + '-' + week + '-' + group + " enregistré/mis à jour en local.");
            }
            
            callback(data);
        });
    }
    
    /**
     * Vérifie si l'emploi du temps existe en local, et le retourne si c'est le cas.
     */
    function getLocalEdT(year, week, group)
    {
        if (Storage)
        {
            var cache = JSON.parse(localStorage.cache || "[]") || [];
            
            for (var i in cache)
            {
                var edt = cache[i];
                
                if (edt.year == year && edt.week == week && edt.group == group)
                    return {i: i, edt: edt};
            }
        }
    }
    
    /**
     * Affiche l'emploi du temps demandé (avec gestion des erreurs).
     */
    
    function displayEdT(edt)
    {
        var dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
          , monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
        
        if (edt.err) {
            $('.edt-container h2').text(edt.err);
        }
        else
        {
            /// Affichage du nom de la semaine de l'emploi du temps
            var date = getDateByWeek(edt.year, edt.week)
              , start = getMonday(date)
              , end = getSunday(date);
            
            // Pour avoir "1er mars" au lieu de "1 mars"
            var suffStart = (start.getDate() == 1) ? '<sup>er</sup>' : '';
            var suffEnd = (end.getDate() == 1) ? '<sup>er</sup>' : '';
            
            // Si la semaine est coupée entre deux mois, on affiche les noms des deux au lieu d'un seul
            var monthStart = (start.getMonth() != end.getMonth()) ? ' ' + monthNames[start.getMonth()] : '';
            
            $('.week-infos').empty();
            
            var content = tmpl('edt_title_tmpl', {
                startDate: start.getDate() + suffStart + monthStart,
                endDate: end.getDate() + suffEnd + ' ' + monthNames[end.getMonth()],
                lastUpdate: getDifferenceText(new Date(dateParse(edt.edt.lastUpdate)), new Date)
            });
            
            $('.week-infos').prepend(content);
            
            /// Affichage des jours
            $('ol.edt').empty().show();
            
            // Variable pour l'intercours
            var lastTime = null;
            
            $.each(edt.edt.events, function(d, event)
            {
                event.dtstart = new Date(dateParse(event.dtstart));
                event.startTime = getTimeAsString(event.dtstart);
                
                event.dtend = new Date(dateParse(event.dtend));
                event.endTime = getTimeAsString(event.dtend);
                
                // Si ce jour n'existait pas encore
                // Ajout du titre du jour
                if ($('ol.edt > li[data-day="' + event.dtstart.getDay() + '"]').length == 0)
                {
                    var $h3 = $('<h3/>').text(dayNames[event.dtstart.getDay() - 1] + ' ' + event.dtstart.getDate());
                    var $dayli = $('<li/>').attr('data-day', event.dtstart.getDay()).append($h3).append('<ol/>');
                    
                    $('ol.edt').append($dayli);
                    
                    lastTime = null;
                }
                
                // Si l'intercours est > à un 1/4 d'heure
                if (lastTime != null && event.dtstart.getTime() - lastTime.getTime() > 1000 * 60 * 15)
                {
                    var $liInter = $("<li class='interlude' />")
                        .text(getDurationText(lastTime, event.dtstart));
                    
                    if (lastTime.getHours() <= 12 && event.dtstart.getHours() >= 12)
                        $liInter.append(' <span class="icon-food"></span>');
                    
                    
                    $('ol.edt > li[data-day="' + event.dtstart.getDay() + '"] > ol').append($liInter);
                }
                
                lastTime = event.dtend;
                
                // Ajout de l'évènement
                $li = $('<li class="event wrapper" />').html(tmpl('event_tmpl', event));
                
                $('ol.edt > li[data-day="' + event.dtstart.getDay() + '"] > ol').append($li);
            });
        }
        
        $('.edt-container').show();
    }
});

/**
* Affiche les noms des emplois du temps enregistrés.
*/
function showLocalEdTs()
{
    if (Storage)
    {
        var cache = JSON.parse(localStorage.cache || "[]") || [];
        
        for (var i in cache)
        {
            var edt = cache[i];
            console.log(edt.year + '/' + edt.week + ' groupe ' + edt.group);
        }
    }
}

/**
 * Retourne une date en fonction d'un numéro de semaine et une année (sur quatre chiffres)
 */
function getDateByWeek(year, week)
{
    var date = new Date(year, 0, 1);
    date.setTime(date.getTime() + (week - 1) * 604800000); // 604800000 = Millisecondes en 1 semaine
    return date;
}

/**
* Retourne le numéro d'une semaine dans l'année.
* http://javascript.about.com/library/blweekyear.htm
*/
function getWeek(date)
{
    var onejan = new Date(date.getFullYear(), 0, 1);
    return Math.ceil(((date - onejan) / 86400000 + onejan.getDay() + 1) / 7);
}

/**
 * Retourne le début de la semaine (Lundi 00:00:00 000)
 */
function getMonday(date)
{
    var date2 = new Date(date.getTime());
    date2.setHours(0);
    date2.setMinutes(0);
    date2.setSeconds(0);
    date2.setMilliseconds(0);
    date2.setTime(date2.getTime() - (date2.getDay()==0 ? 6 : date2.getDay()-1) * 86400000); // 86400000 = Millisecondes en 1 journée
    return date2;
}

/**
 * Retourne la fin de la semaine (Dimanche 23:59:59 999)
 */
function getSunday(date)
{
    var date2 = new Date(date.getTime());
    date2.setHours(23);
    date2.setMinutes(59);
    date2.setSeconds(59);
    date2.setMilliseconds(999);
    date2.setTime(date2.getTime() + (6 - (date2.getDay()==0 ? 6 : date2.getDay()-1)) * 86400000); // 86400000 = Millisecondes en 1 journée
    return date2;
}

/**
 * Retourne une chaîne exprimant une différence de temps entre deux dates ("3 heures", "2 jours")
 */
function getDifferenceText(d1, d2)
{
    var diff = Math.abs(d2.getTime() - d1.getTime()) / 1000 / 60
      , text = null;
    
    if (diff > 60 * 24 * 7)
        text = Math.floor(diff / (60 * 24 * 7)) + ' semaine' + ((Math.floor(diff / (60 * 24 * 7)) > 1) ? 's' : '');
    
    else if (diff > 60 * 24)
    {
        var j = Math.floor(diff / (60 * 24));
        
        if (j > 1)
            text = j + ' jour' + (j > 1 ? 's' : '');
        else
            text = 'hier';
    }
    else if (diff > 60)
        text = Math.floor(diff / 60) + ' heure' + ((Math.floor(diff / 60) > 1) ? 's' : '');
    
    else if (diff < 2)
        text = "à l'instant";
    
    else
        text = Math.floor(diff) + ' minute' + ((Math.floor(diff) > 1) ? 's' : '');
    
    return text;
}

/**
 * Retourne une chaîne exprimant une différence de temps entre deux dates ("3 heures", "2 jours")
 */
function getDurationText(d1, d2)
{
    var diff = Math.abs(d2.getTime() - d1.getTime()) / 1000 / 60
      , text = '';
    
    if (diff > 60)
    {
        var h = Math.floor(diff / 60);
        text = h + ' h';
        diff = diff % 60;
    }
    
    if (diff > 0)
        text += (text?' ':'') + Math.floor(diff) + (text.length?' min':'');
    
    return text;
}

/**
 * Date.parse with progressive enhancement for ISO 8601 <https://github.com/csnover/js-iso8601>
 * © 2011 Colin Snover <http://zetafleet.com>
 * Released under MIT license.
 */
var origParse = Date.parse, numericKeys = [ 1, 4, 5, 6, 7, 10, 11 ];
function dateParse(date)
{
    var timestamp, struct, minutesOffset = 0;

    // ES5 §15.9.4.2 states that the string should attempt to be parsed as a Date Time String Format string
    // before falling back to any implementation-specific date parsing, so that’s what we do, even if native
    // implementations could be faster
    //              1 YYYY                2 MM       3 DD           4 HH    5 mm       6 ss        7 msec        8 Z 9 ±    10 tzHH    11 tzmm
    if ((struct = /^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/.exec(date))) {
        // avoid NaN timestamps caused by “undefined” values being passed to Date.UTC
        for (var i = 0, k; (k = numericKeys[i]); ++i) {
            struct[k] = +struct[k] || 0;
        }

        // allow undefined days and months
        struct[2] = (+struct[2] || 1) - 1;
        struct[3] = +struct[3] || 1;

        if (struct[8] !== 'Z' && struct[9] !== undefined) {
            minutesOffset = struct[10] * 60 + struct[11];

            if (struct[9] === '+') {
                minutesOffset = 0 - minutesOffset;
            }
        }

        timestamp = Date.UTC(struct[1], struct[2], struct[3], struct[4], struct[5] + minutesOffset, struct[6], struct[7]);
    }
    else {
        timestamp = origParse ? origParse(date) : NaN;
    }

    return timestamp;
};

/**
 * Retourne une heure 00:00
 */
function getTimeAsString(date)
{
    return (date.getHours() < 10 ? '0' : '') + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes()
}

// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
(function(){
  var cache = {};
 
  this.tmpl = function tmpl(str, data)
  {
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :
     
      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +
       
        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +
       
        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");
   
    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };
})();
