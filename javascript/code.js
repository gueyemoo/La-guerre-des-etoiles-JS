/**
* Projet : la guerre des etoiles
* @author Mohamed Gueye
*/

// On crée l'objet global Game (il s'agira de notre variable de jeu)
let Game = {}

// création d'une hitbox
function hitbox(pos) {
  if (this === window || this === undefined) {
    return new hitbox(pos);
  } else {
    this.pos = pos;
    this.height = 0;
    this.width  = 0;
    this.DOM = document.createElement('div');
    this.DOM.setAttribute('class',  'hitbox');
  }
  return this;
}

// Verifie la collision entre deux hitbox
hitbox.prototype.areIntersecting = function() {

  let x1 = this.pos.x;
  let y1 = this.pos.y;

  let x2 = Game.settings.robot.pos.x;
  let y2 = Game.settings.robot.pos.y;

  let h1 = x1 + this.height;
  let w1 = y1 + this.width;

  let h2 = x2 + Game.settings.robot.hitbox.height;
  let w2 = y2 + Game.settings.robot.hitbox.width;

  let top  = x2 - h1 < 0;
  let bottom  = x1 - h2 < 0;
  let left  = y2 - w1 < 0;
  let right = w2 - y1 > 0;

  return (top || bottom || left || right);
}

// Verifie si l'objet est à l'interieur de la hitbox
hitbox.prototype.inside = function() {

  let x1 = this.pos.x;
  let y1 = this.pos.y;

  let x2 = Game.settings.robot.pos.x;
  let y2 = Game.settings.robot.pos.y;

  let w1 = y1 + this.width;
  let h1 = x1 + this.height;

  let w2 = y2 + Game.settings.robot.hitbox.width;
  let h2 = x2 + Game.settings.robot.hitbox.height;

  let top  = x2 - h1 < 0;
  let bottom  = x1 - h2 < 0;
  let left  = y2 - w1 < 0;
  let right = w2 - y1 > 0;

  return left && right && bottom && top;
}

// Création de l'objet position avec des coordonnée x et y
function Position(x=0,y=0) {
  if (this === window || this === undefined) {
    return new Position(x,y);
  } else {
    this.x = x;
    this.y = y;
  }
  return this;
}

// Permet d'additionner à un objet point, un autre objet point
Position.prototype.add = function(pos=Position()) {
  this.x += pos.x;
  this.y += pos.y;
  return this;
};

// Objet sprite
function Sprite(settings)
{

  this.insideDOM = settings.insideDOM;
  this.imgPath = settings.imgPath;
  this.point = settings.point;
  this.type = settings.type;
  this.img = new Image();
  this.img.src = this.imgPath;
  this.img.width = settings.width;
  this.img.height = settings.height;

  //marche pas faudra que je revienne dessus.
  // let _self = this;
  // this.img.onload = function() {
  //    _self.img.width = this.width;
  //    _self.img.height = this.height;
  // }

  let posX = settings.posX ? settings.posX : 0;
  let posY = settings.posY ? settings.posY : 0;

  this.pos = Position(posX, posY);
  this.hitbox = hitbox(this.pos);
  this.hitbox.width = this.img.width;
  this.hitbox.height = this.img.height;

  //Ternaire permettant de définir si il s'agit d'un avion ou d'un robot
  this.hitbox.DOM.setAttribute('class', this.type != 'robot' ? 'hitbox vol' : 'hitbox robot');

  //On change la valeur du css pour le hitbox
  this.hitbox.DOM.style['top'] = posX;
  this.hitbox.DOM.style['left'] = posY;

  this.hitbox.DOM.append(this.img);
  this.insideDOM.appendChild(this.hitbox.DOM);


  return this;
}

