// constants
var TAILLE_ICONE = 40;
var NB_LIGNES = 8;
var NB_COLONNES = 8;
var NB_ICONES = 6;

// variables
var debug_mode = false;
var hint_mode = false;
var best_score = 0;
var score = 0;
var best_combo = 0;
var combo = 0;
var doigt_init_x = 0;
var doigt_init_y = 0;
var $icone;
var $binome;
var direction = '';
var deplacement_en_cours = false;
var deplacement_interdit = false;
var hint_timeout;
var fast_move_timeout;
var tab_icones = [];
var tab_suppr = [];
var test_horiz = [];
var test_verti = [];
var tab_test = [];
var multiplier = 0;
var images = [
  'images/icones/sprite.png',
  'images/picto/fire.gif',
  'images/picto/star.gif',
  'images/anim/explosion.png'
];



$(function () { // DOM ready

  $(window).resize(on_resize);

  

  $('.icone').live('dragstart', function (e) {
    // prevent image dragging
    e.preventDefault();
  });

  $('#zone_message').live('touchmove mousemove', function (e) {
    // prevent window scrolling
    e.preventDefault();
  });

  $('.icone').live('touchstart mousedown', function (e) {
  
    if (!deplacement_en_cours && !deplacement_interdit) {
      dragmove = false;
      $icone = $(this);
      $icone.css('z-index', 20);
      icone_ligne = Number($icone.attr('data-ligne'));
      icone_col = Number($icone.attr('data-col'));
      if (e.originalEvent.type == 'touchstart') {
        doigt_init_x = e.originalEvent.touches[0].clientX;
        doigt_init_y = e.originalEvent.touches[0].clientY;
      }
      if (e.originalEvent.type == 'mousedown') {
        doigt_init_x = e.originalEvent.clientX;
        doigt_init_y = e.originalEvent.clientY;
      }
      deplacement_en_cours = true;
    }

  });

  $('#zone_jeu').live('touchmove mousemove', function (e) {
    // prevent window scrolling
    e.preventDefault();

    if (deplacement_en_cours) {

      var distance_x, distance_y;

      if (e.originalEvent.type == 'touchmove') {
        distance_x = e.originalEvent.touches[0].clientX - doigt_init_x;
        distance_y = e.originalEvent.touches[0].clientY - doigt_init_y;
      }
      if (e.originalEvent.type == 'mousemove') {
        distance_x = e.originalEvent.clientX - doigt_init_x;
        distance_y = e.originalEvent.clientY - doigt_init_y;
      }

      if (Math.abs(distance_x) > Math.abs(distance_y)) {
        if (distance_x > TAILLE_ICONE / 2) {
          // right
          if (icone_col < NB_COLONNES - 1) {
            dragmove = true;
            $('.icone').removeClass('click adjacent');
            deplacement(icone_ligne, icone_col, icone_ligne, icone_col + 1);
          }
        }

        if (distance_x < -TAILLE_ICONE / 2) {
          // left
          if (icone_col > 0) {
            dragmove = true;
            $('.icone').removeClass('click adjacent');
            deplacement(icone_ligne, icone_col, icone_ligne, icone_col - 1);
          }
        }
      } else {
        if (distance_y > TAILLE_ICONE / 2) {
          // down
          if (icone_ligne < NB_LIGNES - 1) {
            dragmove = true;
            $('.icone').removeClass('click adjacent');
            deplacement(icone_ligne, icone_col, icone_ligne + 1, icone_col);
          }
        }

        if (distance_y < -TAILLE_ICONE / 2) {
          // up
          if (icone_ligne > 0) {
            dragmove = true;
            $('.icone').removeClass('click adjacent');
            deplacement(icone_ligne, icone_col, icone_ligne - 1, icone_col);
          }
        }
      }
    }
  });

  $('#zone_jeu').live('touchend mouseup', function (e) {
    if (deplacement_en_cours) {
      deplacement_en_cours = false;
      $icone.css('z-index', 10);
      if(!dragmove){
        verif_click($icone);
      }
    }
  });

  $('.bt_new_game').live('click', function () {
    // tracking Google Analytics
    _gaq.push(['_trackEvent', 'Fruit Salad', 'Play again', 'Play again']);
    init_game();
  });

  on_resize();

  // wait until every image is loaded to launch the game
  loadimages(images, function () {
    init_game();
  });

  // tabs and panels
  $('.panel').hide();
  $('.tab').click(function(){
    var $this = $(this);
    $('.tab').removeClass('on');
    $this.addClass('on');
    $('.panel').hide();
    $('#'+$this.attr('data-target')).show();
  });
  $('.tab:first').click();

  // android market link
  if($('#android_link').length) {
    var ua = navigator.userAgent;
    ua = ua.toLowerCase();
    if(ua.indexOf('android') > -1) {
      $('#android_link').attr('href', 'market://details?id=com.phonegap.fruit_salad');
    }

  }

});

