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
    if (localStorage.backgroundUrl && localStorage.backgroundUrl[0] === '/')
    $('.image[data-image="' + localStorage.backgroundUrl + '"]').addClass('selected');
    $('body').css('background-image', 'url(' + localStorage.backgroundUrl + ')');
    
    $('.image').click(function()
    {
      localStorage.backgroundUrl = $(this).attr('data-image');
      $('body').css('background-image', 'url(' + localStorage.backgroundUrl + ')');
      console.log($('body').css('background-image'))
      
      $('.selected').removeClass('selected');
      $(this).addClass('selected');
    });
  }
  else
  {
    $('.backgrounds').hide();
    $('.error-container').show();
  }
})
