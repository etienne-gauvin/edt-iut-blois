CACHE MANIFEST
# v2 2013-08-31

# Ne sont jamais mis à jour
/set-background

## Feuilles de style
/stylesheets/ink-min.css
/stylesheets/font-awesome.css
/stylesheets/main.css

## Scripts
/javascripts/zepto.min.js
/javascripts/ink.min.js
/javascripts/main.js

## Images
{% for imagepath in backgrounds %}
/images/backgrounds/{{ imagepath }}{% endfor %}

/images/404.png
/images/touch-icon.57.png
/images/touch-icon.72.png
/images/touch-icon.114.png

## Fonts
/font/ubuntu-b-webfont.woff
/font/ubuntu-r-webfont.woff
/font/fontawesome-webfont.woff
/font/ubuntu-ri-webfont.woff
/font/ubuntu-bi-webfont.woff


# Mettre à jour si possible
NETWORK:
/
/edt/*