function verif_click($icone_test) {
  if(!$('.icone.click').length){
    $icone_test.addClass('click');
    icone_test_ligne = Number($icone_test.attr('data-ligne'));
    icone_test_col = Number($icone_test.attr('data-col'));
    add_adjacent(icone_test_ligne, icone_test_col);
  } else {
    $icone_ref = $('.icone.click');
    icone_ref_ligne = Number($icone_ref.attr('data-ligne'));
    icone_ref_col = Number($icone_ref.attr('data-col'));
    icone_test_ligne = Number($icone_test.attr('data-ligne'));
    icone_test_col = Number($icone_test.attr('data-col'));
    // proximity check
    if (
      (icone_ref_ligne == icone_test_ligne && icone_ref_col == icone_test_col - 1) ||
      (icone_ref_ligne == icone_test_ligne && icone_ref_col == icone_test_col + 1) ||
      (icone_ref_ligne == icone_test_ligne - 1 && icone_ref_col == icone_test_col) ||
      (icone_ref_ligne == icone_test_ligne + 1 && icone_ref_col == icone_test_col) 
    ) {
      $icone = $icone_ref;
      deplacement(icone_ref_ligne, icone_ref_col, icone_test_ligne, icone_test_col);
      $('.icone').removeClass('click adjacent');
    } else {
      $('.icone').removeClass('click adjacent');
      $icone_test.addClass('click');
      add_adjacent(icone_test_ligne, icone_test_col);
    }
  }

};

function add_adjacent(ligne, colonne) {
  if (ligne>0) {
    $('.icone[data-ligne=' + (ligne-1) + '][data-col=' + colonne + ']').addClass('adjacent');
  }
  if (colonne>0) {
    $('.icone[data-ligne=' + ligne + '][data-col=' + (colonne-1) + ']').addClass('adjacent');
  }
  if (colonne<NB_COLONNES-1) {
    $('.icone[data-ligne=' + ligne + '][data-col=' + (colonne+1) + ']').addClass('adjacent');
  }
  if (ligne<NB_LIGNES-1) {
    $('.icone[data-ligne=' + (ligne+1) + '][data-col=' + colonne + ']').addClass('adjacent');
  }
}


function init_game() {

  // tracking Google Analytics
  _gaq.push(['_trackEvent', 'Fruit Salad', 'Game start', 'Game start']);

  $('#zone_message').html('');

  score = 0;
  combo = 0;
  NB_ICONES = 6; // normal : 6

  tab_icones = [];
  var rendu_tableau = '';

  clearTimeout(hint_timeout);
  $('.hint').removeClass('hint');
  hint_mode = false;

  on_resize();

  for (var i = 0 ; i < NB_LIGNES ; i++) {
    tab_icones[i] = [];
    for (var j = 0 ; j < NB_COLONNES ; j++) {
      var nb_icon = Math.ceil(Math.random() * NB_ICONES);

      if (i > 1) {
        while(tab_icones[i-2][j] == nb_icon && tab_icones[i-1][j] == nb_icon){
          nb_icon = Math.ceil(Math.random() * NB_ICONES);
        }
      }
      if (j > 1) {
        while(tab_icones[i][j-2] == nb_icon && tab_icones[i][j-1] == nb_icon){
          nb_icon = Math.ceil(Math.random() * NB_ICONES);

          if (i > 1) {
            while(tab_icones[i-2][j] == nb_icon && tab_icones[i-1][j] == nb_icon){
              nb_icon = Math.ceil(Math.random() * NB_ICONES);
            }
          }

        }
      }

      tab_icones[i][j] = nb_icon;
      rendu_tableau += '<div class="icone icone_' + nb_icon + '" data-ligne="' + i + '" data-col="' + j + '" data-icone="' + nb_icon + '" style="top: ' + Number(i*TAILLE_ICONE) + 'px; left: ' + Number(j*TAILLE_ICONE) + 'px;"></div>';
    }
  }  

  $('#zone_jeu').html(rendu_tableau);

  var local_best_score = localStorage.getItem('best_score');
  if (local_best_score != null) {
    best_score = local_best_score;
  }
  $('#best_score_num').html(best_score);

  var local_best_combo = localStorage.getItem('best_combo');
  if (local_best_combo != null) {
    best_combo = local_best_combo;
  }
  $('#best_combo_num').html(best_combo);

  // initial check
  multiplier = 0;
  verif_tableau();

  $('#current_score_num').html(score);
  $('#current_combo_num').html(combo);

};