// Deplace le sprite vers une nouvelle position
Sprite.prototype.moveTo = function(element, pos=Position(), callback) {

  // limite de position haut/gauche
  let max_haut = 0;
  let max_gauche = 0;

  if (element.arrowUp && pos.x <= max_haut) {
    pos.x = max_haut;
  } else if (element.arrowLeft && pos.y <= max_gauche) {
    pos.y = max_gauche;
  }

  let obj= window.getComputedStyle(this.img, null);
  let obj_w = obj.getPropertyValue('width');
  let obj_h = obj.getPropertyValue('height');

  let robot_w = parseInt(obj_w);
  let robot_h = parseInt(obj_h);

  if(!robot_w <= 0){
    robot_w = this.img.width;
  }else {
    robot_w = robot_w;
  }

  if(!robot_h <= 0){
    robot_h = this.img.height;
  }else {
    robot_h = robot_h;
  }

  let obj_map = window.getComputedStyle(this.insideDOM, null);
  let obj_map_w = obj_map.getPropertyValue('width');
  let obj_map_h = obj_map.getPropertyValue('height');

  let map_w = parseInt(obj_map_w);
  let map_h = parseInt(obj_map_h);


  // limite de position bas/droite
  let limit_hauteur = parseInt(map_h - robot_h);
  let limit_largeur = parseInt(map_w - robot_w);

  if (element.arrowDown && pos.x > limit_hauteur) {
    pos.x = limit_hauteur;
  } else if (element.arrowRight && pos.y > limit_largeur) {
    pos.y = limit_largeur;
  }

  //On change la valeur du css pour le hitbox
  this.hitbox.DOM.style['top'] = pos.x;
  this.hitbox.DOM.style['left'] = pos.y;

  element.arrowUp = false;
  element.arrowDown = false;
  element.arrowLeft = false;
  element.arrowRight = false;

  if (callback) {
    callback({
      element: this,
      posX: pos.x,
      posY: pos.y,
      type: this.type,
      robot_w: robot_w,
      robot_h: robot_h,
      map_h: map_h
    });
  }
}

// Deplace le sprite relativement à sa position courante
Sprite.prototype.moveRel = function(element, pos=Position(), callback) {

  // calcule position value
  this.pos.add(pos);

  this.moveTo(element, this.pos, callback);
}

// Retire un sprite
Sprite.prototype.remove = function() {

  for(let index in Game.settings.listEnnemyRandom) {
    if (index == this.key) {
      delete Game.settings.listEnnemyRandom[index];
      Game.settings.listEnnemyRandom.length--;
    }
  }

  return Game.settings.listEnnemyRandom;
}

// Création d'un objet element du sprite
function Element(settings) {
  if (this == window || this == undefined) {
    return new Element(settings);
  } else {

    Sprite.call(this, settings);

    Object.setPrototypeOf(this, Sprite.prototype);
  }

  return this;
}

