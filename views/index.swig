<!doctype html>
<html>
    <head>
        <meta charset="utf-8" />
        <title> Emploi du temps - I.U.T. de Blois </title>
        <meta name="description" content="Emploi du temps des élèves de l'I.U.T. de Blois" />
        <meta name="viewport" content="width=device-width" />

        <!--
            <PageMap>
                <DataObject type="document">
                    <Attribute name="title">Emploi du temps - I.U.T. de Blois</Attribute>
                    <Attribute name="description">Emploi du temps de chaque département de l'I.U.T de Blois</Attribute>
                    <Attribute name="last_update"></Attribute>
                </DataObject>
            </PageMap>
        -->
        
        <link rel="stylesheet" href="/stylesheets/normalize.min.css" />
        <link rel="stylesheet" href="/stylesheets/font-awesome.css" />
        <link rel="stylesheet" href="/stylesheets/main.css" />
        
        <script src="{{ baseUrl }}javascripts/zepto.min.js"></script>
    </head>
    <body>
        <!--[if lt IE 9]>
        <p class="chromeframe">Vous utilisez un navigateur dépassé. <a href="http://browsehappy.com/">Mettez le à jour maintetant</a> ou <a href="http://www.google.com/chromeframe/?redirect=true">installez Google Chrome Frame</a> pour une meilleur expérience sur ce site.</p>
        <![endif]-->
        
        <noscript>
            <div class='wrapper nojs-container'>
                <h1 class='icon-warning-sign icon-3x'></h1>
                <p>
                    <strong>Ce site nécessite Javascript pour fonctionner</strong><br />
                    Malheureusement il semble qu'il soit désactivé ou absent dans votre navigateur.
                    Il faut le réactiver <small>ou utiliser <a href="http://browsehappy.com/">autre chose</a> qu'un dinosaure.</small>.
                </p>
            </div>
        </noscript>
        
        <form class='edt'>
            <div class="header-container wrapper">
                <header>
                    <h1><a href="/">Emploi du temps</a></h1>
                </header>
                
                <!-- Liste des groupes -->
                <div class='group-selection-container'>
                    <h2>Choisir un groupe</h2>
                    <div>
                        <!-- Garder le groupe en mémoire -->
                        <label for='save-group' class='option'><input type='checkbox' id='save-group' /> Se souvenir de mon choix</label>
                        
                        <fieldset>
                            {# Affichage de la liste des groupes (macro récursive) #}
                            {% macro listGroups _name _group %}
                                {% if _group|isNumber %}
                                    <span class='radio-group-container'>
                                        <input type='radio' name='group' value='{{ _group }}' id='group-{{ _group }}' />
                                    </span>
                                    <label for='group-{{ _group }}'>
                                        {{ _name }}
                                    </label>
                                {% else %}
                                    {% if _name != null %}
                                        <button class='toggle-group'>{{ _name }}</button>
                                    {% endif %}
                                    <ul>
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
                        
                        <hr />
                    </div>
                </div>
                
                <!-- Masquage immédiat des groupes -->
                <!-- Et chargement automatique si il y a un groupe sélectionné -->
                <script>
                    $('.group-selection-container > div').hide();
                </script>
                
                <!-- Choix de la date -->
                <nav class='nav-container'>
                    <ul>
                        <li>
                            <input type='radio' name='date' value='current' id='radio-current-week' checked />
                            <label for='radio-current-week'><span class='icon-play'></span> Cette semaine</label>
                        </li>
                        <li>
                            <input type='radio' name='date' value='next' id='radio-next-week' />
                            <label for='radio-next-week'><span class='icon-forward'></span> La semaine prochaine</label>
                        </li>
                        <!--<li><a href="#"><span class='icon-calendar'></span> Voir une autre date</a></li>-->
                    </ul>
                    
                    <label for='checkbox-update' class='option'><input type='checkbox' id='checkbox-update' name='update' />Demander une mise à jour</label>
                    
                    <button type='submit'>
                        <span class='valid'>Voir l'emploi du temps</span>
                        <span class='loading'>
                            <span class='icon-refresh icon-spin'></span>
                            Chargement
                        </span>
                    </button>
                </nav>
                
                <p class='message' style='display:none'>
                    Le chargement est un peu long.<br />
                    Vérifiez votre connexion à Internet.
                </p>
                <p class='error-message' style='display:none'>
                    <strong>Le chargement a échoué.</strong><br />
                    Vérifiez votre connexion à Internet, et tentez de re-valider le formulaire.
                </p>
            </div>
            
            <!-- Conteneur de l'emploi du temps -->
            <div class="edt-container" id='edt' style='display:none'>
                
                <!-- Affichage du groupe et de la date de l'edt -->
                <header class='week-infos wrapper'></header>
                
                <!-- Ici vient l'emploi du temps -->
                <section>
                    <ol class='edt' style='display:none'>
                        <!--
                        <li class='day'>
                            <h3>Day</h3>
                            <ol>
                                <li class='event event-course'></li>
                                <li class='event event-meal'>
                                    <h4><span class='icon-food'></span> Midi</h4>
                                </li>
                            </ol>
                        </li>
                        -->
                    </ol>
                </section>
            </div>
            
            
        </form>
        
        <!-- Pied de page -->
        <div class="footer-container wrapper">
            <footer>
                <ul>
                    <li><em>Tous les évènements de l'emploi du temps proviennent de l'IUT de Blois</em></li>
                    <li><a href='http://iut-blois.univ-tours.fr/'>Institut Universitaire Technologique de Blois</a></li>
                    <li><hr />Design &amp; code par Etienne Gauvin</li>
                    <li><a href="mailto:etiennegauvin41@gmail.com"><span class='icon-envelope-alt'></span> Contactez-moi</a></li>
                    <li><a href="https://github.com/etienne-gauvin/edt-iut-blois"><span class='icon-github-alt'></span> Code source sur Github</a></li>
                </ul>
            </footer>
        </div>
        
        <script>
            var groups = {{ groupsJSON }};
            
            // Ce code est en bas de page pour éviter l'affichage du nom du groupe après une seconde de chargement
            if (Storage && localStorage.group != undefined && groups.list[localStorage.group])
            {
                $('.group-selection-container > h2')
                    .addClass('group-selected')
                    .text(groups.list[localStorage.group]);
        
                $('[name="group"][value="' + localStorage.group + '"]').attr('checked', true);
                $('#save-group').attr('checked', true);
            }
        </script>
        
        <!-- Templates -->
        <script type='text/html' id='edt_title_tmpl'>
            <h2>Semaine du <%=startDate%> au <%=endDate%></h2>
            <p>Mise à jour effectuée il y a <%=lastUpdate%></p>
        </script>
        
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
        
        
        <script src="{{ baseUrl }}javascripts/main.js"></script>
    </body>
</html>