function deplacement(icone_ligne, icone_col, binome_ligne, binome_col) {
  deplacement_en_cours = false;
  deplacement_interdit = true;

  clearTimeout(hint_timeout);
  $('.hint').removeClass('hint');
  hint_mode = false;

  $binome = $('.icone[data-ligne=' + binome_ligne + '][data-col=' + binome_col + ']');

  $icone.css('z-index', 10);

  // icons switch positions

  var icone_ligne_origin = icone_ligne;
  var icone_col_origin = icone_col;
  var icone_num_origin = tab_icones[icone_ligne][icone_col];
  var binome_ligne_origin = binome_ligne;
  var binome_col_origin = binome_col;
  var binome_num_origin = tab_icones[binome_ligne][binome_col];

  $icone.attr('data-ligne', binome_ligne_origin);
  $icone.attr('data-col', binome_col_origin);
  $binome.attr('data-ligne', icone_ligne_origin);
  $binome.attr('data-col', icone_col_origin);

  $icone.css({
    'left': binome_col_origin*TAILLE_ICONE,
    'top': binome_ligne_origin*TAILLE_ICONE
  });
  $binome.css({
    'left': icone_col_origin*TAILLE_ICONE,
    'top': icone_ligne_origin*TAILLE_ICONE
  });

  tab_icones[icone_ligne_origin][icone_col_origin] = binome_num_origin;
  tab_icones[binome_ligne_origin][binome_col_origin] = icone_num_origin;

  // after the movement : check for new chains
  setTimeout(function () {
    if (!verif_tableau()) {
      // no chain found : back to initial position

      $icone.attr('data-ligne', icone_ligne_origin);
      $icone.attr('data-col', icone_col_origin);
      $binome.attr('data-ligne', binome_ligne_origin);
      $binome.attr('data-col', binome_col_origin);

      $icone.css({
        'left': icone_col_origin*TAILLE_ICONE,
        'top': icone_ligne_origin*TAILLE_ICONE
      });
      $binome.css({
        'left': binome_col_origin*TAILLE_ICONE,
        'top': binome_ligne_origin*TAILLE_ICONE
      });

      tab_icones[icone_ligne_origin][icone_col_origin] = icone_num_origin;
      tab_icones[binome_ligne_origin][binome_col_origin] = binome_num_origin;

      setTimeout(function () {
        verif_tableau();
      }, 300);
      
    }

    $icone = undefined;
    $binome = undefined;

  }, 300);
  
  
};