// Après chargement du DOM
window.onload = function() {

  Game = {
    settings: {
      map: document.getElementById('map'),
      msgEcranJeu: document.getElementById('msgEcranJeu'),
      playButton: document.getElementById('playButton'),
      robotSettings: {},
      playerName: document.getElementById('player'),
      imgAttr: [],
      minuteur: document.getElementById('minuteur'),
      resetTime: document.getElementById('resetTime'),
      tableNiveau: document.getElementById('niveau'),
      scoreFinal: document.getElementById('totalScore'),
      currentNiveau: document.getElementById('currentNiveau'),
      niveau: 1,
      tableSpeed: document.getElementById('speed'),
      currentSpeed: document.getElementById('currentSpeed'),
      speed: 40,
      tableScore: document.getElementById('tableScore'),
      totalScore: 0,
      reduitScore: 0,
      ennemyKey: '',
      success:  '<div id="msgEcranJeu"><div class="text resultat">\n' +
      '    <p>BRAVO ###PSEUDO### !</p>\n' +
      '    <p>Ton score total est de <strong>###POINT###</strong> point !</p>\n' +
      '    <p>Sur la voie, toi être <img src="images/yoda.png" alt="yoda"> </p>\n' +

      '</div></div>',
      limiteMinutes: 1,
      limiteSecondes: 30,
      arrowLeft: false,
      arrowRight: false,
      arrowUp: false,
      arrowDown: false,
      listEnnemy: [],
      listEnnemySettings:[],
      run:false,
    },


    // Initialise les fonctions de jeu
    initialise:function() {

      // Initialise les parametres de jeu
      Game.settings.robotSettings = {
        posX: 400,
        posY: 320,
        width:83,
        height:72,
        type: 'robot',
        imgPath: 'images/R2D2.png',
        insideDOM: Game.settings.map
      };

      Game.settings.listEnnemySettings = [

        {
          posX: 60,
          posY: 25,
          point: 150,
          width:128,
          height:128,
          type: 'vol',
          imgPath: 'images/anakin_starfighter.png',
          insideDOM: Game.settings.map
        },

        {
          posX: 60,
          posY: 60,
          point: 150,
          width:128,
          height:128,
          type: 'vol',
          imgPath: 'images/naboo_starfighter.png',
          insideDOM: Game.settings.map
        },

        {
          posX: 60,
          posY: 150,
          point: 150,
          width:128,
          height:128,
          type: 'vol',
          imgPath: 'images/obi_wan_starfighter.png',
          insideDOM: Game.settings.map
        },

        {
          posX: 60,
          posY: 250,
          point: 150,
          width:128,
          height:128,
          type: 'vol',
          imgPath: 'images/x_wing.png',
          insideDOM: Game.settings.map
        },

        {
          posX: 60,
          posY: 300,
          point: 500,
          width:128,
          height:128,
          type: 'darthvader',
          imgPath: 'images/darthvader.png',
          insideDOM: Game.settings.map
        },
      ];

      Game.settings.playButton.addEventListener('click', Game.startGame);
    },

    // Defini un minuteur dans le jeu
    startMinuteur: function() {

      Game.settings.resetTime.innerText =  Game.settings.limiteMinutes +":"+Game.settings.limiteSecondes;
      Game.settings.minuteur.style.visibility = 'visible';

      if (Game.settings.limiteMinutes === 0 && Game.settings.limiteSecondes <= 59) { //Si il ne reste plus que 1min de jeu
        Game.settings.resetTime.style.color = 'red';
      }

      // termine le jeu
      if(Game.settings.limiteMinutes === 0 && Game.settings.limiteSecondes === 0) { // Quand le temps imparti est terminé
        Game.endGame();
        return;
      } else { //Si il reste du temps on décrémente celui-ci
        if(Game.settings.limiteSecondes > 0){
          Game.settings.limiteSecondes--;
        } else if(Game.settings.limiteSecondes === 0 ){
          Game.settings.limiteMinutes--;
          Game.settings.limiteSecondes = 59;
        }
      }
    },

    // Lance le jeu
    startGame: function() {

      //Défini que le jeu est en cours
      Game.settings.run = true;

      //Enleve l'écran d'instruction et lance l'écran de jeu
      Game.startScreen();

      //Crée les sprites sur les layouts
      Game.createRobot();

      Game.settings.lastRandomNum = [];
      Game.settings.lastRandomSettings = [];
      Game.settings.listEnnemyRandom = [];

      //Créer une liste random des ennemies et les 'display' à intervalle réguliere de 1,5 secondes
      Game.createRandomlistEnnemy();
      Game.settings.randomlistEnnemy = setInterval(function(){
        Game.createRandomlistEnnemy();
      }, 1500);
    },

    // Fini le jeu
    endGame: function() {

      //Défini que le jeu n'est plus en cours
      Game.settings.run = false;

      setTimeout(function() {

        // variable msg de fin de parti
        Game.settings.map.innerHTML = Game.settings.success
        .replace('###PSEUDO###', Game.settings.playerName.value)
        .replace('###POINT###', Game.settings.totalScore)
        .replace('###YODA###', Game.settings.yodaimgPath);

        //Supprime toutes les intervales
        clearInterval(Game.settings.startMinuteur);
        clearInterval(Game.settings.randomlistEnnemy);
        clearInterval(Game.settings.randomlistEnnemyMove);

        let interval_id = window.setInterval("", 9999);
        for(let i = 1; i < interval_id; i++) window.clearInterval(i);

      }, 2000);
      //Empeche de faire des deplacements en fin de partie
      window.document.removeEventListener('keydown' ,  Game.robotArrow);
    },

    // Initialise l'interface du jeu
    startScreen: function() {

      Game.settings.playerName.disabled = true;
      Game.settings.playerName.style.border = 'none';
      Game.settings.playerName.style.fontSize = 25;
      Game.settings.playerName.style.textAlign = 'center';
      Game.settings.playButton.style.display = 'none';
      Game.settings.tableNiveau.style.visibility = 'visible';
      Game.settings.tableSpeed.style.visibility = 'visible';
      Game.settings.tableScore.style.visibility = 'visible';
      Game.settings.msgEcranJeu.style.display = 'none';

      Game.updateScreen();

      Game.startMinuteur();

      //fait passer le temps chaque seconde
      Game.settings.startMinuteur = setInterval(function() {
        Game.startMinuteur();
      },1000);

    },

    // Mise a jour des difficultés du jeu en fonction du temps
    updateScreen: function() {

      if (Game.settings.limiteMinutes === 1) {
        if (Game.settings.limiteSecondes >= 20) { //donc si on est à 1 minutes et 20 secondes:
          Game.settings.niveau = 2;
          Game.settings.speed = 45;
        } else if(Game.settings.limiteSecondes >= 10){ // donc si on est à 1 minutes et 10 secondes:
          Game.settings.niveau = 3;
          Game.settings.speed = 50;
        }
      } else if (Game.settings.limiteMinutes === 0) {
        if (Game.settings.limiteSecondes >= 50) { // Si on est à 50 secondes:
          Game.settings.niveau = 4;
          Game.settings.speed = 60;
        } else if(Game.settings.limiteSecondes <= 30){ // Si on est à 30 secondes:
          Game.settings.niveau = 5;
          Game.settings.speed = 65;
        } else if(Game.settings.limiteSecondes <= 15){// Si on est à 10 secondes de la fin:
          Game.settings.niveau = 6;
          Game.settings.speed = 70;
        }
      }

      Game.settings.currentSpeed.innerText = Game.settings.speed;
      Game.settings.currentNiveau.innerText = Game.settings.niveau;
    },

    // création d'un robot
    createRobot: function() {
      Game.settings.robot = Element(Game.settings.robotSettings);
      window.document.addEventListener('keydown' ,  Game.robotArrow);
    },

    // Permet d'utiliser les fleche directionnelles pour le robot
    robotArrow: function(key) {

      let x,y;

      switch(key.code) {

        case 'ArrowUp':

        x = -30;
        y = 0;

        Game.settings.arrowUp = true;
        break;

        case 'ArrowRight':

        x = 0;
        y = 30;

        Game.settings.arrowRight = true;
        break;

        case 'ArrowDown':

        x = 30;
        y = 0;

        Game.settings.arrowDown = true;
        break;

        case 'ArrowLeft':

        x = 0;
        y = -30;

        Game.settings.arrowLeft = true;
        break;

      }

      Game.settings.robot.moveRel(Game.settings, Position(x, y), Game.calculeScore);
    },

    // fonction qui genere un numero aleatoire
    getRandomNumber: function(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min)) + min;
    },

    // fonction qui genere une liste aléatoire des index des ennemies
    getRandomlistEnnemyIndex: function(min, max) {

      let randomNumber = Game.getRandomNumber(min, max);

      if (Game.settings.lastRandomNum.length >= 5) {
        Game.settings.lastRandomNum = [];
      }

      if (Game.settings.lastRandomNum.length && Game.settings.lastRandomNum.indexOf(randomNumber) !== -1) {

        if (max > 100) {
          min += Game.getRandomNumber(10, 128);
        }
        return Game.getRandomlistEnnemyIndex(min, max);
      }

      Game.settings.lastRandomNum.push(randomNumber);

      return randomNumber;
    },

    // fonction qui permet de générer les positions aléatoire des ennemies
    getRandomlistEnnemySettings: function() {

      let setting = Game.settings.listEnnemySettings[ Game.getRandomlistEnnemyIndex(0, 5) ];

      if (Game.settings.lastRandomSettings.length >= 5) {
        Game.settings.lastRandomSettings = [];
      }

      if (Game.settings.lastRandomSettings.length && Game.settings.lastRandomSettings.indexOf(setting.imgPath) !== -1) {
        return Game.getRandomlistEnnemySettings();
      }

      Game.settings.lastRandomSettings.push(setting.imgPath);

      setting.posY = Game.settings.robot.pos.y + Game.getRandomlistEnnemyIndex(10, 200);

      return setting;
    },

    // création d'une liste aléatoire d'ennemies
    createRandomlistEnnemy: function() {

      // mise à jour de la difficulté
      Game.updateScreen();

      let element =  Element( Game.getRandomlistEnnemySettings() );
      element.key = 'Ennemy_' +  Math.random().toString(36).substr(2, 9);

      Game.settings.listEnnemyRandom[element.key] = element;
      Game.settings.listEnnemyRandom.length++;

      Game.randomlistEnnemyMove();
    },

    // Deplace les ennemies
    randomlistEnnemyMove: function() {

      if (!Game.settings.listEnnemyRandom.length) {
        return;
      }

      for(let index in Game.settings.listEnnemyRandom) {

        let listEnnemy = Game.settings.listEnnemyRandom[index];

        listEnnemy.moveRel(Game.settings, Position(Game.settings.speed, 0), Game.calculeScore);

        Game.settings.randomlistEnnemyMove = setInterval(function() {

          listEnnemy.moveRel(Game.settings, Position(Game.settings.speed, 0), Game.calculeScore);

        }, 300);
      }
    },

    // calcule le score total
    calculeScore: function(settings) {

      try {

        if (settings.type == 'robot') {
          return;
        }

        if (!Game.settings.listEnnemyRandom[settings.element.key]) {
          return;
        }

        // Calcul le nombre de points à diminuer et ne le fait qu'une seul fois
        if (settings.element.hitbox.areIntersecting() && settings.element.hitbox.inside()) {
          if (settings.element.key != Game.settings.ennemyKey) {
            Game.settings.reduitScore += settings.element.point;
            Game.settings.ennemyKey =  settings.element.key;
          }
        }

        // Si l'element n'est plus dans le cadre de la map
        if (settings.posX >= (settings.map_h + settings.robot_h + 200)) {

          // ajoute des points si il n'y a aucun contact entre le robot et les avions
          let point = 0;
          if (!(settings.element.hitbox.areIntersecting() && settings.element.hitbox.inside())) {
            point = settings.element.point; //On mets dans points le nombre de points de l'element qui est toucher
          }

        // Si il s'agit de  dark vador on retire le nombre de point de l'element (ici l'element c'est dark vador)
          if (settings.type == 'darthvader') {
            Game.settings.reduitScore += settings.element.point;
          }

        // On incremente le score total
          Game.settings.totalScore += point;

        //Si le score
          if (Game.settings.reduitScore > 0) {
            Game.settings.totalScore -=  Game.settings.reduitScore;
            Game.settings.scoreFinal.style.color = 'red';
          }else {
            Game.settings.scoreFinal.style.color = 'green';
          }

          Game.settings.reduitScore = 0;
          Game.settings.scoreFinal.innerText = Game.settings.totalScore;
          Game.settings.listEnnemyRandom[settings.element.key].remove();
          settings.element.hitbox.DOM.parentNode.removeChild(settings.element.hitbox.DOM);
        }
      } catch (e) {
        console.log(e.message);
      }
    }
  };

  Game.initialise();
}
