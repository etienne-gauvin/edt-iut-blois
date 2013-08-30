<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title> Emploi du temps - I.U.T. de Blois </title>
    <meta name="description" content="Emploi du temps des élèves de l'I.U.T. de Blois" />
    <meta name="viewport" content="width=device-width" />
    <meta name="HandheldFriendly" content="True">
    <meta name="MobileOptimized" content="320">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <link rel="apple-touch-icon-precomposed" href="/images/touch-icon.57.png">
    <link rel="apple-touch-icon-precomposed" sizes="72x72" href="/images/touch-icon.72.png">
    <link rel="apple-touch-icon-precomposed" sizes="114x114" href="/images/touch-icon.114.png">

    <!--
      <PageMap>
        <DataObject type="document">
          <Attribute name="title">Emploi du temps - I.U.T. de Blois</Attribute>
          <Attribute name="description">Emploi du temps de chaque département de l'I.U.T de Blois</Attribute>
          <Attribute name="last_update"></Attribute>
        </DataObject>
      </PageMap>
    -->
    
    <link rel="stylesheet" type="text/css" href="/stylesheets/ink-min.css" />
    <link rel="stylesheet" type="text/css" href="/stylesheets/font-awesome.css" />
    <link rel="stylesheet" type="text/css" href="/stylesheets/main.css" />
    
    <script type="text/javascript" src="/javascripts/zepto.min.js"></script>
    <script type="text/javascript" src="/javascripts/ink.min.js"></script>
    <script type="text/javascript" src="/javascripts/ink-ui.min.js"></script>
    <script type="text/javascript" src="/javascripts/autoload.js"></script>
    <script type="text/javascript" src="/javascripts/html5shiv.js"></script>
  </head>
  <body>
    <!--[if lt IE 9]>
    <p class="chromeframe">Vous utilisez un navigateur dépassé. <a href="http://browsehappy.com/">Mettez le à jour maintetant</a> ou <a href="http://www.google.com/chromeframe/?redirect=true">installez Google Chrome Frame</a> pour une meilleur expérience sur ce site.</p>
    <![endif]-->
    
    <div class="ink-grid">
      <noscript>
        <div class="wrapper nojs-container">
          <h1 class="icon-warning-sign icon-3x"></h1>
          <p>
            <strong>Ce site nécessite Javascript pour fonctionner</strong><br />
            Malheureusement il semble qu'il soit désactivé ou absent dans votre navigateur.
          </p>
        </div>
      </noscript>
      
      <form class="edt column-group gutters">
        <div class="header-container large-100 small-100">
          <header>
            <h1><a href="/">Emploi du temps</a></h1>
          </header>
        </div>
        
        <!-- Liste des groupes -->
        <div class="group-selection-container large-40 medium-40 small-100">
          <h2 class="toggle-visibility closed button">Choisir un groupe <span class='icon-caret-down'></span></h2>
          <fieldset class="hidden">
            {# Affichage de la liste des groupes (macro récursive) #}
            {% macro listGroups _name _group %}
              {% if _group|isNumber %}
                <input type='radio' name='group' value='{{ _group }}' id='group-{{ _group }}' />
                <label for='group-{{ _group }}'>
                  {{ _name }}
                </label>
              {% else %}
                {% if _name != null %}
                  <a href="#" class="toggle-visibility closed">{{ _name }}</a>
                {% endif %}
                <ul class="hidden">
                  {% for _subgroup in _group %}
                    <li>
                      {{ listGroups(loop.key, _subgroup) }}
                    </li>
                  {% endfor %}
                </ul>
              {% endif %}
            {% endmacro %}
          
            {{ listGroups(null, groups.tree) }}
          </fieldset>
        </div>
        
        <!-- Choix de la date -->
        <div class="date-radio-input large-20 medium-33 small-50">
          <label class='button'>
            Cette semaine
            <input type='radio' name='week' value='0' />
            <span></span>
          </label>
        </div>
        
        <div class="date-radio-input large-20 medium-33 small-50">
          <label class='button'>
            La semaine prochaine
            <input type='radio' name='week' value='1' id='radio-next-week' checked />
            <span></span>
          </label>
        </div>
        
        <div class="checkbox-input large-20 medium-33 small-100">
          <label class='button'>
            Forcer la mise à jour
            <input type='checkbox' name='update' />
            <span></span>
          </label>
        </div>
        
        <!-- Validation -->
        <div class="submit-container large-33 medium-33 small-100 large-push-center">
          <button type='submit' class="button" disabled>Voir l'emploi du temps <span class='icon-ok'></span></button>
        </div>
        
        <!-- Messages d'erreur -->
        <div class="error-container large-100 small-100">
          <p class='timeout-warning' style='display:none'>
            Le chargement est un peu long.<br />
            Vérifiez votre connexion à Internet.
          </p>
          <p class='timeout-error' style='display:none'>
            <strong>Le chargement a échoué.</strong><br />
            Vérifiez votre connexion à Internet, et tentez de re-valider le formulaire.
          </p>
          <p class='error' style='display:none'>
          </p>
        </div>
      </form>
      
      <!-- Conteneur de l'emploi du temps -->
      <div class="edt-infos-container" id='edt' style='display:none'>
        
        <!-- Affichage du groupe et de la date de l'edt -->
        <nav class="week-infos">
        </nav>
        
        <!-- Ici vient l'emploi du temps -->
        <section>
          <ul class="edt-container column-group gutters">
            <!--
            <li class="day-container large-20 medium-20 small-100" data-day="X">
              <div class='day'>
                <h3>Day</h3>
                <ol class="event-list unstyled">
                  <li class='event event-course'></li>
                  <li class='event event-meal'>
                    <h4><span class='icon-food'></span> Midi</h4>
                  </li>
                </ol>
              </div>
            </li>
            -->
          </ul>
        </section>
      </div>
      
      <!-- Pied de page -->
      <div class="footer-container column-group gutters">
        <footer class="large-100">
          <ul>
            <li><em>Tous les évènements de l'emploi du temps proviennent de l'IUT de Blois</em></li>
            <li><a href='http://iut-blois.univ-tours.fr/'>Institut Universitaire Technologique de Blois</a></li>
            <li><a href="mailto:etiennegauvin41@gmail.com"><span class='icon-envelope-alt'></span>Contact</a></li>
            <li><a href="https://github.com/etienne-gauvin/edt-iut-blois"><span class='icon-github-alt'></span>Code source</a></li>
            <li><a href="/set-background"><span class='icon-wrench'></span>Changer le fond d'écran</a></li>
          </ul>
        </footer>
      </div>
    </div>
    
    <script>
      Edt = {}
      
      // Liste des groupes
      Edt.groups = {{ groupsJSON }};
    </script>
    
    <!-- Templates -->
    <script type='text/html' id='event_tmpl'>
      <p class="details">
        <span class="startTime"><%=startTime%></span>
        <span class="location"><%=location%></span>
        <span class="endTime"><%=endTime%></span>
      </p><!--
      --><p class="summary">
        <%=summary%><br />
        <span class="teacher"'><%=teacher%></span>
      </p>
    </script>
    
    <script type='text/html' id='week_infos_tmpl'>
      <h2>
        <a id="prev-week" href="#" title="Semaine précédente" data-week="-1"><span class="icon-chevron-left"></span></a>
        Semaine du <%=startDate%> au <%=endDate%>
        <a id="next-week" href="#" title="Semaine suivante" data-week="1"><span class="icon-chevron-right"></span></a>
      </h2>
      <p>Mise à jour effectuée <%=lastUpdate%></p>
    </script>
    
    
    <script src="/javascripts/main.js"></script>
  </body>
</html>