function verif_tableau() {

  for (var i = 0; i < NB_LIGNES; i++) {
    tab_suppr[i] = [];
    for (var j = 0; j < NB_COLONNES; j++) {
      tab_suppr[i][j] = false;
    }
  }

  for (var i = 0; i < NB_LIGNES; i++) {
    test_horiz[i] = [];
    for (var j = 0; j < NB_COLONNES; j++) {
      test_horiz[i][j] = false;
    }
  }

  for (var i = 0; i < NB_LIGNES; i++) {
    test_verti[i] = [];
    for (var j = 0; j < NB_COLONNES; j++) {
      test_verti[i][j] = false;
    }
  }

  $('.icone.hypercube').removeClass('new');

  var chaine_trouvee = false;

  for (var i = 0; i < NB_LIGNES; i++) {
    for (var j = 0 ; j < NB_COLONNES; j++) {
      if (test_chaine(i, j)) {
        chaine_trouvee = true;
      }
    }
  }

  // check for hypercube move
  if ($icone != undefined && $binome != undefined) {
    if ($icone.hasClass('hypercube') && !$icone.hasClass('new')) {
      destroy_color($binome.attr('data-icone'), $icone.attr('data-ligne'), $icone.attr('data-col'));
      tab_suppr[$icone.attr('data-ligne')][$icone.attr('data-col')] = true;
      chaine_trouvee = true;
      multiplier++;
      if(multiplier > combo){
        combo = multiplier;
        $('#current_combo_num').html(combo);
      }
      $('#zone_message').append('<div class="hypercube">EXCELLENT!</div>');

    }
    if ($binome.hasClass('hypercube') && !$binome.hasClass('new')) {
      destroy_color($icone.attr('data-icone'), $binome.attr('data-ligne'), $binome.attr('data-col'));
      tab_suppr[$binome.attr('data-ligne')][$binome.attr('data-col')] = true;
      chaine_trouvee = true;
      multiplier++;
      if(multiplier > combo){
        combo = multiplier;
        $('#current_combo_num').html(combo);
      }
      $('#zone_message').append('<div class="hypercube">EXCELLENT!</div>');
    }
  }

  if (chaine_trouvee) {
    clearTimeout(fast_move_timeout);

    for (var i = 0; i < NB_LIGNES; i++) {
      for (var j = 0 ; j < NB_COLONNES; j++) {
        if (tab_suppr[i][j]) {
          tab_icones[i][j] = 0;
          $('.icone[data-ligne=' + i + '][data-col=' + j + ']').fadeOut(300, function () { $(this).remove(); });
          var points = 10 * multiplier;
          var $aff_score = $('<div class="aff_score" style="left:' + j*TAILLE_ICONE + 'px; top:' + i*TAILLE_ICONE + 'px;">+' + points + '</div>');
          $('#zone_jeu').append($aff_score);
          score += points;
        }          
      }
    }
    $('#current_score_num').html(score);
    setTimeout(function () {
      $aff_score.fadeOut(400, function () { $('.aff_score').remove(); });
      $('#zone_message').html('');
    }, 700);


    setTimeout(function () {
      chute_icones();
      setTimeout(function () {
        verif_tableau();
      }, 400);
    }, 400);
  } else {
    // no chain found

    if ($icone == undefined && $binome == undefined) {
      if (test_possible_move()) {
        deplacement_interdit = false;
        if (score > 1000) {
          // difficulty++
          NB_ICONES = 7;
        }
        if (score > 2000) {
          // difficulty++
          NB_ICONES = 8;
        }

        // reset multiplier if the player not not find new chain fast
        fast_move_timeout = setTimeout(function () {
          multiplier = 0;
        }, 1500);

        // display hint after a few seconds
        hint_timeout = setTimeout(function () {
          hint_mode = true;
          test_possible_move();
        }, 7000);
      } else {
        // tracking Google Analytics
        _gaq.push(['_trackEvent', 'Fruit Salad', 'Game over', 'Game over', score]);
        $('#zone_message').html('<div class="bad">GAME OVER</div>');
        $('#zone_message').append('<div class="good">' + score + ' points</div>');
        if (score > best_score) {
          best_score = score;
          localStorage.setItem('best_score', best_score);
          $('#best_score_num').html(best_score);
        }
        $('#zone_message').append('<div class="good">combo x ' + combo + '</div>');
        if (combo > best_combo) {
          best_combo = combo;
          localStorage.setItem('best_combo', best_combo);
          $('#best_combo_num').html(best_combo);
        }
        $('#zone_message').append('<div class="bt_new_game">Play again</div>');

      }
    }    
  }

  return chaine_trouvee;
};

