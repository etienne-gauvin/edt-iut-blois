<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title> Changer de fond d'écran </title>
    <meta name="viewport" content="width=device-width" />
    <meta name="HandheldFriendly" content="True" />
    <meta name="MobileOptimized" content="320" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <link rel="apple-touch-icon-precomposed" href="/images/touch-icon.57.png">
    <link rel="apple-touch-icon-precomposed" sizes="72x72" href="/images/touch-icon.72.png">
    <link rel="apple-touch-icon-precomposed" sizes="114x114" href="/images/touch-icon.114.png">
    
    <link rel="stylesheet" type="text/css" href="/stylesheets/ink-min.css" />
    <link rel="stylesheet" type="text/css" href="/stylesheets/font-awesome.css" />
    <link rel="stylesheet" type="text/css" href="/stylesheets/main.css" />
    
    <script type="text/javascript" src="/javascripts/zepto.min.js"></script>
    <script type="text/javascript" src="/javascripts/ink.min.js"></script>
  </head>
  <body>
    <!--[if lt IE 9]>
    <p class="chromeframe">Vous utilisez un navigateur dépassé. <a href="http://browsehappy.com/">Mettez le à jour maintetant</a> ou <a href="http://www.google.com/chromeframe/?redirect=true">installez Google Chrome Frame</a> pour une meilleur expérience sur ce site.</p>
    <![endif]-->
    
    <div class="ink-grid set-background">
      <noscript>
        <div class="wrapper nojs-container">
          <h1 class="icon-warning-sign icon-3x"></h1>
          <p>
            <strong>Ce site nécessite Javascript pour fonctionner</strong><br />
            Malheureusement il semble qu'il soit désactivé ou absent dans votre navigateur.
          </p>
        </div>
      </noscript>
      
      <div class="column-group gutters">
        <div class="error-container large-100 medium-100 small-100" style="display:none">
          <p>Votre vieux navigateur ne permet pas de changer de fond d'écran. Mettez-le à jour :)</p>
        </div>
      </div>
      
      <div class="column-group gutters home-link">
        <div class="large-20 medium-33 small-100">
          <a href="/" class='button' style="display: block;"><span class='icon-reply'></span> Retour</a>
        </div>
        <div class="large-80 medium-66 small-100">
          <form class="background-url button">
            <span class='icon-globe'></span> Saisissez l'URL d'une image : <small class="hide-small">(<i>Entrée</i> pour valider)</small> ou choisissez-en une dans la liste. 
            <input type="text" placeholder="http://" name="background-url" />
            <input type="submit" class="hide-large" />
          </form>
        </div>
      </div>
      
      <ul class="backgrounds column-group gutters unstyled">
        {% for imagepath in backgrounds %}
          <li class="large-20 medium-33 small-50">
            <div class="image" style="background-image:url('/images/backgrounds/{{ imagepath }}')" data-image="/images/backgrounds/{{ imagepath }}"></div>
          </li>
        {% endfor %}
      </ul>
    </div>
    
    <script src="/javascripts/set-background.js"></script>
  </body>
</html>
