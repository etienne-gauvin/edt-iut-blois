$(function()
{
  $('.image').css('height', $('.image').width())
  
  // Mise à jour de la hauteur des blocs
  $(window).resize(function() {
    $('.image').css('height', $('.image').width());
  });
  
  if (Storage)
  {
    // Sélection du fond actuel
    if (typeof localStorage.backgroundUrl === 'string' && localStorage.backgroundUrl[0] === '/')
      $('.image[data-image="' + localStorage.backgroundUrl + '"]').addClass('selected');
    else if (localStorage.backgroundUrl)
      $('[name="background-url"]').addClass('selected').val(localStorage.backgroundUrl);
    else
      localStorage.backgroundUrl = "/images/backgrounds/00-default.png";
    
    $('html').css('background-image', 'url(' + localStorage.backgroundUrl + ')');
    
    $('.image').click(function()
    {
      localStorage.backgroundUrl = $(this).attr('data-image');
      $('html').css('background-image', 'url(' + localStorage.backgroundUrl + ')');
      
      $('.selected').removeClass('selected');
      $(this).addClass('selected');
    });
    
    $('.background-url').submit(function(evt)
    {
      evt.preventDefault();
      
      if ($('[name="background-url"]').val() != "")
      {
        $('.image.selected').removeClass('selected');
        localStorage.backgroundUrl = $('[name="background-url"]').val()
        $('[name="background-url"]').addClass('selected');
        $('html').css('background-image', 'url(' + localStorage.backgroundUrl + ')');
      }
      else {
        $(this).removeClass('selected');
        localStorage.backgroundUrl = "/images/backgrounds/00-default.png";
        $('.image[data-image="' + localStorage.backgroundUrl + '"]').addClass('selected');
      }
    });
  }
  else
  {
    $('.backgrounds').hide();
    $('.error-container').show();
  }
})