function test_chaine(ligne, colonne) {
  var chaine_trouvee = false;
  var num_icone = tab_icones[ligne][colonne];
  var suite_verti = 1;
  var suite_horiz = 1;
  var i;

  // down
  if (!test_verti[ligne][colonne]) {
    i = 1;
    while(ligne+i < NB_COLONNES && tab_icones[ligne+i][colonne] == num_icone && !test_verti[ligne+i][colonne]) {
      suite_verti++;
      i++;
    }

    if (suite_verti >= 3) {
      chaine_trouvee = true;
      multiplier++;
      if(multiplier > combo){
        combo = multiplier;
        $('#current_combo_num').html(combo);
      }
      if (multiplier > 1) {
        var $aff_combo = $('<div class="aff_combo" style="left:' + (colonne*TAILLE_ICONE) + 'px; top:' + (ligne*TAILLE_ICONE) + 'px;">x' + multiplier + '</div>');
        $('#zone_jeu').append($aff_combo);
        $aff_combo.animate(
          {
            top : '-=' + (TAILLE_ICONE/2),
            opacity : 0
          },
          600,
          function(){
            $(this).remove();
          }
        );
      }

      if ($('.icone[data-ligne=' + ligne + '][data-col=' + colonne + ']').hasClass('fire')) {
        destroy_around(ligne, colonne);
      }
      if ($('.icone[data-ligne=' + ligne + '][data-col=' + colonne + ']').hasClass('star')) {
        destroy_line_column(ligne, colonne);
      }

      tab_suppr[ligne][colonne] = true;
      test_verti[ligne][colonne] = true;

      if(suite_verti == 4){
        // animate fireball creation
        $('.icone[data-ligne=' + ligne + '][data-col=' + colonne + ']').css({
          'top': (ligne+1)*TAILLE_ICONE
        });
      }
      if(suite_verti == 5){
        // animate hypercube creation
        $('.icone[data-ligne=' + ligne + '][data-col=' + colonne + ']').css({
          'top': (ligne+2)*TAILLE_ICONE
        });
      }

      // down
      i = 1;
      while(ligne+i < NB_COLONNES && tab_icones[ligne+i][colonne] == num_icone) {
        if ($('.icone[data-ligne=' + (ligne+i) + '][data-col=' + colonne + ']').hasClass('fire')) {
          destroy_around(ligne+i, colonne);
        }
        if ($('.icone[data-ligne=' + (ligne+i) + '][data-col=' + colonne + ']').hasClass('star')) {
          destroy_line_column(ligne+i, colonne);
        }
        if(suite_verti == 4){
          // animate fireball creation
          $('.icone[data-ligne=' + (ligne+i) + '][data-col=' + colonne + ']').css({
            'top': (ligne+1)*TAILLE_ICONE
          });
        }
        if(suite_verti == 5){
          // animate hypercube creation
          $('.icone[data-ligne=' + (ligne+i) + '][data-col=' + colonne + ']').css({
            'top': (ligne+2)*TAILLE_ICONE
          });
        }
        if(i == 1 && multiplier%5 == 0){
          // create a star gem (can destroy line and column)
          $('.icone[data-ligne=' + (ligne+i) + '][data-col=' + colonne + ']').addClass('star');
          $('#zone_message').append('<div class="star">SUPER COMBO!</div>');
        } else {
          if(i == 1 && suite_verti == 4){
            // create a fire gem (can destroy 8 surrounding icons)
            $('.icone[data-ligne=' + (ligne+i) + '][data-col=' + colonne + ']').addClass('fire');
            $('#zone_message').append('<div class="fire">FIREBALL!</div>');
          } else {
            if(i == 2 && suite_verti == 5){
              // create a hypercube (can destroy all icons)
              $('.icone[data-ligne=' + (ligne+i) + '][data-col=' + colonne + ']')
                .removeClass('icone_1 icone_2 icone_3 icone_4 icone_5 icone_6 icone_7 icone_8')
                .addClass('hypercube new');
              tab_icones[ligne+i][colonne] = 10;
              $('#zone_message').append('<div class="hypercube">HYPERCUBE!</div>');
            } else {
              tab_suppr[ligne+i][colonne] = true;
              test_verti[ligne+i][colonne] = true;
            }
          }
        }
        
        i++;
      }
    }
  }


  // right
  if (!test_horiz[ligne][colonne]) {
    i = 1;
    while(colonne+i < NB_LIGNES && tab_icones[ligne][colonne+i] == num_icone && !test_horiz[ligne][colonne+i]) {
      suite_horiz++;
      i++;
    }

    if (suite_horiz >= 3) {
      chaine_trouvee = true;
      multiplier++;
      if(multiplier > combo){
        combo = multiplier;
        $('#current_combo_num').html(combo);
      }
      if (multiplier > 1) {
       var $aff_combo = $('<div class="aff_combo" style="left:' + (colonne*TAILLE_ICONE) + 'px; top:' + (ligne*TAILLE_ICONE) + 'px;">x' + multiplier + '</div>');
        $('#zone_jeu').append($aff_combo);
        $aff_combo.animate(
          {
            top : '-=' + (TAILLE_ICONE/2),
            opacity : 0
          },
          600,
          function(){
            $(this).remove();
          }
        );
      }

      if ($('.icone[data-ligne=' + ligne + '][data-col=' + colonne + ']').hasClass('fire')) {
        destroy_around(ligne, colonne);
      }
      if ($('.icone[data-ligne=' + ligne + '][data-col=' + colonne + ']').hasClass('star')) {
        destroy_line_column(ligne, colonne);
      }

      tab_suppr[ligne][colonne] = true;
      test_horiz[ligne][colonne] = true;

      if(suite_horiz == 4){
        // animate fireball creation
        $('.icone[data-ligne=' + ligne + '][data-col=' + colonne + ']').css({
          'left': (colonne+1)*TAILLE_ICONE
        });
      }
      if(suite_horiz == 5){
        // animate hypercube creation
        $('.icone[data-ligne=' + ligne + '][data-col=' + colonne + ']').css({
          'left': (colonne+2)*TAILLE_ICONE
        });
      }

      // right
      i = 1;
      while(colonne+i < NB_LIGNES && tab_icones[ligne][colonne+i] == num_icone) {
        if ($('.icone[data-ligne=' + ligne + '][data-col=' + (colonne+i) + ']').hasClass('fire')) {
          destroy_around(ligne, colonne+i);
        }
        if ($('.icone[data-ligne=' + ligne + '][data-col=' + (colonne+i) + ']').hasClass('star')) {
          destroy_line_column(ligne, colonne+i);
        }
        if(suite_horiz == 4){
          // animate fireball creation
          $('.icone[data-ligne=' + ligne + '][data-col=' + (colonne+i) + ']').css({
            'left': (colonne+1)*TAILLE_ICONE
          });
        }
        if(suite_horiz == 5){
          // animate hypercube creation
          $('.icone[data-ligne=' + ligne + '][data-col=' + (colonne+i) + ']').css({
            'left': (colonne+2)*TAILLE_ICONE
          });
        }
        if(i == 1 && multiplier%5 == 0){
          // create a star gem (can destroy line and column)
          $('.icone[data-ligne=' + ligne + '][data-col=' + (colonne+i) + ']').addClass('star');
          $('#zone_message').append('<div class="star">SUPER COMBO!</div>');
        } else {
          if (i == 1 && suite_horiz == 4) {
            // create a fire gem (can destroy 8 surrounding icons)
            $('.icone[data-ligne=' + ligne + '][data-col=' + (colonne+i) + ']').addClass('fire');
            $('#zone_message').append('<div class="fire">FIREBALL!</div>');
          } else {
            if (i == 2 && suite_horiz == 5) {
              // create a hypercube (can destroy all icons)
              $('.icone[data-ligne=' + ligne + '][data-col=' + (colonne+i) + ']')
                .removeClass('icone_1 icone_2 icone_3 icone_4 icone_5 icone_6 icone_7 icone_8')
                .addClass('hypercube new');
              tab_icones[ligne][colonne+i] = 10;
            $('#zone_message').append('<div class="hypercube">HYPERCUBE!</div>');
            } else {
              tab_suppr[ligne][colonne+i] = true;
              test_horiz[ligne][colonne+i] = true;
            }
          }
        }

        i++;
      } 
    }
  } 
  return chaine_trouvee;
};


