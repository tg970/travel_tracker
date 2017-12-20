$( () => {

// Variables

const $headerBtn = $('.burger')
const $closeheaderBtn = $('.closeheaderBtn');
const $mobileLink = $('.mobileLink');

// Add Recipes Model -------------------------------------
  $headerBtn.on('click', () => {
    $('.mobileLinks').css('display', 'flex');
    $('.burger').css('display', 'none');

  });
  $closeheaderBtn.on('click', () => {
    $('.mobileLinks').css('display', 'none');
    $('.burger').css('display', 'inline-block');
  });

  $mobileLink.on('click', () => {
    $('.mobileLinks').css('display', 'none');
    $('.burger').css('display', 'inline-block');
  });

});