function destroy_around(ligne, colonne) {
  if (ligne>0 && colonne>0) {
    tab_suppr[ligne-1][colonne-1] = true;
  }
  if (ligne>0) {
    tab_suppr[ligne-1][colonne] = true;
  }
  if (ligne>0 && colonne<NB_COLONNES-1) {
    tab_suppr[ligne-1][colonne+1] = true;
  }
  if (colonne>0) {
    tab_suppr[ligne][colonne-1] = true;
  }
  if (colonne<NB_COLONNES-1) {
    tab_suppr[ligne][colonne+1] = true;
  }
  if (ligne<NB_LIGNES-1 && colonne>0) {
    tab_suppr[ligne+1][colonne-1] = true;
  }
  if (ligne<NB_LIGNES-1) {
    tab_suppr[ligne+1][colonne] = true;
  }
  if (ligne<NB_LIGNES-1 && colonne<NB_COLONNES-1) {
    tab_suppr[ligne+1][colonne+1] = true;
  }
  explosion(ligne, colonne);
};

function explosion(ligne, colonne) {
  var $explosion = $('<div class="explosion"></div>');
  $explosion.css({
    'left': (colonne-1)*TAILLE_ICONE,
    'top': (ligne-1)*TAILLE_ICONE
  });
  $('#zone_jeu').append($explosion);
  $('#zone_message').append('<div class="fire">GREAT!</div>');
  setTimeout(function () {
    $explosion.remove();
  }, 600);

};

function destroy_color(num_icone, ligne, colonne) {
  for (var i = 0; i < NB_LIGNES; i++) {
    for (var j = 0 ; j < NB_COLONNES; j++) {
      if (tab_icones[i][j] == num_icone) {
        tab_suppr[i][j] = true;
        $('.icone[data-ligne=' + i + '][data-col=' + j + ']').css({
          'left': colonne*TAILLE_ICONE,
          'top': ligne*TAILLE_ICONE
        });
      }
    }
  }
};

function destroy_line_column(ligne, colonne) {
  $('#zone_message').append('<div class="star">GREAT!</div>');
  for (var i = 0; i < NB_LIGNES; i++) {
    tab_suppr[i][colonne] = true;
    $('.icone[data-ligne=' + i + '][data-col=' + colonne + ']').css({
      'left': colonne*TAILLE_ICONE,
      'top': ligne*TAILLE_ICONE
    });
  }
  for (var i = 0; i < NB_LIGNES; i++) {
    tab_suppr[ligne][i] = true;
    $('.icone[data-ligne=' + ligne + '][data-col=' + i + ']').css({
      'left': colonne*TAILLE_ICONE,
      'top': ligne*TAILLE_ICONE
    });
  }
};


function chute_icones() {
  trou_trouve = false;
  for (var i = NB_LIGNES-1; i >= 0 ; i--) {
    for (var j = 0 ; j < NB_COLONNES; j++) {


      if (tab_icones[i][j] == 0) {
        trou_trouve = true;
        // look above for an icon to fill the hole
        var k = 1;
        while((i - k) >= 0 && tab_icones[i-k][j] == 0) {
          k++;
        }
        if ((i - k) < 0) {
          // no icon found above : create random new icon
          var random_icone = Math.ceil(Math.random() * NB_ICONES);
          $new_icon = $('<div class="icone icone_' + random_icone + '" data-ligne="' + i + '" data-col="' + j + '" data-icone="' + random_icone + '"></div>');
          $new_icon.css({
            'left': j*TAILLE_ICONE,
            'top': -TAILLE_ICONE
          });
          $('#zone_jeu').append($new_icon);
          
          $new_icon.animate({
            'top': i*TAILLE_ICONE
          }, 0);

          
          tab_icones[i][j] = random_icone;
        } else {
          // icon found above : icon falling animation
          var $icone_chute = $('.icone[data-ligne=' + (i - k) + '][data-col=' + j + ']');
          // update icon properties (correct line and column numbers)
          $icone_chute.attr('data-ligne', i);
          $icone_chute.css('top', i*TAILLE_ICONE);

          tab_icones[i][j] = tab_icones[i-k][j];
          tab_icones[i-k][j] = 0;

        }
      }
    }
  }
};

function test_possible_move() {
  var move_found = false;
  var hint_displayed = false;
  var nb_possible_moves = 0;

  for (var i = 0; i < NB_LIGNES; i++) {
    tab_test[i] = [];
    for (var j = 0 ; j < NB_COLONNES; j++) {
      tab_test[i][j] = tab_icones[i][j];
    }
  }

  for (var i = 0; i < NB_LIGNES; i++) {
    for (var j = 0 ; j < NB_COLONNES; j++) {
      // test right move
      if (j < NB_COLONNES-1) {
        tab_test[i][j] = tab_icones[i][j+1];
        tab_test[i][j+1] = tab_icones[i][j];
        if (test_chain_game_over(i, j)) {
          move_found = true;
          nb_possible_moves++;
          if(debug_mode){
            $('.icone[data-ligne=' + i + '][data-col=' + (j+1) + ']').addClass('hint');
          }
          if (hint_mode && !hint_displayed) {
            $('.icone[data-ligne=' + i + '][data-col=' + (j+1) + ']').addClass('hint');
            hint_displayed = true;
          }
        }
        if (test_chain_game_over(i, j+1)) {
          move_found = true;
          nb_possible_moves++;
          if(debug_mode){
            $('.icone[data-ligne=' + i + '][data-col=' + j + ']').addClass('hint');
          }
          if (hint_mode && !hint_displayed) {
            $('.icone[data-ligne=' + i + '][data-col=' + j + ']').addClass('hint');
            hint_displayed = true;
          }
        }
        tab_test[i][j] = tab_icones[i][j];
        tab_test[i][j+1] = tab_icones[i][j+1];
      }

      // test down move
      if (i < NB_LIGNES-1) {
        tab_test[i][j] = tab_icones[i+1][j];
        tab_test[i+1][j] = tab_icones[i][j];
        if (test_chain_game_over(i, j)) {
          move_found = true;
          nb_possible_moves++;
          if(debug_mode){
            $('.icone[data-ligne=' + (i+1) + '][data-col=' + j + ']').addClass('hint');
          }
          if (hint_mode && !hint_displayed) {
            $('.icone[data-ligne=' + (i+1) + '][data-col=' + j + ']').addClass('hint');
            hint_displayed = true;
          }
        }
        if (test_chain_game_over(i+1, j)) {
          move_found = true;
          nb_possible_moves++;
          if(debug_mode){
            $('.icone[data-ligne=' + i + '][data-col=' + j + ']').addClass('hint');
          }
          if (hint_mode && !hint_displayed) {
            $('.icone[data-ligne=' + i + '][data-col=' + j + ']').addClass('hint');
            hint_displayed = true;
          }
        }
        tab_test[i][j] = tab_icones[i][j];
        tab_test[i+1][j] = tab_icones[i+1][j];
      }
    }
  }

  if(nb_possible_moves <= 3) {
    if(nb_possible_moves <= 1) {
      $('#moves').addClass('critical').html(nb_possible_moves + '<br>move');
    } else {
      $('#moves').removeClass('critical').html(nb_possible_moves + '<br>moves');
    }
  } else {
    $('#moves').removeClass('critical').html('');
  }
  

  return move_found;
};




function test_chain_game_over(ligne, colonne) {
  var chaine_trouvee = false;
  var num_icone = tab_test[ligne][colonne];
  var suite_verti = 1;
  var suite_horiz = 1;
  var i;
  // up
  i = 1;
  while(ligne-i >= 0 && tab_test[ligne-i][colonne] == num_icone) {
    suite_verti++;
    i++;
  }
  // down
  i = 1;
  while(ligne+i < NB_COLONNES && tab_test[ligne+i][colonne] == num_icone) {
    suite_verti++;
    i++;
  }
  // left
  i = 1;
  while(colonne-i >= 0 && tab_test[ligne][colonne-i] == num_icone) {
    suite_horiz++;
    i++;
  }
  // right
  i = 1;
  while(colonne+i < NB_LIGNES && tab_test[ligne][colonne+i] == num_icone) {
    suite_horiz++;
    i++;
  }

  if (suite_verti >= 3) {
    chaine_trouvee = true;
  }
  if (suite_horiz >= 3) {
    chaine_trouvee = true;
  }
  if (tab_test[ligne][colonne] == 10) {
    // hypercube
    chaine_trouvee = true;
  }
  return chaine_trouvee;
};

function on_resize() {
  board_size = $('#zone_jeu').width();
  TAILLE_ICONE = board_size/8;

  $('#zone_jeu').css({
    'height': board_size + 'px',
    'background-size': board_size/4 + 'px ' + board_size/4 + 'px'
  });

  for (var i = 0; i < NB_LIGNES; i++) {
    for (var j = 0 ; j < NB_COLONNES; j++) {
      $('.icone[data-ligne=' + i + '][data-col=' + j + ']').css({
        'left': j*TAILLE_ICONE + 'px',
        'top': i*TAILLE_ICONE + 'px'
      });
    }
  }

  setTimeout(function () {
    // hide the address bar
    window.scrollTo(0, 1);
  }, 0);

};

function loadimages(imgArr,callback) {
  //Keep track of the images that are loaded
  var imagesLoaded = 0;
  function _loadAllImages(callback) {
    //Create an temp image and load the url
    var img = new Image();
    $(img).attr('src',imgArr[imagesLoaded]);
    if (img.complete || img.readyState === 4) {
      // image is cached
      imagesLoaded++;
      //Check if all images are loaded
      if (imagesLoaded == imgArr.length) {
        //If all images loaded do the callback
        callback();
      } else {
        //If not all images are loaded call own function again
        _loadAllImages(callback);
      }
    } else {
      $(img).load(function () {
        //Increment the images loaded variable
        imagesLoaded++;
        //Check if all images are loaded
        if (imagesLoaded == imgArr.length) {
          //If all images loaded do the callback
          callback();
        } else {
          //If not all images are loaded call own function again
          _loadAllImages(callback);
        }
      });
    }
  };    
  _loadAllImages(callback);
}
