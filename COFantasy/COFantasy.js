//version 0.3
// jshint undef:true
// jshint eqeqeq:false
/* globals Set */
/* globals getAttrByName */
/* globals findObjs */
/* globals _ */
/* globals createObj */
/* globals log */
/* globals sendChat */
/* globals state */
/* globals Campaign */
/* globals getObj */
/* globals randomInteger */
/* globals spawnFx */
/* globals spawnFxBetweenPoints */
/* globals VecMath */
/* globals on */
/* globals toFront */

// Needs the Vector Math scripty

var COF_loaded = false;

var COFantasy = COFantasy || function() {

  "use strict";

  var DEF_MALUS_APRES_TOUR_5 = true;
  var IMAGE_OMBRE = "https://s3.amazonaws.com/files.d20.io/images/2781735/LcllgIHvqvu0HAbWdXZbJQ/thumb.png?13900368485";
  var IMAGE_DOUBLE = "https://s3.amazonaws.com/files.d20.io/images/33854984/q10B3KtWsCxcMczLo4BSUw/thumb.png?1496303265";
  var HISTORY_SIZE = 150;
  var eventHistory = [];
  var updateNextInitSet = new Set();

  var BS_LABEL = 'text-transform: uppercase; display: inline; padding: .2em .6em .3em; font-size: 75%; line-height: 2; color: #fff; text-align: center; white-space: nowrap; vertical-align: baseline; border-radius: .25em;';
  var BS_LABEL_DEFAULT = 'background-color: #777;';
  var BS_LABEL_PRIMARY = 'background-color: #337ab7;';
  var BS_LABEL_SUCCESS = 'background-color: #5cb85c;';
  var BS_LABEL_INFO = 'background-color: #5bc0de;';
  var BS_LABEL_WARNING = 'background-color: #f0ad4e;';
  var BS_LABEL_DANGER = 'background-color: #d9534f;';

  var bs_alert = 'padding: 5px; border: 1px solid transparent; border-radius: 4px;';
  var bs_alert_success = 'color: #3c763d; background-color: #dff0d8; border-color: #d6e9c6;';
  var bs_alert_danger = 'color: #a94442; background-color: #f2dede; border-color: #ebccd1;';

  // List of states:
  var cof_states = {
    mort: 'status_dead',
    surpris: 'status_lightning-helix',
    assome: 'status_pummeled',
    renverse: 'status_back-pain',
    aveugle: 'status_bleeding-eye',
    affaibli: 'status_half-heart',
    etourdi: 'status_half-haze',
    paralyse: 'status_fishing-net',
    ralenti: 'status_snail',
    endormi: 'status_sleepy',
    apeure: 'status_screaming'
  };

  function etatRendInactif(etat) {
    var res =
      etat == 'mort' || etat == 'surpris' || etat == 'assome' ||
      etat == 'etourdi' || etat == 'paralyse' || etat == 'endormi' ||
      etat == 'apeure';
    return res;
  }

  function error(msg, obj) {
    log(msg);
    log(obj);
    sendChat("COFantasy", msg);
  }

  function getState(personnage, etat) {
    var token = personnage.token;
    var charId = personnage.charId;
    var res = false;
    if (token !== undefined) {
      res = token.get(cof_states[etat]);
      if (token.get('bar1_link') === "") return res;
      // else, look for the character value, if any
      if (charId === undefined) charId = token.get('represents');
    }
    if (charId === "") {
      error("token with a linked bar1 but representing no character", token);
      return false;
    }
    if (etat == 'affaibli') { //special case due ti new character sheet
      var de = parseInt(getAttrByName(charId, 'ETATDE'));
      if (de === 20) {
        if (res && token !== undefined) token.set(cof_states[etat], false);
        return false;
      } else if (de === 12) {
        if (!res && token !== undefined) token.set(cof_states[etat], true);
        return true;
      }
    }
    var attr = findObjs({
      _type: 'attribute',
      _characterid: charId,
      name: etat
    });
    if (attr.length === 0) {
      if (res && token !== undefined) token.set(cof_states[etat], false);
      return false;
    }
    if (!res && token !== undefined) token.set(cof_states[etat], true);
    return true;
  }

  function setState(personnage, etat, value, evt) {
    var token = personnage.token;
    var charId = personnage.charId;
    var aff = {
      affecte: token,
      prev: {
        statusmarkers: token.get('statusmarkers')
      }
    };
    if (_.has(evt, 'affectes')) {
      var alreadyAff = evt.affectes.find(function(a) {
        return (a.affecte.id == token.id);
      });
      if (alreadyAff === undefined ||
        alreadyAff.prev.statusmarker === undefined) {
        evt.affectes.push(aff);
      }
    } else evt.affectes = [aff];
    if (value && etatRendInactif(etat) && isActive(personnage))
      removeFromTurnTracker(token.id, evt);
    token.set(cof_states[etat], value);
    if (etat == 'aveugle') {
      // We also change vision of the token
      aff.prev.light_losangle = token.get('light_losangle');
      if (value) token.set('light_losangle', 0);
      else token.set('light_losangle', 360);
    } else if (value && etat == 'mort') {
      var allToks =
        findObjs({
          _type: "graphic",
          _pageid: token.get('pageid'),
          _subtype: "token",
          layer: "objects"
        });
      allToks.forEach(function(tok) {
        if (tok.id == token.id) return;
        var ci = tok.get('represents');
        if (ci === '') return;
        var p = {
          token: tok,
          charId: ci
        };
        if (getState(p, 'mort')) return;
        if (charAttributeAsBool(ci, 'siphonDesAmes')) {
          soigneToken(tok, randomInteger(6), evt,
            function(s) {
              sendChar(ci, "siphone l'âme de " + token.get('name') +
                ". Il récupère " + s + " pv.");
            },
            function() {
              sendChar(ci, "est déjà au maximum de point de vie. Il laisse échapper l'âme de " + token.get('name'));
            });
        }
      });
    }
    if (token.get('bar1_link') !== "") {
      if (charId === '') {
        error("token with a linked bar1 but representing no character", token);
        return;
      }
      if (etat == 'affaibli') { //special case due to new character sheet
        var attr =
          findObjs({
            _type: 'attribute',
            _characterid: charId,
            name: 'ETATDE'
          });
        if (value) {
          if (attr.length === 0) {
            attr =
              createObj('attribute', {
                characterid: charId,
                name: 'ETATDE',
                current: 12
              });
            if (_.has(evt, 'attributes'))
              evt.attributes.push({
                attribute: attr,
                current: null
              });
            else evt.attributes = [{
              attribute: attr,
              current: null
            }];
          } else {
            attr = attr[0];
            if (parseInt(attr.get('current')) != 12) {
              if (_.has(evt, 'attributes'))
                evt.attributes.push({
                  attribute: attr,
                  current: 20
                });
              else evt.attributes = [{
                attribute: attr,
                current: 20
              }];
              attr.set('current', 12);
            }
          }
        } else {
          if (attr.length > 0) {
            attr = attr[0];
            if (parseInt(attr.get('current')) != 20) {
              if (_.has(evt, 'attributes'))
                evt.attributes.push({
                  attribute: attr,
                  current: 12
                });
              else evt.attributes = [{
                attribute: attr,
                current: 12
              }];
              attr.set('current', 20);
            }
          }
        }
      } else {
        var attrEtat =
          findObjs({
            _type: 'attribute',
            _characterid: charId,
            name: etat
          });
        if (value) {
          if (attrEtat.length === 0) {
            attrEtat =
              createObj('attribute', {
                characterid: charId,
                name: etat,
                current: value
              });
            if (_.has(evt, 'attributes'))
              evt.attributes.push({
                attribute: attrEtat,
                current: null
              });
            else evt.attributes = [{
              attribute: attrEtat,
              current: null
            }];
          }
        } else {
          if (attrEtat.length > 0) {
            attrEtat[0].remove();
            if (_.has(evt, 'deletedAttributes')) {
              evt.deletedAttributes.push(attrEtat[0]);
            } else {
              evt.deletedAttributes = [attrEtat[0]];
            }
          }
        }
      }
    }
    if (!value && etatRendInactif(etat) && isActive(personnage) ||
      etat == 'aveugle') updateInit(token, evt);
  }

  function logEvents() {
    var l = eventHistory.length;
    log("Historique de taille " + l);
    eventHistory.forEach(function(evt, i) {
      log("evt " + i);
      log(evt);
    });
  }

  function addEvent(evt) {
    evt.id = state.COFantasy.eventId++;
    eventHistory.push(evt);
    if (eventHistory.length > HISTORY_SIZE) {
      eventHistory.shift();
    }
  }

  function findEvent(id) {
    return eventHistory.find(function(evt) {
      return (evt.id == id);
    });
  }

  function lastEvent() {
    var l = eventHistory.length;
    if (l === 0) return undefined;
    return eventHistory[l - 1];
  }

  function undoEvent() {
    var evt = eventHistory.pop();
    if (evt === undefined) {
      error("No event to undo", eventHistory);
      return;
    }
    sendChat("COFantasy", "/w GM undo " + evt.type);
    if (_.has(evt, 'affectes')) undoTokenEffect(evt);
    if (_.has(evt, 'attributes')) {
      // some attributes where modified too
      evt.attributes.forEach(function(attr) {
        if (attr.current === null) attr.attribute.remove();
        else {
          attr.attribute.set('current', attr.current);
          if (attr.max) attr.attribute.set('max', attr.max);
        }
      });
    }
    // deletedAttributes have a quadratic cost in the size of the history
    if (_.has(evt, 'deletedAttributes')) {
      evt.deletedAttributes.forEach(function(attr) {
        var oldId = attr.id;
        var nameDel = attr.get('name');
        log("Restoring attribute " + nameDel);
        var newAttr =
          createObj('attribute', {
            characterid: attr.get('characterid'),
            name: nameDel,
            current: attr.get('current'),
            max: attr.get('max')
          });
        eventHistory.forEach(function(evt) {
          if (evt.attributes !== undefined) {
            evt.attributes.forEach(function(attr) {
              if (attr.attribute.id == oldId) attr.attribute = newAttr;
            });
          }
        });
      });
    }
    if (_.has(evt, 'combat')) state.COFantasy.combat = evt.combat;
    if (_.has(evt, 'combat_pageid')) state.COFantasy.combat_pageid = evt.combat_pageid;
    if (_.has(evt, 'tour')) state.COFantasy.tour = evt.tour;
    if (_.has(evt, 'init')) state.COFantasy.init = evt.init;
    if (_.has(evt, 'updateNextInitSet'))
      updateNextInitSet = evt.updateNextInitSet;
    if (_.has(evt, 'turnorder'))
      Campaign().set('turnorder', evt.turnorder);
    if (_.has(evt, 'initiativepage'))
      Campaign().set('initiativepage', evt.initiativepage);
    return;
  }

  function undoTokenEffect(evt) {
    evt.affectes.forEach(function(aff) {
      var prev = aff.prev;
      var tok = aff.affecte;
      if (prev === undefined || tok === undefined) {
        error("Pas d'état précédant", aff);
        return;
      }
      _.each(prev, function(val, key, l) {
        tok.set(key, val);
      });
      sendChat("COF", "État de " + tok.get("name") + " restauré.");
    });
  }

  function caracOfMod(m) {
    switch (m) {
      case 'FOR':
        return 'FORCE';
      case 'DEX':
        return 'DEXTERITE';
      case 'CON':
        return 'CONSTITUTION';
      case 'INT':
        return 'INTELLIGENCE';
      case 'SAG':
        return 'SAGESSE';
      case 'CHA':
        return 'CHARISME';
      default:
        return;
    }
  }

  function modCarac(charId, carac) {
    var res = Math.floor((charAttributeAsInt(charId, carac, 10) - 10) / 2);
    return res;
  }

  //Renvoie le token et le charId. Si l'id ne correspond à rien, cherche si 
  //on trouve un nom de token, sur la page passée en argument (ou sinon
  //sur la page active de la campagne)
  function tokenOfId(id, name, pageId) {
    var token = getObj('graphic', id);
    if (token === undefined) {
      if (name === undefined) return undefined;
      if (pageId === undefined) {
        pageId = Campaign().get('playerpageid');
      }
      var tokens = findObjs({
        _type: 'graphic',
        _subtype: 'token',
        _pageid: pageId,
        name: name
      });
      if (tokens.length === 0) return undefined;
      if (tokens.length > 1) {
        error("Ambigüité sur le choix d'un token : il y a " +
          tokens.length + " tokens nommés" + name, tokens);
      }
      token = tokens[0];
    }
    var charId = token.get('represents');
    if (charId === '') {
      error("le token sélectionné ne représente pas de personnage", token);
      return undefined;
    }
    return {
      token: token,
      charId: charId
    };
  }

  function jet(msg) {
    // Les arguments pour cof-jet sont :
    // - Caracteristique (FOR, DEX, CON, INT, SAG, CHA)
    // Les tokens sélectionnés sont ceux qui doivent faire le jet
    var args = msg.content.split(" ");
    if (args.length < 2) {
      error("Pas assez d'arguments pour !cof-jet: " + msg.content, args);
      return;
    }
    var caracteristique = args[1];
    if (isNotCarac(caracteristique)) {
      error("Caracteristique '" + caracteristique + "' non reconnue (FOR, DEX, CON, INT, SAG, CHA).", args);
      return;
    }
    var difficulte;
    if (args.length > 2) {
      difficulte = parseInt(args[2]);
      if (isNaN(difficulte)) difficulte = undefined;
    }
    var titre = "Jet de <b>" + caracOfMod(caracteristique) + "</b>";
    if (difficulte !== undefined) titre += " difficulté " + difficulte;
    getSelected(msg, function(selected) {
      if (selected.length === 0) {
        sendChat("COF", "/w " + msg.who + " !cof-jet sans sélection de token");
        log("!cof-jet requiert de sélectionner des tokens");
        return;
      }
      iterSelected(selected, function(perso) {
        var evt = {
          type: "Jet de " + caracteristique
        };
        var display = startFramedDisplay(msg.playerid, titre, perso);
        if (difficulte === undefined) {
          jetCaracteristique(perso, caracteristique,
            function(rolltext, total, d20, roll) {

              addLineToFramedDisplay(display, "<b>Résultat :</b> " + rolltext);
              addStatistics(msg.playerid, ["Jet de carac", caracteristique], roll);
              // Maintenant, on diminue la malédiction si le test est un échec
              var attrMalediction = tokenAttribute(perso, 'malediction');
              if (attrMalediction.length > 0) {
                if (d20 == 1) diminueMalediction(perso, evt, attrMalediction);
                else if (d20 < 20) {
                  var action = "<a href='!cof-resultat-jet " + state.COFantasy.eventId;
                  addLineToFramedDisplay(display, "L'action est-elle " + action + " reussi'>réussie</a> ou " + action + " rate'>ratée</a> ?");
                  evt.personnage = perso;
                  evt.attenteResultat = true;
                }
              }
              addEvent(evt);
              sendChat('', endFramedDisplay(display));
            });
        } else {
          testCaracteristique(perso, caracteristique, [], difficulte, 0, evt, function(reussite, rolltext) {
            addLineToFramedDisplay(display, "<b>Résultat :</b> " + rolltext);
            if (reussite) {
              addLineToFramedDisplay(display, "C'est réussi");
            } else {
              addLineToFramedDisplay(display, "C'est raté");
            }
            addEvent(evt);
            sendChat('', endFramedDisplay(display));
          });
        }
      }); //fin de iterSelected
    }); //fin de getSelected
  }

  function resultatJet(msg) {
    var args = msg.content.split(' ');
    if (args.length < 3) {
      error("La fonction !cof-resultat-jet n'a pas assez d'arguments", args);
      return;
    }
    var evt = findEvent(args[1]);
    if (evt === undefined) {
      error("Le jet est trop ancien ou éte annulé", args);
      return;
    }
    if (evt.personnage === undefined) {
      error("Erreur interne ", evt);
      return;
    }
    if (evt.attenteResultat) {
      var message = evt.type + " ";
      if (args[2] == 'rate') {
        diminueMalediction(evt.personnage, evt);
        message += "raté.";
      } else message += "réussi.";
      sendChar(evt.personnage.charId, message);
      evt.attenteResultat = undefined;
    } else {
      sendChat(msg.who, "Résultat déjà décidé");
    }
  }

  //callback called on a object whose members are the allies
  function listeAllies(personnage, callback) {
    personnage.name =
      personnage.name || getObj('character', personnage.charId).get('name');
    if (personnage.name === undefined) {
      error("Personnage sans nom", personnage);
      return;
    }
    var result = {};
    var toutesEquipes = findObjs({
      _type: 'handout'
    });
    toutesEquipes = toutesEquipes.filter(function(obj) {
      return (obj.get('name').startsWith("Equipe "));
    });
    var count = toutesEquipes.length;
    toutesEquipes.forEach(function(equipe) {
      equipe.get('notes', function(note) { //asynchrone
        var names = note.split('<br>');
        if (names.indexOf(personnage.name) >= 0) {
          names.forEach(function(n) {
            result[n] = true;
          });
        }
        count--;
        if (count === 0) callback(result);
        return;
      });
    }); //end toutesEquipes.forEach
    //callback should be called now
  }

  function parseAttack(msg) {
    // Arguments to cof-attack should be:
    // - attacking token
    // - target token
    // - attack number (referring to the character sheet)
    // - some optional arguments, preceded by --

    var optArgs = msg.content.split(" --");
    var args = optArgs[0].split(" ");
    optArgs.shift();
    if (args.length < 4) {
      error("Pas assez d'arguments pour !cof-attack: " + msg.content, args);
      return;
    }
    var attaquant = tokenOfId(args[1]);
    if (attaquant === undefined) {
      error("Le premier argument de !cof-attack n'est pas un token valide" + msg.content, args[1]);
      return;
    }
    var targetToken = getObj("graphic", args[2]);
    if (targetToken === undefined) {
      error("le second argument de !cof-attack doit être un token" + msg.content, args[2]);
      return;
    }
    var attackLabel = args[3];
    // Optional arguments
    var options = {
      additionalDmg: []
    };
    var lastEtat; //dernier de etats et effets
    optArgs.forEach(function(arg) {
      arg = arg.trim();
      var cmd = arg.split(" ");
      if (cmd.length === 0) cmd = [arg];
      switch (cmd[0]) {
        case "auto":
        case "tempDmg":
        case "poudre":
        case "strigeSuce":
        case "semonce":
        case "pointsVitaux":
        case "pressionMortelle":
        case "reroll1":
        case "tirDouble":
        case "tranchant":
        case "percant":
        case "contondant":
        case "imparable":
        case "traquenard":
        case "affute":
        case "vampirise":
        case "mainsDEnergie":
        case "tirDeBarrage":
        case "ignoreObstacles":
        case "enflamme":
        case "asDeLaGachette":
        case "sortilege":
        case "malediction":
        case "test":
        case "argent":
        case "pietine":
          options[cmd[0]] = true;
          return;
        case "magique":
          var niveauMagie = 1;
          if (cmd.length > 1) {
            niveauMagie = parseInt(cmd[1]);
            if (isNaN(niveauMagie) || niveauMagie < 1) {
              error("Le niveau de magie doit être au moins 1", cmd);
              niveauMagie = 1;
            }
          }
          options.magique = niveauMagie;
          return;
        case "si":
          options.conditionAttaquant = parseCondition(cmd.slice(1));
          return;
        case "plus":
          if (cmd.length < 2) {
            sendChat("COF", "Il manque un argument à l'option --plus de !cof-attack");
            return;
          }
          var val = arg.substring(arg.indexOf(' ') + 1);
          options.additionalDmg.push({
            value: val
          });
          break;
        case "effet":
          if (cmd.length < 3) {
            error("Il manque un argument à l'option --effet de !cof-attack", cmd);
            return;
          }
          if (!estEffetTemp(cmd[1])) {
            error(cmd[1] + " n'est pas un effet temporaire répertorié", cmd);
            return;
          }
          var duree;
          duree = parseInt(cmd[2]);
          if (isNaN(duree) || duree < 1) {
            error(
              "Le deuxième argument de --effet doit être un nombre positif",
              cmd);
            return;
          }
          options.effets = options.effets || [];
          lastEtat = {
            effet: cmd[1],
            duree: duree
          };
          options.effets.push(lastEtat);
          return;
        case "etatSi":
          if (cmd.length < 3) {
            error("Il manque un argument à l'option --etatSi de !cof-attack", cmd);
            return;
          }
          var etat = cmd[1];
          if (!_.has(cof_states, etat)) {
            error("Etat non reconnu", cmd);
            return;
          }
          var condition = parseCondition(cmd.slice(2));
          if (condition === undefined) return;
          options.etats = options.etats || [];
          lastEtat = {
            etat: etat,
            condition: condition
          };
          options.etats.push(lastEtat);
          return;
        case "peur":
          if (cmd.length < 3) {
            error("Il manque un argument à l'option --peur de !cof-attack", cmd);
            return;
          }
          options.peur = {
            seuil: parseInt(cmd[1]),
            duree: parseInt(cmd[2])
          };
          if (isNaN(options.peur.seuil)) {
            error("Le premier argument de --peur doit être un nombre (le seuil)", cmd);
          }
          if (isNaN(options.peur.duree) || options.peur.duree <= 0) {
            error("Le deuxième argument de --peur doit être un nombre positif (la durée)", cmd);
          }
          return;
        case "feu":
        case "froid":
        case "acide":
        case "electrique":
        case "sonique":
        case "poison":
        case "maladie":
          var l = options.additionalDmg.length;
          if (l > 0) {
            options.additionalDmg[l - 1].type = cmd[0];
          } else {
            options.type = cmd[0];
          }
          break;
        case "sournoise":
        case "de6Plus":
          if (cmd.length < 2) {
            sendChat("COF", "Il manque un argument à l'option --de6Plus de !cof-attack");
            return;
          }
          options.de6Plus = parseInt(cmd[1]);
          if (isNaN(options.de6Plus) || options.de6Plus < 0) {
            error("L'option --de6Plus de !cof-attack attend un argument entier positif", cmd);
            return;
          }
          break;
        case "fx":
          if (cmd.length < 2) {
            sendChat("COF", "Il manque un argument à l'option --fx de !cof-attack");
            return;
          }
          options.fx = cmd[1];
          break;
        case 'psave':
          var psaveopt = options;
          if (cmd.length > 3 && cmd[3] == 'local') {
            var psavel = options.additionalDmg.length;
            if (psavel > 0) {
              psaveopt = options.additionalDmg[psavel - 1];
            }
          }
          var psaveParams = parseSave(cmd);
          if (psaveParams) {
            psaveopt.partialSave = psaveParams;
            psaveopt.attaquant = attaquant;
          }
          return;
        case 'save':
          if (lastEtat) {
            if (lastEtat.save) {
              error("Redéfinition de la condition de save pour un effet", optArgs);
            }
            var saveParams = parseSave(cmd);
            if (saveParams) {
              lastEtat.save = saveParams;
              return;
            }
            return;
          }
          error("Pas d'effet auquel appliquer le save", optArgs);
          return;
        case 'saveParTour':
          if (lastEtat) {
            if (lastEtat.saveParTour) {
              error("Redéfinition de la condition de save pour un effet", optArgs);
            }
            var saveParTourParams = parseSave(cmd);
            if (saveParTourParams) {
              lastEtat.saveParTour = saveParTourParams;
              return;
            }
            return;
          }
          error("Pass d'effet auquel appliquer le save", optArgs);
          return;
        case "mana":
          if (cmd.length < 2) {
            error("Usage : --mana coût", cmd);
            return;
          }
          var mana = parseInt(cmd[1]);
          if (isNaN(mana) || mana < 1) {
            error("Le coût en mana doit être un nombre positif");
            return;
          }
          options.mana = mana;
          break;
        case "bonusAttaque":
        case "bonusContreBouclier":
        case "bonusCritique":
          if (cmd.length < 2) {
            error("Usage : --" + cmd[0] + " b", cmd);
            return;
          }
          var bAtt = parseInt(cmd[1]);
          if (isNaN(bAtt)) {
            error("Le bonus (" + cmd[0] + ") doit être un nombre");
            return;
          }
          options[cmd[0]] = bAtt;
          return;
        case "puissant":
          if (cmd.length < 2) {
            options.puissant = true;
            return;
          }
          switch (cmd[1]) {
            case 'oui':
            case 'Oui':
              options.puissant = true;
              return;
            case 'non':
            case 'Non':
              options.puissant = false;
              return;
            default:
              options.puissant = attributeAsBool(attaquant, cmd[1] + "Puissant");
          }
          return;
        case "rate":
        case "touche":
        case "critique":
        case "echecCritique":
          if (options.triche === undefined) {
            options.triche = cmd[0];
          } else {
            error("Option incompatible", optArgs);
          }
          return;
        case 'munition':
          if (cmd.length < 2) {
            error("Pour les munitions, il faut préciser le nom", cmd);
            return;
          }
          var tauxPertes = 100; //Par défaut, les munitions sont perdues
          if (cmd.length > 2)
            tauxPertes = parseInt(cmd[2]);
          if (isNaN(tauxPertes) || tauxPertes < 0 || tauxPertes > 100) {
            error("Le taux de pertes des munitions doit être un nombre entre 0 et 100");
            tauxPertes = 100;
          }
          options.munition = {
            nom: cmd[1],
            taux: tauxPertes
          };
          return;
        case "ligne":
          if (options.aoe) {
            error("Deux options pour définir une aoe", args);
            return;
          }
          options.aoe = {
            type: 'ligne'
          };
          return;
        case "disque":
          if (options.aoe) {
            error("Deux options pour définir une aoe", args);
            return;
          }
          if (cmd.length < 2) {
            error("Il manque le rayon du disque", cmd);
            return;
          }
          options.aoe = {
            type: 'disque',
            rayon: parseInt(cmd[1])
          };
          if (isNaN(options.aoe.rayon) || options.aoe.disque < 0) {
            error("le rayon du disque n'est pas un nombre positif", cmd);
            options.aoe = undefined;
          }
          return;
        case "cone":
          if (options.aoe) {
            error("Deux options pour définir une aoe", args);
            return;
          }
          var angle = 90;
          if (cmd.length > 1) {
            angle = parseInt(cmd[1]);
            if (isNaN(angle) || angle < 0 || angle > 360) {
              error("Paramètre d'angle du cone incorrect", cmd);
              angle = 90;
            }
          }
          options.aoe = {
            type: 'cone',
            angle: angle
          };
          return;
        case 'limiteParJour':
          if (cmd.length < 2) {
            error("Il manque la limite journalière", cmd);
            return;
          }
          var limiteParJour = parseInt(cmd[1]);
          if (isNaN(limiteParJour) || limiteParJour < 1) {
            error("La limite journalière doit être un nombre positif", cmd);
            return;
          }
          options.limiteParJour = limiteParJour;
          if (cmd.length > 2) {
            options.limiteParJourRessource = cmd[2];
          }
          return;
        case 'limiteParCombat':
          if (cmd.length < 2) {
            options.limiteParCombat = 1;
            return;
          }
          var limiteParCombat = parseInt(cmd[1]);
          if (isNaN(limiteParCombat) || limiteParCombat < 1) {
            error("La limite par combat doit être un nombre positif", cmd);
            return;
          }
          options.limiteParCombat = limiteParCombat;
          if (cmd.length > 2) {
            options.limiteParCombatRessource = cmd[2];
          }
          return;
        default:
          sendChat("COF", "Argument de !cof-attack '" + arg + "' non reconnu");
      }
    });
    attack(msg.playerid, attaquant, targetToken, attackLabel, options);
  }

  function sendChar(charId, msg) {
    var dest = '';
    if (charId) dest = 'character|' + charId;
    sendChat(dest, msg);
  }

  // Fait dépenser de la mana, et si pas possible, retourne false
  function depenseMana(personnage, cout, msg, evt) {
    var token = personnage.token;
    var charId = personnage.charId;
    var manaAttr = findObjs({
      _type: 'attribute',
      _characterid: charId,
      name: 'PM'
    });
    var hasMana = false;
    if (manaAttr.length > 0) {
      var manaMax = parseInt(manaAttr[0].get('max'));
      hasMana = !isNaN(manaMax) && manaMax > 0;
    }
    if (hasMana) {
      var bar2 = parseInt(token.get("bar2_value"));
      if (isNaN(bar2)) bar2 = 0;
      if (bar2 < cout) {
        msg = msg || '';
        sendChar(charId, " n'a pas assez de points de mana pour " + msg);
        return false;
      }
      evt.affectes = evt.affectes || [];
      evt.affectes.push({
        affecte: token,
        prev: {
          bar2_value: bar2
        }
      });
      updateCurrentBar(token, 2, bar2 - cout);
      return true;
    }
    sendChar(charId, " n'a pas de points de mana, action impossible");
    return false;
  }

  function parseSave(cmd) {
    if (cmd.length < 3) {
      error("Usage : --psave carac seuil", cmd);
      return;
    }
    var carac1;
    var carac2;
    if (cmd[1].length == 3) {
      carac1 = cmd[1];
      if (isNotCarac(cmd[1])) {
        error("Le premier argument de save n'est pas une caractéristique", cmd);
        return;
      }
    } else if (cmd[1].length == 6) { //Choix parmis 2 caracs
      carac1 = cmd[1].substr(0, 3);
      carac2 = cmd[1].substr(3, 3);
      if (isNotCarac(carac1) || isNotCarac(carac2)) {
        error("Le premier argument de save n'est pas une caractéristique", cmd);
        return;
      }
    } else {
      error("Le premier argument de save n'est pas une caractéristique", cmd);
      return;
    }

    var res = {
      carac: carac1,
      carac2: carac2,
      seuil: parseInt(cmd[2])
    };
    if (isNaN(res.seuil)) {
      error("Le deuxième argument de --psave n'est pas un nombre", cmd);
      return;
    }
    return res;
  }

  function parseCondition(args) {
    if (args.length < 2) {
      error("condition non reconnue", args);
      return undefined;
    }
    switch (args[0]) {
      case "etat":
        if (_.has(cof_states, args[1])) {
          return {
            type: 'etat',
            etat: args[1],
            text: args[1]
          };
        }
        return {
          type: 'attribut',
          attribute: args[1],
          text: args[1]
        };
      case "deAttaque":
        var valeurDeAttaque = parseInt(args[1]);
        if (isNaN(valeurDeAttaque)) {
          error("La condition de dé d'attaque doit être un nombre", args);
          // on continue exprès pour tomber dans le cas par défaut
        } else {
          return {
            type: 'deAttaque',
            seuil: valeurDeAttaque,
            text: args[1]
          };
        }
        /* falls through */
      default:
        return {
          type: args[0],
          attribute: args[1],
          text: args[1]
        };
    }
  }

  function testCondition(cond, attaquant, cibles, deAttaque) {
    switch (cond.type) {
      case "moins":
        var attackerAttr = charAttributeAsInt(attaquant.charId, cond.attribute, 0);
        var resMoins = true;
        cibles.forEach(function(target) {
          if (resMoins) {
            var targetAttr = charAttributeAsInt(target.charId, cond.attribute, 0);
            if (targetAttr >= attackerAttr) resMoins = false;
          }
        });
        return resMoins;
      case "etat":
        return (getState(attaquant, cond.etat));
      case "attribut":
        return (charAttributeAsBool(attaquant.charId, cond.attribute));
      case "deAttaque":
        if (deAttaque === undefined) {
          error("Condition de dé d'attque non supportée ici", cond);
          return true;
        }
        if (deAttaque < cond.seuil) return false;
        return true;
      default:
        error("Condition non reconnue", cond);
    }
    return false;
  }

  // bonus d'attaque d'un token, indépendament des options
  // Mise en commun pour attack et attaque-magique
  function bonusDAttaque(personnage, explications, evt) {
    explications = explications || [];
    var charId = personnage.charId;
    var tempAttkMod; // Utilise la barre 3 de l'attaquant
    tempAttkMod = parseInt(personnage.token.get("bar3_value"));
    if (tempAttkMod === undefined || isNaN(tempAttkMod) || tempAttkMod === "") {
      tempAttkMod = 0;
    }
    var attBonus = tempAttkMod;
    var fortifie = attributeAsInt(personnage, 'fortifie', 0);
    if (fortifie > 0) {
      attBonus += 3;
      fortifie--;
      explications.push("Effet du fortifiant => +3 en Attaque. Il sera encore actif pour " + fortifie + " tests");
      if (fortifie === 0) {
        removeTokenAttr(personnage, 'fortifie', evt);
      } else {
        setTokenAttr(personnage, 'fortifie', fortifie, evt);
      }
    }
    attBonus += charAttributeAsInt(charId, 'actionConcertee', 0);
    if (attributeAsBool(personnage, 'chant_des_heros')) {
      attBonus += 1;
      explications.push("Chant des héros => +1 en Attaque");
    }
    if (attributeAsBool(personnage, 'benediction')) {
      attBonus += 1;
      explications.push("Bénédiction => +1 en Attaque");
    }
    if (attributeAsBool(personnage, 'strangulation')) {
      var malusStrangulation =
        1 + attributeAsInt(personnage, 'dureeStrangulation', 0);
      attBonus -= malusStrangulation;
      explications.push("L'attaquant est étranglé => -" + malusStrangulation + " en Attaque");
    }
    if (getState(personnage, 'renverse')) {
      attBonus -= 5;
      explications.push("Attaquant à terre => -5 en Attaque");
    }
    var attrPosture = tokenAttribute(personnage, 'postureDeCombat');
    if (attrPosture.length > 0) {
      attrPosture = attrPosture[0];
      var posture = attrPosture.get('max');
      var postureVal;
      if (posture.startsWith('ATT')) {
        postureVal = parseInt(attrPosture.get('current'));
        attBonus -= postureVal;
        explications.push("Posture de combat => -" + postureVal + " en Attaque");
      } else if (posture.endsWith('ATT')) {
        postureVal = parseInt(attrPosture.get('current'));
        attBonus += postureVal;
        explications.push("Posture de combat => +" + postureVal + " en Attaque");
      }
    }
    if (attributeAsBool(personnage, 'danseIrresistible')) {
      attBonus -= 4;
      explications.push("En train de danser => -4 en Attaque");
    }
    if (aUnCapitaine(personnage, evt)) {
      attBonus += 2;
      explications.push("Un capitaine donne des ordres => +2 en Attaque");
    }
    if (attributeAsBool(personnage, 'forceDeGeant')) {
      attBonus += 2;
      explications.push("Force de géant => +2 en Attaque");
    }
    if (attributeAsBool(personnage, 'nueeDInsectes')) {
      attBonus -= 2;
      explications.push("Nuée d’insectes => -2 en Attaque");
    }
    if (attributeAsBool(personnage, 'marcheSylvestre')) {
      attBonus += 2;
      explications.push("Marche sylvestre : +2 en Attaque");
    }
    if (attributeAsBool(personnage, 'prisonVegetale')) {
      attBonus -= 2;
      explications.push("Prison végétale : -2 en Attaque");
    }
    return attBonus;
  }

  function rollNumber(s) {
    return parseInt(s.substring(3, s.indexOf(']')));
  }

  function getAttack(attackLabel, tokName, charId) {
    // Get attack number (does not correspond to the position in sheet !!!)
    var attackNumber = 0;
    var attPrefix, weaponName;
    while (true) {
      attPrefix = "repeating_armes_$" + attackNumber + "_";
      weaponName = getAttrByName(charId, attPrefix + "armenom");
      if (weaponName === undefined || weaponName === "") {
        error("Arme " + attackLabel + " n'existe pas pour " + tokName, charId);
        return;
      }
      var weaponLabel = weaponName.split(' ', 1)[0];
      if (weaponLabel == attackLabel) {
        weaponName = weaponName.substring(weaponName.indexOf(' ') + 1);
        return {
          attackPrefix: attPrefix,
          weaponName: weaponName
        };
      }
      attackNumber++;
    }
  }

  function surveillance(personnage) {
    var surveillance = findObjs({
      _type: 'attribute',
      _characterid: personnage.charId,
      name: 'surveillance'
    });
    if (surveillance.length > 0) {
      var compagnon = surveillance[0].get('current');
      var compToken = findObjs({
        _type: 'graphic',
        _subtype: 'token',
        _pageid: personnage.token.get('pageid'),
        layer: 'objects',
        name: compagnon
      });
      var compagnonPresent = false;
      compToken.forEach(function(tok) {
        var compCharId = tok.get('represents');
        if (compCharId === '') return;
        if (isActive({
            token: tok,
            charId: compCharId
          })) compagnonPresent = true;
        return;
      });
      return compagnonPresent;
    }
    return false;
  }

  function tokenInit(perso, evt) {
    var persoMonte = tokenAttribute(perso, 'estMontePar');
    if (persoMonte.length > 0) {
      var cavalier = tokenOfId(persoMonte[0].get('current'), persoMonte[0].get('max'), perso.token.get('pageid'));
      if (cavalier !== undefined) return tokenInit(cavalier, evt);
    }
    var charId = perso.charId;
    var init = parseInt(getAttrByName(charId, 'DEXTERITE'));
    init += charAttributeAsInt(charId, 'INIT_DIV', 0);
    if (getState(perso, 'aveugle')) init -= 5;
    // Voie du compagnon animal rang 2 (surveillance)
    if (surveillance(perso)) init += 5;
    // Voie du chef d'armée rang 2 (Capitaine)
    if (aUnCapitaine(perso, evt)) init += 2;
    if (charAttributeAsBool(perso, 'graceFeline')) {
      init += modCarac(charId, 'CHARISME');
    }
    // Voie du pistolero rang 1 (plus vite que son ombre)
    attributesInitEnMain(charId).forEach(function(em) {
      var armeL = labelInitEnMain(em);
      if (charAttributeAsInt(charId, "charge_" + armeL, 0) > 0) {
        var initBonus = parseInt(em.get('current'));
        if (isNaN(initBonus) || initBonus < 0) {
          error("initBonusEnMain incorrect :" + initBonus, em);
          return;
        }
        init += initBonus;
      }
    });
    return init;
  }

  //fonction avec callback, mais synchrone
  function soigneToken(token, soins, evt, callTrue, callMax) {
    var bar1 = parseInt(token.get("bar1_value"));
    var pvmax = parseInt(token.get("bar1_max"));
    if (isNaN(bar1) || isNaN(pvmax)) {
      error("Soins sur un token sans points de vie", token);
      return;
    }
    if (bar1 >= pvmax) {
      if (callMax) callMax();
      return;
    }
    if (soins < 0) soins = 0;
    if (evt.affectes === undefined) evt.affectes = [];
    evt.affectes.push({
      affecte: token,
      prev: {
        bar1_value: bar1
      }
    });
    bar1 += soins;
    var soinsEffectifs = soins;
    if (bar1 > pvmax) {
      soinsEffectifs -= (bar1 - pvmax);
      bar1 = pvmax;
    }
    updateCurrentBar(token, 1, bar1);
    if (callTrue) callTrue(soinsEffectifs);
  }

  //asynchrone pour avoir les alliés (pour le combat en phalange)
  function defenseOfToken(attaquant, target, pageId, evt, options, callback) {
    options = options || {};
    var charId = target.charId;
    var tokenName = target.tokName;
    var explications = target.messages;
    var defense = 10;
    if (target.defautCuirasse === undefined) {
      defense += charAttributeAsInt(charId, 'DEFARMURE', 0) * charAttributeAsInt(charId, 'DEFARMUREON', 1);
      defense += charAttributeAsInt(charId, 'DEFBOUCLIER', 0) * charAttributeAsInt(charId, 'DEFBOUCLIERON', 1);
      if (attributeAsBool(target, 'armureDuMage')) {
        if (defense > 12) defense += 2; // On a déjà une armure physique, ça ne se cumule pas.
        else defense += 4;
      }
      defense += charAttributeAsInt(charId, 'DEFDIV', 0);
    } // Dans le cas contraire, on n'utilise pas ces bonus
    defense += modCarac(charId, 'DEXTERITE');
    // Malus de défense global pour les longs combats
    if (DEF_MALUS_APRES_TOUR_5)
      defense -= (Math.floor((state.COFantasy.tour - 1) / 5) * 2);
    // Autres modificateurs de défense
    defense += attributeAsInt(target, 'defenseTotale', 0);
    defense += attributeAsInt(target, 'pacifisme', 0);
    if (attributeAsBool(target, 'peau_d_ecorce')) {
      defense += charAttributeAsInt(charId, 'voieDesVegetaux', 0);
    }
    if (getState(target, 'surpris')) defense -= 5;
    if (getState(target, 'renverse')) defense -= 5;
    if (getState(target, 'aveugle')) defense -= 5;
    if (getState(target, 'etourdi') || attributeAsBool(target, 'peurEtourdi'))
      defense -= 5;
    defense += attributeAsInt(target, 'bufDEF', 0);
    defense += attributeAsInt(target, 'actionConcertee', 0);
    if (charAttributeAsInt(charId, 'DEFARMUREON', 1) === 0) {
      defense += charAttributeAsInt(charId, 'vetementsSacres', 0);
      defense += charAttributeAsInt(charId, 'armureDeVent', 0);
      if (!options.distance)
        defense += charAttributeAsInt(charId, 'dentellesEtRapiere', 0);
    }
    if (charAttributeAsBool(target, 'graceFeline')) {
      defense += modCarac(charId, 'CHARISME');
    }
    var attrsProtegePar = findObjs({
      _type: 'attribute',
      _characterid: charId,
    });
    attrsProtegePar.forEach(function(attr) {
      var attrName = attr.get('name');
      if (attrName.startsWith('protegePar_')) {
        var nameProtecteur = attr.get('max');
        if (attr.get('bar1_link') === '') {
          if (attrName != 'protegePar_' + nameProtecteur + '_' + tokenName) return;
        } else if (attrName != 'protegePar_' + nameProtecteur) return;
        var protecteur = tokenOfId(attr.get('current'), nameProtecteur, pageId);
        if (protecteur === undefined) {
          removeTokenAttr(target, 'protegePar_' + nameProtecteur, evt);
          sendChar(charId, "ne peut pas être protégé par " + nameProtecteur + " car aucun token le représentant n'est sur la page");
          return;
        }
        if (!isActive(protecteur)) {
          explications.push(nameProtecteur + " n'est pas en état de protéger " +
            tokenName);
          return;
        }
        var distTargetProtecteur = distanceCombat(target.token, protecteur.token, pageId);
        if (distTargetProtecteur > 0) {
          explications.push(nameProtecteur + " est trop loin de " +
            tokenName + " pour le protéger");
          return;
        }
        if (charAttributeAsInt(protecteur.charId, 'DEFBOUCLIERON', 1) === 0) {
          var sujet = onGenre(protecteur.charId, 'il', 'elle');
          explications.push(nameProtecteur +
            " ne porte pas son bouclier, " + sujet + " ne peut pas proteger " +
            tokenName);
          return;
        }
        var defBouclierProtecteur = charAttributeAsInt(protecteur.charId, 'DEFBOUCLIER', 0);
        defense += defBouclierProtecteur;
        explications.push(nameProtecteur + " protège " +
          tokenName + " de son bouclier (+" + defBouclierProtecteur + "DEF)");
      }
    });
    var attrPosture = tokenAttribute(target, 'postureDeCombat');
    if (attrPosture.length > 0) {
      attrPosture = attrPosture[0];
      var posture = attrPosture.get('max');
      var postureVal;
      if (posture.startsWith('DEF')) {
        postureVal = parseInt(attrPosture.get('current'));
        defense -= postureVal;
        explications.push("Posture de combat => -" + postureVal + " DEF");
      } else if (posture.endsWith('DEF')) {
        postureVal = parseInt(attrPosture.get('current'));
        defense += postureVal;
        explications.push("Posture de combat => +" + postureVal + " DEF");
      }
    }
    var instinctSurvie = charAttributeAsInt(charId, 'instinctDeSurvie', 0);
    if (instinctSurvie > 0 && target.token.get('bar1_value') <= instinctSurvie)
      defense += 5;
    if (attributeAsBool(target, 'danseIrresistible')) {
      defense -= 4;
      explications.push("En train de danser => -4 DEF");
    }
    if (options.sortilege)
      defense += charAttributeAsInt(target.charId, 'DEF_magie', 0);
    if (attributeAsBool(target, 'marcheSylvestre')) {
      defense += 2;
      explications.push("Marche sylvestre => +2 DEF");
    }
    if (attributeAsBool(target, 'prisonVegetale')) {
      defense -= 2;
      explications.push("Prison végétale => -2 DEF");
    }
    if (attributeAsBool(target, 'protectionContreLeMal') &&
      estMauvais(attaquant)) {
      defense += 2;
      explications.push("Protection contre le mal => +2 DEF");
    }
    if (charAttributeAsBool(target, 'combatEnPhalange')) {
      listeAllies(target, function(allies) {
        var tokensContact = findObjs({
          _type: 'graphic',
          _subtype: "token",
          _pageid: pageId,
          layer: 'objects'
        });
        tokensContact = tokensContact.filter(function(tok) {
          if (tok.id == target.token.id) return false;
          if (distanceCombat(target.token, tok, pageId) === 0) return true;
          return false;
        });
        var tokensAllies = [];
        var tokensEnnemis = [];
        tokensContact.forEach(function(tok) {
          var ci = tok.get('represents');
          if (ci === '') return; //next token au contact
          var ch = getObj('character', ci);
          if (ch === undefined) return;
          if (!isActive({
              token: tok,
              charId: ci
            })) return;
          var n = ch.get('name');
          if (n === undefined) return;
          if (allies[n]) tokensAllies.push(tok);
          else tokensEnnemis.push(tok);
        });
        var defensePhalange = 0;
        tokensEnnemis.forEach(function(tokE) {
          var alliesAuContact = tokensAllies.filter(function(tokA) {
            if (distanceCombat(tokE, tokA, pageId) === 0) return true;
            return false;
          });
          if (alliesAuContact.length > defensePhalange)
            defensePhalange = alliesAuContact.length;
        });
        if (defensePhalange > 0) {
          defense += defensePhalange;
          explications.push("Combat en phalange => +" + defensePhalange + " DEF");
        }
        callback(defense);
      }); //fin listeAllies
    } else callback(defense);
  }

  //Bonus en Attaque qui ne dépendent pas du défenseur
  function bonusAttaqueA(attaquant, name, weaponName, evt, explications, options) {
    var attBonus = 0;
    if (options.bonusAttaque) attBonus += options.bonusAttaque;
    attBonus += bonusDAttaque(attaquant, explications, evt);
    if (getState(attaquant, 'aveugle')) {
      if (options.distance) {
        if (charAttributeAsBool(attaquant, 'tirAveugle')) {
          explications.push("Attaquant aveuglé, mais il sait tirer à l'aveugle");
        } else {
          attBonus -= 10;
          explications.push("Attaquant aveuglé => -10 en Attaque à distance");
        }
      } else {
        attBonus -= 5;
        explications.push("Attaquant aveuglé => -5 en Attaque");
      }
    }
    if (options.tirDouble) {
      attBonus += 2;
      explications.push(name + " tire avec 2 " + weaponName + "s à la fois !");
    }
    if (options.chance) {
      attBonus += options.chance;
      var pc = options.chance / 10;
      explications.push(pc + " point" + ((pc > 1) ? "s" : "") + " de chance dépensé => +" + options.chance + " en Attaque");
    }
    if (options.semonce) {
      attBonus += 5;
    }
    if (attributeAsBool(attaquant, 'baroudHonneurActif')) {
      attBonus += 5;
      explications.push(name + " porte une dernière attaque et s'effondre");
      setState(attaquant, 'mort', true, evt);
      removeTokenAttr(attaquant, 'baroudHonneurActif', evt);
    }
    if (options.sortilege && attributeAsBool(attaquant, 'zoneDeSilence')) {
      attBonus -= 2;
      explications.push("Zone de silence => -2 en Attaque Magique");
    }
    if (!options.distance && (attributeAsBool(attaquant, 'aCheval') || attributeAsBool(attaquant, 'monteSur'))) {
      attBonus += charAttributeAsInt(attaquant, 'cavalierEmerite');
      explications.push("A cheval => +2 en Attaque");
    }
    return attBonus;
  }

  //Bonus d'attaque qui dépendent de la cible
  // si options.aoe, target doit avoir un champ tokName
  // asynchrone pour pouvoir tenir compte des alliés (pour le combat en phalange)
  function bonusAttaqueD(attaquant, target, portee, pageId, evt, explications, options, callback) {
    var attackingCharId = attaquant.charId;
    attaquant.tokName = attaquant.tokName || attaquant.token.get('name');
    var attackerTokName = attaquant.tokName;
    var attBonus = 0;
    if (options.mainsDEnergie) {
      if (options.aoe) error("Mains d'énergie n'est pas compatible avec les AOE", options.aoe);
      // Check if target wears armor
      var targetArmorDef = parseInt(getAttrByName(target.charId, "DEFARMURE"));
      if (isNaN(targetArmorDef) || targetArmorDef === 0) {
        attBonus += 2;
        explications.push("Mains d'énergie => +2 en Attaque (cible sans armure)");
      } else {
        var bonusMain = Math.min(5, 2 + targetArmorDef);
        attBonus += bonusMain;
        explications.push("Mains d'énergie => +" + bonusMain + " en Attaque");
      }
    }
    if (options.aoe === undefined && options.auto === undefined && portee > 0) {
      attBonus -=
        malusDistance(attaquant, target.token, target.distance, portee, pageId,
          explications, options.ignoreObstacles);
    }
    var chasseurEmerite =
      charAttributeAsBool(attackingCharId, 'chasseurEmerite') &&
      charOfType(target.charId, "animal");
    if (chasseurEmerite) {
      attBonus += 2;
      var explChasseurEmerite = "Chasseur émérite => +2 en Attaque et aux DM";
      if (options.aoe) explChasseurEmerite += " contre " + target.tokName;
      explications.push(explChasseurEmerite);
      target.chasseurEmerite = true;
    }
    var ennemiJure = findObjs({
      _type: 'attribute',
      _characterid: attackingCharId,
      name: 'ennemiJure'
    });
    if (ennemiJure.length === 0) ennemiJure = false;
    else ennemiJure = raceIs(target, ennemiJure[0].get('current'));
    if (ennemiJure) {
      var ejSag = modCarac(attackingCharId, 'SAGESSE');
      attBonus += ejSag;
      var explEnnemiJure = "Attaque sur ennemi juré => +" + ejSag + " en attaque et +1d6 aux DM";
      if (options.aoe) explEnnemiJure += " contre " + target.tokName;
      explications.push(explEnnemiJure);
      target.ennemiJure = true;
    }
    if (options.argent) {
      if (estMortVivant(target) || raceIs(target, 'demon') || raceIs(target, 'démon')) {
        attBonus += 2;
        explications.push("Arme en argent => +2 en attaque et +1d6 aux DM");
        target.argent = true;
      }
    }
    if (options.bonusContreBouclier) {
      if (charAttributeAsInt(target, 'DEFBOUCLIERON', 1) &&
        charAttributeAsInt(target, 'DEFBOUCLIER', 0) > 0) {
        attBonus += options.bonusContreBouclier;
        explications.push("L'adversaire porte un bouclier => " + ((options.bonusContreBouclier > 0) ? '+' : '') + options.bonusContreBouclier + " en attaque");
      }
    }
    if (options.contact) {
      if (attributeAsBool(target, 'criDeGuerre') &&
        charAttributeAsInt(attackingCharId, 'FORCE', 10) <= charAttributeAsInt(target.charId, 'FORCE', 10) &&
        parseInt(attaquant.token.get("bar1_max")) <= parseInt(target.token.get("bar1_max"))) {
        attBonus -= 2;
        explications.push("Effrayé => -2 en Attaque");
      }
    }
    if (charAttributeAsBool(attaquant, 'combatEnPhalange')) {
      listeAllies(attaquant, function(allies) {
        var tokensContact = findObjs({
          _type: 'graphic',
          _subtype: "token",
          _pageid: pageId,
          layer: 'objects'
        });
        //On compte tokens au contas de l'attaquant et du défenseur et alliés de l'attaquant
        var alliesAuContact = 0;
        tokensContact.forEach(function(tok) {
          if (tok.id == attaquant.token.id) return;
          if (distanceCombat(target.token, tok, pageId) > 0) return;
          if (distanceCombat(attaquant.token, tok, pageId) > 0) return;
          var ci = tok.get('represents');
          if (ci === '') return;
          var ch = getObj('character', ci);
          if (ch === undefined) return;
          if (!isActive({
              token: tok,
              charId: ci
            })) return;
          var n = ch.get('name');
          if (n === undefined) return;
          if (allies[n]) alliesAuContact++;
        });
        if (alliesAuContact > 0) {
          attBonus += alliesAuContact;
          explications.push("Combat en phalange => +" + alliesAuContact + " en Attaque");
        }
        callback(attBonus);
      }); //fin listeAllies
    } else callback(attBonus);
  }

  function computeDice(lanceur, nbDe, dice, plusFort) {
    if (plusFort === undefined) plusFort = true;
    if (dice === undefined) dice = deTest(lanceur);
    if (attributeAsBool(lanceur, 'malediction')) {
      if (plusFort) {
        if (nbDe > 1) nbDe--;
        else {
          nbDe = 2;
          plusFort = false;
        }
      } else nbDe++;
    }
    var de = nbDe + "d" + dice;
    if (nbDe > 1) {
      if (plusFort) de += "kh1";
      else de += "kl1";
    }
    return de;
  }

  function diminueMalediction(lanceur, evt, attr) {
    var attrMalediction = attr || tokenAttribute(lanceur, 'malediction');
    if (attrMalediction.length > 0) {
      attrMalediction = attrMalediction[0];
      var nbMaudit = parseInt(attrMalediction.get('current'));
      if (isNaN(nbMaudit) || nbMaudit < 2) {
        evt.deletedAttributes = evt.deletedAttributes || [];
        evt.deletedAttributes.push(attrMalediction);
        attrMalediction.remove();
      } else {
        evt.attributes = evt.attributes || [];
        evt.attributes.push({
          attribute: attrMalediction,
          current: nbMaudit
        });
        attrMalediction.set('current', nbMaudit - 1);
      }
    }
  }


  function limiteRessources(personnage, options, defResource, msg, evt) {
    if (options.mana) {
      if (!depenseMana(personnage, options.mana, msg, evt)) {
        addEvent(evt);
        return true;
      }
    }
    var ressource = defResource;
    var utilisations;
    if (options.limiteParJour) {
      if (options.limiteParJourRessource)
        ressource = options.limiteParJourRessource;
      ressource = "limiteParJour_" + ressource;
      utilisations =
        attributeAsInt(personnage, ressource, options.limiteParJour);
      if (utilisations === 0) {
        sendChar(personnage.charId, "ne peut plus faire cette action ajourd'hui");
        addEvent(evt);
        return true;
      }
      setTokenAttr(personnage, ressource, utilisations - 1, evt);
    }
    if (options.limiteParCombat) {
      if (!state.COFantasy.combat) {
        sendChar(personnage.charId, "ne peut pas faire cette action en dehors des combats");
        addEvent(evt);
        return true;
      }
      if (options.limiteParCombatRessource)
        ressource = options.limiteParCombatRessource;
      ressource = "limiteParCombat_" + ressource;
      utilisations =
        attributeAsInt(personnage, ressource, options.limiteParCombat);
      if (utilisations === 0) {
        sendChar(personnage.charId, "ne peut plus faire cette action pour ce combat");
        addEvent(evt);
        return true;
      }
      setTokenAttr(personnage, ressource, utilisations - 1, evt);
    }
    if (options.dose) {
      var nomDose = options.dose.replace(/_/g, ' ');
      var doses = attributeAsInt(personnage, 'dose_' + options.dose, 0);
      if (doses === 0) {
        sendChar(personnage.charId, "n'a plus de " + nomDose);
        addEvent(evt);
        return true;
      }
      setTokenAttr(personnage, 'dose_' + options.dose, doses - 1, evt);
    }
    if (options.limiteAttribut) {
      var nomAttr = options.limiteAttribut.nom;
      var currentAttr = attributeAsInt(personnage, nomAttr, 0);
      if (currentAttr >= options.limiteAttribut.limite) {
        sendChar(personnage.charId, options.limiteAttribut.message);
        addEvent(evt);
        return true;
      }
      setTokenAttr(personnage, nomAttr, currentAttr + 1, evt);
    }
    if (options.contactDuToken && personnage) {
      var tok = getObj('graphic', options.contactDuToken);
      if (tok) {
        var distance = distanceCombat(tok, personnage.token, options.pageId);
        if (distance > 0) {
          sendChar(personnage.charId, "trop loin du consommable");
          return true;
        }
      }
    }
    if (options.decrAttribute) {
      var attr = options.decrAttribute;
      var oldval = parseInt(attr.get('current'));
      if (isNaN(oldval) || oldval < 1) {
        return true;
      }
      evt.attributes = evt.attributes || [];
      evt.attributes.push({
        attribute: attr,
        current: oldval,
        max: attr.get('max')
      });
      attr.set('current', oldval - 1);
    }
    return false;
  }

  //targetToken est soit un token, soit une structure avec nu champs cibles qui contient toutes les cibles
  function attack(playerId, attaquant, targetToken, attackLabel, options) {
    // Attacker and target infos
    var attackingToken = attaquant.token;
    var attackingCharId = attaquant.charId;
    attaquant.tokName = attaquant.tokName || attaquant.token.get("name");
    var attackerTokName = attaquant.tokName;
    var attacker = getObj("character", attackingCharId);
    if (attacker === undefined) {
      error("Unexpected undefined 1", attacker);
      return;
    }
    attaquant.name = attaquant.name || attacker.get("name");
    var attackerName = attaquant.name;
    var pageId = attaquant.token.get('pageid');
    //Options automatically set by some attributes
    if (charAttributeAsBool(attackingCharId, 'fauchage')) {
      var seuilFauchage = 10 + modCarac(attackingCharId, 'FORCE');
      options.etats = options.etats || [];
      options.etats.push({
        etat: 'renverse',
        condition: {
          type: 'deAttaque',
          seuil: 15
        },
        save: {
          carac: 'FOR',
          carac2: 'DEX',
          seuil: seuilFauchage
        }
      });
    }

    //On trouve l'attaque correspondant au label
    var att = getAttack(attackLabel, attackerTokName, attackingCharId);
    if (att === undefined) return;
    var attPrefix = att.attackPrefix;
    var weaponName = att.weaponName;
    var portee = getPortee(attackingCharId, attPrefix);
    if (portee > 0) options.distance = true;
    else options.contact = true;

    //Détermination de la (ou des) cible(s)
    var nomCiblePrincipale; //Utilise pour le cas mono-cible
    var cibles = [];
    if (targetToken.cibles) { //Dans ce cas les cibles sont précisées dans targetToken
      cibles = targetToken.cibles;
      if (cibles.length === 0) {
        error("Attaque sans cible", targetToken);
        return;
      } else if (cibles.length == 1) targetToken = targetToken.cibles.token;
      nomCiblePrincipale = cibles[0].tokName;
    } else {
      nomCiblePrincipale = targetToken.get('name');
      if (options.aoe) {
        var distanceTarget = distanceCombat(targetToken, attackingToken, pageId, true);
        var pta = tokenCenter(attackingToken);
        var ptt = tokenCenter(targetToken);
        switch (options.aoe.type) {
          case 'ligne':
            if (distanceTarget < portee) { //la ligne va plus loin que la cible
              var scale = portee * 1.0 / distanceTarget;
              ptt = [
                Math.round((ptt[0] - pta[0]) * scale) + pta[0],
                Math.round((ptt[1] - pta[1]) * scale) + pta[1]
              ];
            }
            if (targetToken.get('bar1_max') == 0) { // jshint ignore:line
              //C'est juste un token utilisé pour définir la ligne
              if (options.fx) {
                var p1e = {
                  x: attackingToken.get('left'),
                  y: attackingToken.get('top'),
                };
                var p2e = {
                  x: targetToken.get('left'),
                  y: targetToken.get('top'),
                };
                spawnFxBetweenPoints(p1e, p2e, options.fx, pageId);
              }
              cibles = [];
              targetToken.remove(); //On l'enlève, normalement plus besoin
            }
            var allToks =
              findObjs({
                _type: "graphic",
                _pageid: pageId,
                _subtype: "token",
                layer: "objects"
              });
            allToks.forEach(function(obj) {
              if (obj.id == attackingToken.id) return; //on ne se cible pas
              var objCharId = obj.get('represents');
              if (objCharId === '') return;
              var cible = {
                token: obj,
                charId: objCharId
              };
              if (getState(cible, 'mort')) return; //pas de dégâts aux morts
              var pt = tokenCenter(obj);
              var distToTrajectory = VecMath.ptSegDist(pt, pta, ptt);
              if (distToTrajectory > (obj.get('width') + obj.get('height')) / 2)
                return;
              cible.tokName = obj.get('name');
              var objChar = getObj('character', objCharId);
              if (objChar === undefined) return;
              cible.name = objChar.get('name');
              cibles.push(cible);
            });
            break;
          case 'disque':
            if (distanceTarget > portee) {
              sendChar(attackingCharId,
                "Le centre du disque visé est trop loin pour " + weaponName +
                " (distance " + distanceTarget + ", portée " + portee + ")");
              return;
            }
            var allToksDisque =
              findObjs({
                _type: "graphic",
                _pageid: pageId,
                _subtype: "token",
                layer: "objects"
              });
            allToksDisque.forEach(function(obj) {
              if (portee === 0 && obj.id == attackingToken.id) return; //on ne se cible pas si le centre de l'aoe est soi-même
              if (obj.get('bar1_max') == 0) return; // jshint ignore:line
              var objCharId = obj.get('represents');
              if (objCharId === '') return;
              var cible = {
                token: obj,
                charId: objCharId
              };
              if (getState(cible, 'mort')) return; //pas de dégâts aux morts
              var distanceCentre =
                distanceCombat(targetToken, obj, pageId, true);
              if (distanceCentre > options.aoe.rayon) return;
              var objChar = getObj('character', objCharId);
              if (objChar === undefined) return;
              cible.name = objChar.get('name');
              cible.tokName = obj.get('name');
              cibles.push(cible);
            });
            if (targetToken.get('bar1_max') == 0) { // jshint ignore:line
              //C'est juste un token utilisé pour définir le disque
              targetToken.remove(); //On l'enlève, normalement plus besoin
            }
            // La nouvelle portée (pour ne rien éliminer à l'étape suivante
            portee += options.aoe.rayon;
            break;
          case 'cone':
            var vecCentre = VecMath.normalize(VecMath.vec(pta, ptt));
            var cosAngle = Math.cos(options.aoe.angle * Math.PI / 180.0);
            if (targetToken.get('bar1_max') == 0) { // jshint ignore:line
              //C'est juste un token utilisé pour définir le cone
              if (options.fx) {
                var p1eC = {
                  x: attackingToken.get('left'),
                  y: attackingToken.get('top'),
                };
                var p2eC = {
                  x: targetToken.get('left'),
                  y: targetToken.get('top'),
                };
                spawnFxBetweenPoints(p1eC, p2eC, options.fx, pageId);
              }
              cibles = [];
              targetToken.remove(); //On l'enlève, normalement plus besoin
            }
            var allToksCone =
              findObjs({
                _type: "graphic",
                _pageid: pageId,
                _subtype: "token",
                layer: "objects"
              });
            allToksCone.forEach(function(obj) {
              if (obj.id == attackingToken.id) return; //on ne se cible pas
              var objCharId = obj.get('represents');
              if (objCharId === '') return;
              var cible = {
                token: obj,
                charId: objCharId
              };
              if (getState(cible, 'mort')) return; //pas de dégâts aux morts
              var pt = tokenCenter(obj);
              var vecObj = VecMath.normalize(VecMath.vec(pta, pt));
              if (VecMath.dot(vecCentre, vecObj) < cosAngle) return;
              // La distance sera comparée à la portée plus loin
              var objChar = getObj('character', objCharId);
              if (objChar === undefined) return;
              cible.name = objChar.get('name');
              cible.tokName = obj.get('name');
              cibles.push(cible);
            });
            break;
          default:
            error("aoe inconnue", options.aoe);
            return;
        }
      } else {
        if (attackingToken.id == targetToken.id) { //même token pour attaquant et cible
          sendChar(attackingCharId, "s'attaque lui-même ? Probablement une erreur à la sélection de la cible. On annule");
          return;
        }
        var targetCharId = targetToken.get("represents");
        if (targetCharId === "") {
          error("Le token ciblé (" + nomCiblePrincipale + ") doit représenter un personnage ", targetToken);
          return;
        }
        var targetChar = getObj("character", targetCharId);
        if (targetChar === undefined) {
          error("Unexpected undefined 2", targetChar);
          return;
        }
        cibles = [{
          token: targetToken,
          charId: targetCharId,
          name: targetChar.get('name'),
          tokName: nomCiblePrincipale
        }];
      }
    }

    //Les conditions qui peuvent empêcher l'attaque
    if (options.conditionAttaquant !== undefined) {
      if (!testCondition(options.conditionAttaquant, attaquant, cibles)) {
        sendChar(attackingCharId, "ne peut pas utiliser " + weaponName);
        return;
      }
    }
    cibles = cibles.filter(function(target) {
      if (attributeAsBool(target, 'ombreMortelle')) {
        sendChar(attackingCharId, "impossible d'attaquer une ombre");
        return false;
      }
      return true;
    });
    if (cibles.length === 0) return;
    //Prise en compte de la distance
    cibles = cibles.filter(function(target) {
      target.distance = distanceCombat(attackingToken, target.token, pageId);
      if (target.distance > portee) {
        if (options.aoe || options.auto) return false; //distance stricte
        if (target.distance > 2 * portee) return false;
        // On peut aller jusqu'à 2x portee si unique cible et jet d'attaque
        return true;
      }
      return true;
    });
    if (cibles.length === 0) {
      if (options.aoe) {
        sendChar(attackingCharId, "aucune cible dans l'aire d'effet de " + weaponName);
        return;
      }
      sendChar(attackingCharId, "est hors de portée de " + nomCiblePrincipale + " pour une attaque utilisant " + weaponName);
      return;
    }
    var evt = options.evt || {
      type: "Tentative d'attaque"
    }; //the event to be stored in history
    var explications = [];
    var sujetAttaquant = onGenre(attackingCharId, 'il', 'elle');
    // Munitions
    if (options.munition) {
      if (attackingToken.get('bar1_link') === '') {
        error("Les munitions ne sont pas supportées pour les tokens qui ne sont pas liées à un personnage", attackingToken);
      }
      var munitionsAttr = findObjs({
        _type: 'attribute',
        _characterid: attackingCharId,
        name: 'munition_' + options.munition.nom
      });
      if (munitionsAttr.length === 0) {
        error("Pas de munition nommée " + options.munition.nom + " pour " + attackerName);
        return; //evt toujours vide
      }
      munitionsAttr = munitionsAttr[0];
      var munitions = munitionsAttr.get('current');
      if (munitions < 1 || (options.tirDouble && munitions < 2)) {
        sendChar(attackingCharId,
          "ne peut pas utiliser cette attaque, car " + sujetAttaquant +
          " n'a plus de " + options.munition.nom.replace(/_/g, ' '));
        return; //evt toujours vide
      }
      var munitionsMax = munitionsAttr.get('max');
      evt.attributes = evt.attributes || [];
      evt.attributes.push({
        attribute: munitionsAttr,
        current: munitions,
        max: munitionsMax
      });
      //À partir de ce point, tout return doit ajouter evt
      munitions--;
      if (randomInteger(100) < options.munition.taux) munitionsMax--;
      if (options.tirDouble) {
        munitions--;
        if (randomInteger(100) < options.munition.taux) munitionsMax--;
      }
      explications.push("Il reste " + munitions + " " +
        options.munition.nom.replace(/_/g, ' ') + " à " + attackerTokName);
      munitionsAttr.set('current', munitions);
      munitionsAttr.set('max', munitionsMax);
    }
    // Armes chargées
    if (options.semonce === undefined && options.tirDeBarrage === undefined) {
      var chargesArme = findObjs({
        _type: 'attribute',
        _characterid: attackingCharId,
        name: "charge_" + attackLabel
      });
      if (chargesArme.length > 0) {
        var currentCharge = parseInt(chargesArme[0].get('current'));
        if (isNaN(currentCharge) || currentCharge < 1) {
          sendChar(attackingCharId, "ne peut pas attaquer avec " + weaponName + " car elle n'est pas chargée");
          addEvent(evt);
          return;
        }
        if (options.tirDouble && currentCharge < 2) {
          sendChar(attackingCharId,
            "ne peut pas faire de tir double avec ses" + weaponName + "s car " +
            sujetAttaquant + " n'en a pas au moins 2 chargées");
          addEvent(evt);
          return;
        }
        evt.attributes = evt.attributes || [];
        evt.attributes.push({
          attribute: chargesArme[0],
          current: currentCharge
        });
        if (options.tirDouble) currentCharge -= 2;
        else currentCharge -= 1;
        chargesArme[0].set('current', currentCharge);
        if (currentCharge === 0 &&
          charAttributeAsInt(attackingCharId, "initEnMain" + attackLabel, 0) > 0) {
          updateNextInit(attackingToken);
        }
      } else {
        if (options.tirDouble) {
          sendChar(attackingCharId,
            "ne peut pas faire de tir double avec ses" + weaponName + "s car " +
            sujetAttaquant + " n'en a pas au moins 2 chargées");
          addEvent(evt);
          return;
        }
      }
    }
    if (limiteRessources(attaquant, options, attackLabel, weaponName, evt))
      return;
    // Effets quand on rentre en combat 
    if (!state.COFantasy.combat) {
      var selected = [{
        _id: attackingToken.id
      }];
      cibles.forEach(function(target) {
        selected.push({
          _id: target.token.id
        });
      });
      initiative(selected, evt);
    }
    var pacifisme_selected = tokenAttribute(attaquant, 'pacifisme');
    if (pacifisme_selected.length > 0 && pacifisme_selected[0].get('current') > 0) {
      pacifisme_selected[0].set('current', 0);
      sendChat("GM", "/w " + attackerName + " " + attackerTokName + " perd son pacifisme");
    }
    // On commence par le jet d'attaque de base : juste le ou les dés d'attaque 
    // et le modificateur d'arme et de caractéritiques qui apparaissent dans 
    // la description de l'attaque. Il faut quand même tenir compte des
    // chances de critique
    var crit = getAttrByName(attackingCharId, attPrefix + "armecrit") || 20;
    crit = parseInt(crit);
    if (isNaN(crit) || crit < 1 || crit > 20) {
      error("Le critique n'est pas un nombre entre 1 et 20", crit);
      crit = 20;
    }
    if (options.bonusCritique) crit -= 1;
    if (charAttributeAsBool(attaquant, 'scienceDuCritique') ||
      (!options.distance && !options.sortilege && charAttributeAsBool(attaquant, 'morsureDuSerpent'))) crit -= 1;
    if (options.affute) crit -= 1;
    var dice = 20;
    if (getState(attaquant, 'affaibli')) {
      dice = 12;
      explications.push("Attaquant affaibli => D12 au lieu de D20 en Attaque");
    }
    var nbDe = 1;
    if (options.imparable) nbDe = 2;
    var de = computeDice(attaquant, nbDe, dice);
    var attackRollExpr = "[[" + de + "cs>" + crit + "cf1]]";
    var attSkill =
      getAttrByName(attackingCharId, attPrefix + "armeatk") ||
      getAttrByName(attackingCharId, "ATKCAC");
    var attSkillDiv = getAttrByName(attackingCharId, attPrefix + "armeatkdiv") || 0;
    attSkillDiv = parseInt(attSkillDiv);
    if (isNaN(attSkillDiv)) attSkillDiv = 0;
    var attSkillDivTxt = "";
    if (attSkillDiv > 0) attSkillDivTxt = " + " + attSkillDiv;
    else if (attSkillDiv < 0) attSkillDivTxt += attSkillDiv;
    var attackSkillExpr = addOrigin(attackerName, "[[" + attSkill + attSkillDivTxt + "]]");
    // toEvaluateAttack inlines
    // 0: attack roll
    // 1: attack skill expression
    // 2: dé de poudre
    var toEvaluateAttack = attackRollExpr + " " + attackSkillExpr;
    if (options.poudre) toEvaluateAttack += " [[1d20]]";
    sendChat(attackerName, toEvaluateAttack, function(resAttack) {
      var rollsAttack = options.rollsAttack || resAttack[0];
      var afterEvaluateAttack = rollsAttack.content.split(' ');
      var attRollNumber = rollNumber(afterEvaluateAttack[0]);
      var attSkillNumber = rollNumber(afterEvaluateAttack[1]);
      var d20roll = rollsAttack.inlinerolls[attRollNumber].results.total;
      var attSkill = rollsAttack.inlinerolls[attSkillNumber].results.total;

      evt.type = "Attaque";
      evt.succes = true;
      evt.action = {
        player_id: playerId,
        attaquant: attaquant,
        cibles: cibles,
        attack_label: attackLabel,
        rollsAttack: rollsAttack,
        options: options
      };

      // debut de la partie affichage
      var action = "<b>Arme</b> : ";
      if (options.sortilege) action = "<b>Sort</b> : ";
      var label_type = BS_LABEL_INFO;
      var target = cibles[0];
      if (options.aoe) {
        target = undefined;
        label_type = BS_LABEL_WARNING;
      }
      action += "<span style='" + BS_LABEL + " " + label_type + "; text-transform: none; font-size: 100%;'>" + weaponName + "</span>";

      var display = startFramedDisplay(playerId, action, attaquant, target);

      // Cas des armes à poudre
      if (options.poudre) {
        var poudreNumber = rollNumber(afterEvaluateAttack[2]);
        var dePoudre = rollsAttack.inlinerolls[poudreNumber].results.total;
        explications.push(
          "Dé de poudre : " + buildinline(rollsAttack.inlinerolls[poudreNumber]));
        if (dePoudre === 1) {
          evt.succes = false;
          if (d20roll === 1) {
            explications.push(
              weaponName + " explose ! L'arme est complètement détruite");
            sendChat("", "[[2d6]]", function(res) {
              var rolls = res[0];
              var explRoll = rolls.inlinerolls[0];
              var r = {
                total: explRoll.results.total,
                type: 'normal',
                display: buildinline(explRoll, 'normal')
              };
              dealDamage(attaquant, r, [], evt, 1, options, explications,
                function(dmgDisplay, dmg) {
                  var dmgMsg = "<b>Dommages pour " + attackerTokName + " :</b> " +
                    dmgDisplay;
                  addLineToFramedDisplay(display, dmgMsg);
                  finaliseDisplay(display, explications, evt);
                });
            });
          } else {
            explications.push(
              "La poudre explose dans " + weaponName +
              ". L'arme est inutilisable jusqu'à la fin du combat");
            sendChat("", "[[1d6]]", function(res) {
              var rolls = res[0];
              var explRoll = rolls.inlinerolls[0];
              var r = {
                total: explRoll.results.total,
                type: 'normal',
                display: buildinline(explRoll, 'normal')
              };
              dealDamage(attaquant, r, [], evt, 1, options, explications,
                function(dmgDisplay, dmg) {
                  var dmgMsg = "<b>Dommages pour " + attackerTokName + " :</b> " +
                    dmgDisplay;
                  addLineToFramedDisplay(display, dmgMsg);
                  finaliseDisplay(display, explications, evt);
                });
            });
          }
          return;
        } else if (d20roll == dePoudre) {
          evt.succes = false;
          addLineToFramedDisplay(display,
            "<b>Attaque :</b> " +
            buildinline(rollsAttack.inlinerolls[attRollNumber]));
          explications.push(weaponName + " fait long feu, le coup ne part pas");
          finaliseDisplay(display, explications, evt);
          return;
        }
      }

      //Modificateurs en Attaque qui ne dépendent pas de la cible
      var attBonusCommun =
        bonusAttaqueA(attaquant, attackerTokName, weaponName, evt,
          explications, options);
      //Autres conditions qui ne modifient pas que le bonus d'attaque
      if (options.contact) {
        if (attributeAsBool(attaquant, 'rayon_affaiblissant')) {
          options.rayonAffaiblissant = true;
          attBonusCommun -= 2;
          explications.push("Rayon affaiblissant => -2 en Attaque et aux DM");
        }
      }
      var traquenard = false;
      if (options.traquenard) {
        if (attributeAsInt(attaquant, 'traquenard', 0) === 0) {
          sendChar(attackingCharId, "ne peut pas faire de traquenard, car ce n'est pas sa première attaque du combat");
          addEvent(evt);
          return;
        }
        traquenard = tokenInit(attaquant, evt);
      }
      if (attributeAsInt(attaquant, 'traquenard', 0) > 0) {
        setTokenAttr(attaquant, 'traquenard', 0, evt);
      }
      var mainDmgType = options.type || 'normal';
      if (options.sortilege) options.ignoreObstacles = true;
      var critSug; //Suggestion en cas d'écher critique
      //Calcul des cibles touchées
      //(et on ajuste le jet pour la triche)
      var ciblesTouchees = [];
      var count = cibles.length;
      cibles.forEach(function(target) {
        target.additionalDmg = [];
        target.messages = [];
        //Les bonus d'attaque qui dépendent de la cible
        bonusAttaqueD(attaquant, target, portee, pageId, evt, target.messages, options, function(bad) {
          var attBonus = attBonusCommun + bad;
          if (traquenard) {
            var initTarg = tokenInit(target, evt);
            if (traquenard >= initTarg) {
              attBonus += 2;
              target.additionalDmg.push({
                type: mainDmgType,
                value: '2d6'
              });
              target.messages.push(attackerTokName + " fait un traquenard à " + target.tokName);
            } else {
              target.messages.push(attackerTokName + " n'est pas assez rapide pour faire un traquenard à " + target.tokName);
            }
          }
          var defautCuirasse =
            tokenAttribute(target, 'defautDansLaCuirasse_' + attackerTokName);
          target.crit = crit;
          if (defautCuirasse.length > 0) {
            target.defautCuirasse = true;
            if (target.crit > 2) target.crit -= 1;
          }
          //Defense de la cible
          defenseOfToken(attaquant, target, pageId, evt, options, function(defense) {
            var interchange;
            if (options.aoe === undefined) {
              interchange = interchangeable(attackingToken, target, pageId);
              if (interchange.result) defense += 5;
            }

            //Absorption au bouclier
            var absorber;
            if (target.absorber) {
              explications = explications.concat(target.absorberExpl);
              if (target.absorber > defense) {
                defense = target.absorber;
                absorber = target.absorberDisplay;
              }
            }

            var touche; //false: pas touché, 1 touché, 2 critique
            // Calcule si touché, et les messages de dégats et attaque
            if (options.auto) {
              touche = 1;
            } else {
              if (options.triche) {
                switch (options.triche) {
                  case "rate":
                    if (d20roll >= target.crit) {
                      if (target.crit < 2) d20roll = 1;
                      else d20roll = randomInteger(target.crit - 1);
                    }
                    if ((d20roll + attSkill + attBonus) >= defense) {
                      var maxd20roll = defense - attSkill - attBonus - 1;
                      if (maxd20roll >= target.crit) maxd20roll = target.crit - 1;
                      if (maxd20roll < 2) d20roll = 1;
                      else d20roll = randomInteger(maxd20roll);
                    }
                    break;
                  case "touche":
                    if (d20roll == 1) d20roll = randomInteger(dice - 1) + 1;
                    if ((d20roll + attSkill + attBonus) < defense) {
                      var mind20roll = defense - attSkill - attBonus - 1;
                      if (mind20roll < 1) mind20roll = 1;
                      if (mind20roll >= dice) d20roll = dice;
                      else d20roll = randomInteger(dice - mind20roll) + mind20roll;
                    }
                    break;
                  case "critique":
                    if (d20roll < target.crit) {
                      if (target.crit <= dice) d20roll = randomInteger(dice - target.crit + 1) + target.crit - 1;
                      else d20roll = dice;
                    }
                    break;
                  case "echecCritique":
                    if (d20roll > 1) d20roll = 1;
                    break;
                  default:
                    error("Option inconnue", options.triche);
                }
                // now adjust the roll
                var attackInlineRoll = rollsAttack.inlinerolls[attRollNumber];
                attackInlineRoll.results.total = d20roll;
                attackInlineRoll.results.rolls.forEach(function(roll) {
                  switch (roll.type) {
                    case "R":
                      if (roll.results.length == 1) {
                        roll.results[0].v = d20roll;
                      }
                      break;
                    default:
                      return;
                  }
                });
              }
              var attackRoll = d20roll + attSkill + attBonus;
              var attackResult; // string
              var paralyse = false;
              if (getState(target, 'paralyse')) {
                paralyse = true;
                target.messages.push("Cible paralysée => réussite critique automatique");
              }

              if (charAttributeAsBool(attaquant, 'champion') && d20roll >= 15)
                options.champion = true;
              if (d20roll == 1 && options.chance === undefined) {
                attackResult = " : <span style='" + BS_LABEL + " " + BS_LABEL_DANGER + "'><b>échec&nbsp;critique</b></span>";
                touche = false;
                var confirmCrit = randomInteger(20);
                critSug = "/w GM Jet de confirmation pour l'échec critique : " +
                  confirmCrit + "/20. Suggestion d'effet : ";
                switch (confirmCrit) {
                  case 1:
                    critSug += "l'attaquant se blesse ou est paralysé un tour";
                    break;
                  case 2:
                    critSug += "l'attaquant blesse un allié";
                    break;
                  case 3:
                    critSug += "l'arme casse, ou une pièce d'armure se détache, ou -5 DEF un tour (comme surpris)";
                    break;
                  case 4:
                    critSug += "l'attaquant lache son arme ou glisse et tombe";
                    break;
                  default:
                    critSug += "simple échec";
                }
              } else if (paralyse || d20roll >= target.crit) {
                attackResult = " : <span style='" + BS_LABEL + " " + BS_LABEL_SUCCESS + "'><b>réussite critique</b></span>";
                touche = 2;
              } else if (options.champion) {
                attackResult = " : <span style='" + BS_LABEL + " " + BS_LABEL_SUCCESS + "'><b>succès</b></span>";
                touche = 1;
              } else if (attackRoll < defense) {
                attackResult = " : <span style='" + BS_LABEL + " " + BS_LABEL_WARNING + "'><b>échec</b></span>";
                touche = false;
              } else { // Touché normal
                attackResult = " : <span style='" + BS_LABEL + " " + BS_LABEL_SUCCESS + "'><b>succès</b></span>";
                touche = 1;
              }
              var attRollValue = buildinline(rollsAttack.inlinerolls[attRollNumber]);
              if (attSkill > 0) attRollValue += "+" + attSkill;
              else if (attSkill < 0) attRollValue += attSkill;
              if (attBonus > 0) attRollValue += "+" + attBonus;
              else if (attBonus < 0) attRollValue += attBonus;
              var line = "<b>Attaque</b> ";
              if (options.aoe) {
                line += "contre <b>" + target.tokName + "</b> ";
              }
              line += ":<br>";
              line += attRollValue + " vs <b>";
              if (absorber) line += absorber;
              else line += defense;
              line += "</b> " + attackResult;
              target.attackMessage = line;
              if (touche) {
                if (options.asDeLaGachette && attackRoll > 24) {
                  target.messages.push("As de la gachette : + 1d6 aux DM");
                  target.additionalDmg.push({
                    type: mainDmgType,
                    value: '1d6'
                  });
                }
              } else { //Effet si on ne touche pas
                // Draw failed effect
                if (_.has(options, "fx") && options.distance) {
                  var p1 = {
                    x: attackingToken.get('left'),
                    y: attackingToken.get('top')
                  };
                  var p2 = {
                    x: target.token.get('left'),
                    y: target.token.get('top')
                  };
                  // Compute some gaussian deviation in [0, 1]
                  var dev =
                    (Math.random() + Math.random() + Math.random() + Math.random() +
                      Math.random() + 1) / 6;
                  // take into account by how far we miss
                  dev = dev * (d20roll == 1) ? 2 : ((attackRoll - defense) / 20);
                  if (Math.random() > 0.5) dev = -dev;
                  p2.x += dev * (p2.y - p1.y);
                  p2.y += dev * (p2.x - p1.x);
                  spawnFxBetweenPoints(p1, p2, options.fx, pageId);
                }
                evt.succes = false;
                diminueMalediction(attaquant, evt);
                //On a fini avec cette cible, on imprime ce qui la concerne
                addLineToFramedDisplay(display, target.attackMessage);
                target.messages.forEach(function(expl) {
                  addLineToFramedDisplay(display, expl, 80);
                });
                count--;
                if (count === 0)
                  attackDealDmg(attaquant, ciblesTouchees, critSug, attackLabel, attPrefix, d20roll, display, options, evt, explications, pageId);
                return;
              }
            }
            target.touche = touche;
            if (options.test) target.touche = false;
            if (options.aoe === undefined && interchange.targets.length > 1) { //any target can be affected
              var n = randomInteger(interchange.targets.length);
              target.token = interchange.targets[n - 1];
            }
            if (target.touche &&
              attributeAsBool(target, 'image_decalee')) {
              var id = randomInteger(6);
              if (id > 4) {
                target.touche = false;
                target.messages.push("L'attaque passe à travers l'image de " + target.tokName);
              } else {
                target.messages.push("Malgré l'image légèrement décalée de " + target.tokName + " l'attaque touche");
              }
            }
            if (target.touche) ciblesTouchees.push(target);
            count--;
            if (count === 0)
              attackDealDmg(attaquant, ciblesTouchees, critSug, attackLabel, attPrefix, d20roll, display, options, evt, explications, pageId);
          }); //fin defenseOfToken
        }); //fin bonusAttaqueD
      }); //fin de détermination de toucher des cibles
    }); // fin du jet d'attaque asynchrone
  }

  function attackDealDmg(attaquant, cibles, critSug, attackLabel, attPrefix, d20roll, display, options, evt, explications, pageId) {
    if (cibles.length === 0) {
      finaliseDisplay(display, explications, evt);
      if (critSug) sendChat('COF', critSug);
      return;
    }
    var attackingCharId = attaquant.charId;
    var attackingToken = attaquant.token;
    var attackerTokName = attaquant.tokName;
    options.attaquant = attaquant;

    //Les dégâts
    //Dégâts insrits sur la ligne de l'arme
    var mainDmgType = options.type || 'normal';
    var attNbDices = getAttrByName(attackingCharId, attPrefix + "armedmnbde") || 1;
    attNbDices = parseInt(attNbDices);
    var attDice = getAttrByName(attackingCharId, attPrefix + "armedmde") || 4;
    attDice = parseInt(attDice);
    if (isNaN(attDice) || attDice < 0 || isNaN(attNbDices) || attNbDices < 0) {
      error("Dés de l'attaque incorrect", attDice);
      addEvent(evt);
      return;
    }
    if (options.puissant) {
      attDice += 2;
    }
    if (options.reroll1) attDice += "r1";
    var attCarBonus =
      getAttrByName(attackingCharId, attPrefix + "armedmcar") ||
      modCarac(attackingCharId, "FORCE");
    if (isNaN(attCarBonus)) {
      if (attCarBonus.startsWith('@{')) {
        var carac = caracOfMod(attCarBonus.substr(2, 3));
        if (carac) {
          var simplerAttCarBonus = modCarac(attackingCharId, carac);
          if (!isNaN(simplerAttCarBonus)) {
            attCarBonus = simplerAttCarBonus;
          }
        }
      }
    }
    if (attCarBonus === "0" || attCarBonus === 0) attCarBonus = "";
    else attCarBonus = " + " + attCarBonus;
    var attDMBonusCommun =
      parseInt(getAttrByName(attackingCharId, attPrefix + "armedmdiv"));
    if (isNaN(attDMBonusCommun) || attDMBonusCommun === 0) attDMBonusCommun = '';
    else if (attDMBonusCommun > 0) attDMBonusCommun = '+' + attDMBonusCommun;
    // Les autres modifications aux dégâts qui ne dépendent pas de la cible
    if (options.rayonAffaiblissant) {
      attDMBonusCommun += " -2";
    }
    var attrPosture = tokenAttribute(attaquant, 'postureDeCombat');
    if (attrPosture.length > 0) {
      attrPosture = attrPosture[0];
      var posture = attrPosture.get('max');
      var postureVal;
      if (posture.startsWith('DM')) {
        postureVal = parseInt(attrPosture.get('current'));
        attDMBonusCommun += " -" + postureVal;
        explications.push("Posture de combat => -" + postureVal + " DM");
      } else if (posture.endsWith('DM')) {
        postureVal = parseInt(attrPosture.get('current'));
        attDMBonusCommun += " +" + postureVal;
        explications.push("Posture de combat => +" + postureVal + " DM");
      }
    }
    if (aUnCapitaine(attaquant, evt, pageId)) attDMBonusCommun += " +2";
    // Les autres sources de dégâts
    if (options.de6Plus) {
      options.additionalDmg.push({
        type: mainDmgType,
        value: options.de6Plus + "d6"
      });
    }
    if (options.distance) {
      if (options.semonce) {
        options.additionalDmg.push({
          type: mainDmgType,
          value: '1d6'
        });
        explications.push("Tir de semonce => +5 en Attaque et +1d6 aux DM");
      }
    } else { //bonus aux attaques de contact
      if (attributeAsBool(attaquant, 'agrandissement')) {
        attDMBonusCommun += "+2";
        explications.push("Agrandissement => +2 aux DM");
      }
      if (attributeAsBool(attaquant, 'forceDeGeant')) {
        attDMBonusCommun += "+2";
        explications.push("Force de géant => +2 en Attaque");
      }
    }
    if (attributeAsBool(attaquant, 'forgeron_' + attackLabel)) {
      var feuForgeron = charAttributeAsInt(attackingCharId, 'voieDuMetal', 0);
      if (feuForgeron < 1 || feuForgeron > 5) {
        error("Rang dans la voie du métal de " + attackerTokName + " inconnu ou incorrect", feuForgeron);
      } else {
        options.additionalDmg.push({
          type: 'feu',
          value: feuForgeron
        });
      }
    }
    var poisonAttr = tokenAttribute(attaquant, 'poisonRapide_' + attackLabel);
    if (poisonAttr.length > 0) {
      poisonAttr = poisonAttr[0];
      options.additionalDmg.push({
        type: 'poison',
        value: poisonAttr.get('current'),
        partialSave: {
          carac: 'CON',
          seuil: poisonAttr.get('max')
        }
      });
      explications.push("L'arme est empoisonnée");
      evt.deletedAttributes = evt.deletedAttributes || [];
      evt.deletedAttributes.push(poisonAttr);
      poisonAttr.remove();
    }
    if (charAttributeAsBool(attackingCharId, 'dmgArme1d6_' + attackLabel)) {
      options.additionalDmg.push({
        type: mainDmgType,
        value: '1d6'
      });
      explications.push("Arme enduite => +1d6 aux DM");
    }
    if (options.champion) {
      options.additionalDmg.push({
        type: mainDmgType,
        value: '1d6'
      });
      explications.push(attackerTokName + " est un champion, son attaque porte !");
    }
    /////////////////////////////////////////////////////////////////
    //Tout ce qui dépend de la cible
    var ciblesCount = cibles.length; //Pour l'asynchronie
    var finCibles = function() {
      ciblesCount--;
      if (ciblesCount === 0) {
        cibles.forEach(function(target) {
          if (target.attackMessage) {
            addLineToFramedDisplay(display, target.attackMessage);
          } else if (options.aoe) { //par exemple si attaque automatique
            addLineToFramedDisplay(display, "<b>" + target.tokName + "</b> :");
          }
          if (target.dmgMessage) addLineToFramedDisplay(display, target.dmgMessage, 100, false);
          target.messages.forEach(function(expl) {
            addLineToFramedDisplay(display, expl, 80);
          });
        });
        finaliseDisplay(display, explications, evt);
      }
    };
    cibles.forEach(function(target) {
      var attDMBonus = attDMBonusCommun;
      //Les modificateurs de dégâts qui dépendent de la cible
      if (options.pressionMortelle) {
        var pMortelle = tokenAttribute(target, 'pressionMortelle');
        if (pMortelle.length === 0) {
          sendChar(attackingCharId, "Essaie une pression mortelle, mais aucun point vital de " + target.tokName + " n'a encore été affecté");
          ciblesCount--;
          if (ciblesCount === 0) addEvent(evt);
          return;
        }
        attNbDices = pMortelle[0].get('max');
        attDice = 4; //TODO : have an option for that
        attDMBonus = "+ " + pMortelle[0].get('current');
      }
      if (_.has(options, "tempDmg")) {
        var forceTarg = modCarac(target.charId, "FORCE");
        if (forceTarg < 0) {
          attDMBonus = " +" + (-forceTarg);
        } else {
          attDMBonus = " -" + forceTarg;
        }
      }
      if (options.distance) {
        var tirPrecis = charAttributeAsInt(attackingCharId, 'tirPrecis', 0);
        if (tirPrecis > 0) {
          var modDex = modCarac(attackingCharId, 'DEXTERITE');
          if (target.distance <= 5 * modDex) {
            attDMBonus += " + " + tirPrecis;
            target.messages.push("Tir précis : +" + tirPrecis + " DM");
          }
        }
      }
      if (target.chasseurEmerite) {
        attDMBonus += "+2";
      }
      if (target.ennemiJure) {
        target.additionalDmg.push({
          type: mainDmgType,
          value: '1d6'
        });
      }
      if (target.argent) {
        target.additionalDmg.push({
          type: mainDmgType,
          value: '1d6'
        });
      }
      var loupParmiLesLoups = charAttributeAsInt(attaquant, 'loupParmiLesLoups', 0);
      if (loupParmiLesLoups > 0 && estHumanoide(target)) {
        attDMBonus += "+" + loupParmiLesLoups;
        target.messages.push("Loup parmi les loups : +" + loupParmiLesLoups + " DM");
      }

      if (attributeAsBool(attaquant, 'ombreMortelle') ||
        attributeAsBool(attaquant, 'dedoublement')) {
        if (options.divise) options.divise *= 2;
        else options.divise = 2;
      }
      var attNbDicesCible = attNbDices;
      var attDiceCible = attDice;
      var attCarBonusCible = attCarBonus;
      if (!options.sortilege &&
        charAttributeAsBool(target.charId, 'immuniteAuxArmes')) {
        if (options.magique) {
          attNbDicesCible = options.magique;
          attDiceCible = "6";
          attCarBonusCible = modCarac(target.charId, 'SAGESSE');
          if (attCarBonusCible < 1) attCarBonusCible = "";
          else attCarBonusCible = " +" + attCarBonusCible;
        } else {
          target.messages.push(target.tokName + " semble immunisé aux armes ordinaires");
          attNbDicesCible = 0;
          attCarBonusCible = "";
          attDMBonus = "";
        }
      }
      var mainDmgRollExpr =
        addOrigin(attaquant.name, attNbDicesCible + "d" + attDiceCible + attCarBonusCible + attDMBonus);
      //Additional damage
      var additionalDmg = options.additionalDmg.concat(target.additionalDmg);
      if (!options.sortilege && !options.magique &&
        charAttributeAsBool(target.charId, 'immuniteAuxArmes')) {
        additionalDmg = additionalDmg.filter(function(dmSpec) {
          switch (dmSpec.type) {
            case undefined:
            case 'normal':
            case 'poison':
            case 'maladie':
              return false;
            default:
              return true;
          }
        });
      }
      if (options.tirDouble || options.tirDeBarrage) {
        mainDmgRollExpr += " +" + mainDmgRollExpr;
        additionalDmg.forEach(function(dmSpec) {
          dmSpec.value += " +" + dmSpec.Value;
        });
      }
      var ExtraDmgRollExpr = "";
      additionalDmg = additionalDmg.filter(function(dmSpec) {
        dmSpec.type = dmSpec.type || 'normal';
        if (dmSpec.type != mainDmgType || isNaN(dmSpec.value)) {
          ExtraDmgRollExpr += " [[" + dmSpec.value + "]]";
          return true;
        }
        // We have the same type and a constant -> should be multiplied by crit
        mainDmgRollExpr += " + " + dmSpec.value;
        return false;
      });
      var mainDmgRoll = {
        type: mainDmgType,
        value: mainDmgRollExpr
      };

      // toEvaluateDmg inlines
      // 0 : roll de dégâts principaux
      // 1+ : les rolls de dégâts supplémentaires

      var toEvaluateDmg = "[[" + mainDmgRollExpr + "]]" + ExtraDmgRollExpr;
      sendChat(attaquant.name, toEvaluateDmg, function(resDmg) {
        var rollsDmg = target.rollsDmg || resDmg[0];
        var afterEvaluateDmg = rollsDmg.content.split(' ');
        var mainDmgRollNumber = rollNumber(afterEvaluateDmg[0]);
        mainDmgRoll.total = rollsDmg.inlinerolls[mainDmgRollNumber].results.total;
        mainDmgRoll.display = buildinline(rollsDmg.inlinerolls[mainDmgRollNumber], mainDmgType, options.magique);
        additionalDmg.forEach(function(dmSpec, i) {
          var rRoll = rollsDmg.inlinerolls[rollNumber(afterEvaluateDmg[i + 1])];
          dmSpec.total = dmSpec.total || rRoll.results.total;
          var addDmType = dmSpec.type;
          dmSpec.display = dmSpec.display || buildinline(rRoll, addDmType, options.magique);
        });

        if (target.touche) { //Devrait être inutile ?
          if (options.tirDeBarrage) target.messages.push("Tir de barrage : undo si la cible décide de ne pas bouger");
          if (options.pointsVitaux) target.messages.push(attackerTokName + " vise des points vitaux mais ne semble pas faire de dégâts");
          if (options.pressionMortelle) {
            removeTokenAttr(target, 'pressionMortelle', evt);
            target.messages.push(attackerTokName + " libère la pression des points vitaux, l'effet est dévastateur !");
            spawnFx(target.token.get('left'), target.token.get('top'), 'bomb-death', pageId);
          }
          // change l'état de la cible, si spécifié
          if (options.enflamme) {
            var enflammePuissance = 1;
            if (options.puissant) enflammePuissance = 2;
            setTokenAttr(target, 'enflamme', enflammePuissance, evt);
            target.messages.push(target.tokName + " prend feu !");
          }
          if (options.malediction) {
            setTokenAttr(target, 'malediction', 3, evt);
            target.messages.push(target.tokName + " est maudit...");
          }
          // Draw effect, if any
          if (_.has(options, "fx")) {
            var p1e = {
              x: attackingToken.get('left'),
              y: attackingToken.get('top'),
            };
            var p2e = {
              x: target.token.get('left'),
              y: target.token.get('top'),
            };
            spawnFxBetweenPoints(p1e, p2e, options.fx, pageId);
          }
          target.rollsDmg = rollsDmg;
          // Compte le nombre de saves pour la synchronisation
          // (On ne compte pas les psave, gérés dans dealDamage)
          var saves = 0;
          //ajoute les états sans save à la cible
          if (options.etats) {
            options.etats.forEach(function(ce) {
              if (ce.save) {
                saves++;
                return; //on le fera plus tard
              }
              if (testCondition(ce.condition, attaquant, [{
                  charId: target.charId
                }], d20roll)) {
                setState(target, ce.etat, true, evt);
                target.messages.push(target.tokName + " est " + ce.etat + eForFemale(target.charId) + " par l'attaque");
              } else {
                if (ce.condition.type == "moins") {
                  target.messages.push(
                    "Grâce à sa " + ce.condition.text + ", " + target.tokName +
                    " n'est pas " + ce.etat + eForFemale(target.charId));
                }
              }
            });
          }
          var savesEffets = 0;
          // Ajoute les effets sans save à la cible
          if (options.effets) {
            options.effets.forEach(function(ef) {
              if (ef.save) {
                saves++;
                savesEffets++;
                return; //on le fera plus tard
              }
              if (ef.effet == 'dedoublement') {
                if (attributeAsBool(target, 'dedouble') ||
                  attributeAsBool(target, 'dedoublement')) {
                  target.messages.push(target.tokName + " a déjà été dédoublé pendant ce combat");
                  return;
                }
                target.messages.push("Un double translucide de " +
                  target.tokName + " apparaît. Il est aux ordres de " +
                  attackerTokName);
                setTokenAttr(target, 'dedouble', true, evt);
                copieToken(target, undefined, IMAGE_DOUBLE,
                  "Double de " + target.tokName, 'dedoublement', ef.duree,
                  pageId, evt);
                return;
              }
              target.messages.push(target.tokName + " " + messageEffetTemp[ef.effet].activation);
              setTokenAttr(target, ef.effet, ef.duree, evt, undefined,
                getInit());
              if (ef.effet == 'aveugleTemp') {
                setState(target, 'aveugle', true, evt);
              } else if (ef.effet == 'ralentiTemp') {
                setState(target, 'ralenti', true, evt);
              }
              if (ef.saveParTour) {
                setTokenAttr(target, ef.effet + "SaveParTour",
                  ef.saveParTour.carac, evt, undefined, ef.saveParTour.seuil);
              }
            });
          }
          // Tout ce qui se passe après les saves (autres que saves de diminution des dmg
          var afterSaves = function() {
            if (saves > 0) return; //On n'a pas encore fait tous les saves
            if (additionalDmg.length === 0 && mainDmgRoll.total === 0 &&
              attNbDices === 0) {
              // Pas de dégâts, donc pas d'appel à dealDamage
              finCibles();
            } else {
              dealDamage(target, mainDmgRoll, additionalDmg, evt, target.touche,
                options, target.messages,
                function(dmgDisplay, dmg) {
                  if (options.strigeSuce) {
                    var suce = attributeAsInt(attaquant, 'strigeSuce', 0);
                    if (suce === 0) {
                      setTokenAttr(attaquant, 'bufDEF', -3, evt);
                      target.messages.push(
                        attackerTokName + " s'agrippe à " + target.tokName +
                        " et commence à lui sucer le sang");
                    }
                    if (suce + dmg >= 6) {
                      target.messaged.push(
                        "Repus, " + attackerTokName + " se détache et s'envole");
                      target.messaged.push(target.tokName + " se sent un peu faible...");
                      setState(target, 'affaibli', true, evt);
                      var defbuf = attributeAsInt(attaquant, 'bufDEF', 0);
                      if (defbuf === -3) {
                        removeTokenAttr(attaquant, 'bufDEF', evt);
                      } else if (defbuf !== 0) {
                        setTokenAttr(attaquant, 'bufDEF', defbuf + 3, evt);
                      }
                    } else {
                      setTokenAttr(attaquant, 'strigeSuce', suce + dmg, evt);
                      if (suce > 0)
                        target.messages.push(
                          attackerTokName + " continue à sucer le sang de " + target.tokName);
                    }
                  }
                  if (options.vampirise) {
                    soigneToken(attackingToken, dmg, evt, function(soins) {
                      target.messages.push(
                        "L'attaque soigne " + attackerTokName + " de " + soins +
                        " PV");
                    });
                  }
                  target.dmgMessage = "<b>DM :</b> " + dmgDisplay;
                  if (attributeAsBool(target, 'sous_tension') && options.contact) {
                    ciblesCount++;
                    sendChat("", "[[1d6]]", function(res) {
                      var rolls = res[0];
                      var explRoll = rolls.inlinerolls[0];
                      var r = {
                        total: explRoll.results.total,
                        type: 'electrique',
                        display: buildinline(explRoll, 'electrique', true)
                      };
                      dealDamage(attaquant, r, [], evt, 1, options,
                        target.messages,
                        function(dmgDisplay, dmg) {
                          var dmgMsg =
                            "<b>Décharge électrique sur " + attackerTokName + " :</b> " +
                            dmgDisplay;
                          target.messages.push(dmgMsg);
                          finCibles();
                        });
                    });
                  }
                  finCibles();
                });
            }
          };
          var expliquer = function(msg) {
            target.messages.push(msg);
          };
          //Ajoute les états avec save à la cibles
          var etatsAvecSave = function() {
            if (savesEffets > 0) return; //On n'a pas encore fini avec les effets
            if (options.etats && saves > 0) {
              options.etats.forEach(function(ce) {
                if (ce.save) {
                  if (testCondition(ce.condition, attaquant, [{
                      charId: target.charId
                    }], d20roll)) {
                    var msgPour = " pour résister à un effet";
                    var msgRate = ", " + target.tokName + " est " + ce.etat + eForFemale(target.charId) + " par l'attaque";
                    var saveOpts = {
                      msgPour: msgPour,
                      msgRate: msgRate,
                      attaquant: attaquant
                    };
                    save(ce.save, target, expliquer, saveOpts, evt,
                      function(reussite, rolltext) {
                        if (!reussite) {
                          setState(target, ce.etat, true, evt);
                        }
                        saves--;
                        afterSaves();
                      });
                  } else {
                    if (ce.condition.type == "moins") {
                      target.messages.push(
                        "Grâce à sa " + ce.condition.text + ", " + target.tokName +
                        " n'est pas " + ce.etat + eForFemale(target.charId));
                    }
                    saves--;
                    afterSaves();
                  }
                }
              });
            } else afterSaves();
          };
          // Ajoute les effets avec save à la cible
          var effetsAvecSave = function() {
            if (options.effets && savesEffets > 0) {
              options.effets.forEach(function(ef) {
                if (ef.save) {
                  var msgPour = " pour résister à un effet";
                  var msgRate = ", " + target.tokName + " " + messageEffetTemp[ef.effet].activation;
                  var saveOpts = {
                    msgPour: msgPour,
                    msgRate: msgRate,
                    attaquant: attaquant
                  };
                  save(ef.save, target, expliquer, saveOpts, evt,
                    function(reussite, rollText) {
                      if (!reussite) {
                        setTokenAttr(target, ef.effet, ef.duree, evt,
                          undefined, getInit());
                        if (ef.effet == 'aveugleTemp') {
                          setState(target, 'aveugle', true, evt);
                        } else if (ef.effet == 'ralentiTemp') {
                          setState(target, 'ralenti', true, evt);
                        }
                        if (ef.saveParTour) {
                          setTokenAttr(target,
                            ef.effet + "SaveParTour", ef.saveParTour.carac,
                            evt, undefined, ef.saveParTour.seuil);
                        }
                      }
                      saves--;
                      savesEffets--;
                      etatsAvecSave();
                    });
                }
              });
            } else etatsAvecSave();
          };
          var effetPietinement = function() {
            if (options.pietine && estAussiGrandQue(attaquant, target)) {
              testOppose(target, 'FOR', attaquant, 'FOR', target.messages, evt,
                function(resultat) {
                  if (resultat == 2) {
                    target.messages.push(target.tokName + " est piétiné par " + attackerTokName);
                    setState(target, 'renverse', true, evt);
                    target.touche++;
                  } else {
                    if (resultat === 0) diminueMalediction(attaquant, evt);
                    target.messages.push(target.tokName + " n'est pas piétiné.");
                  }
                  effetsAvecSave();
                });
            } else effetsAvecSave();
          };
          // Peut faire peur à la cible
          if (options.peur) {
            peurOneToken(target, pageId, options.peur.seuil,
              options.peur.duree, {
                resisteAvecForce: true
              }, display, evt, effetPietinement);
          } else effetPietinement();
        } else {
          evt.succes = false;
          finCibles();
        }
      });
    }); //Fin de la boucle pour toutes cibles
  }

  function finaliseDisplay(display, explications, evt) {
    addEvent(evt);
    explications.forEach(function(expl) {
      addLineToFramedDisplay(display, expl, 80);
    });
    sendChat("", endFramedDisplay(display));
  }

  // RD spécifique au type
  function typeRD(charId, dmgType) {
    if (dmgType === undefined || dmgType == 'normal') return 0;
    return charAttributeAsInt(charId, 'RD_' + dmgType, 0);
  }

  function probaSucces(de, seuil, nbreDe) {
    if (nbreDe == 2) {
      var proba1 = probaSucces(de, seuil, 1);
      return 1 - (1 - proba1) * (1 - proba1);
    }
    if (seuil < 2) seuil = 2; // 1 est toujours un échec
    else if (seuil > 20) seuil = 20;
    return ((de - seuil) + 1) / de;
  }

  // Meilleure carac parmis 2 pour un save.
  function meilleureCarac(carac1, carac2, personnage, seuil) {
    var charId = personnage.charId;
    var bonus1 = bonusTestCarac(carac1, personnage);
    if (carac1 == 'DEX') bonus1 += charAttributeAsInt(charId, 'reflexesFelins', 0);
    var bonus2 = bonusTestCarac(carac2, personnage);
    if (carac2 == 'DEX') bonus2 += charAttributeAsInt(charId, 'reflexesFelins', 0);
    var nbrDe1 = nbreDeTestCarac(carac1, charId);
    var nbrDe2 = nbreDeTestCarac(carac2, charId);
    var de = deTest(personnage);
    var proba1 = probaSucces(de, seuil - bonus1, nbrDe1);
    var proba2 = probaSucces(de, seuil - bonus2, nbrDe2);
    if (proba2 > proba1) return carac2;
    return carac1;
  }

  //s représente le save, avec une carac, une carac2 optionnelle et un seuil
  //expliquer est une fonction qui prend en argument un string et le publie
  // options peut contenir les champs :
  //   - msgPour : message d'explication à afficher avant le jet
  //   - msgReussite : message à afficher en cas de réussite
  //   - msgRate : message à afficher si l'action rate
  //   - attaquant : le {charId, token} de l'attaquant contre lequel le save se fait (si il y en a un)
  function save(s, target, expliquer, options, evt, afterSave) {
    var bonus = 0;
    if (options.attaquant &&
      charAttributeAsBool(target, 'protectionContreLeMal') &&
      estMauvais(options.attaquant)) {
      bonus += 2;
      expliquer("Protection contre le mal => +2 au jet de sauvegarde");
    }
    var bonusAttrs = [];
    var carac = s.carac;
    //Cas où le save peut se faire au choix parmis 2 caracs
    if (s.carac2) {
      carac = meilleureCarac(carac, s.carac2, target, s.seuil);
    }
    if (carac == 'DEX') {
      bonusAttrs.push('reflexesFelins');
    }
    testCaracteristique(target, carac, bonusAttrs, s.seuil, bonus, evt,
      function(reussite, rollText) {
        var smsg = " Jet de " + carac + " difficulté " + s.seuil;
        if (options.msgPour) smsg += options.msgPour;
        expliquer(smsg);
        smsg = target.token.get('name') + " fait " + rollText;
        if (reussite) {
          smsg += " => réussite";
          if (options.msgReussite) smsg += options.msgReussite;
        } else {
          smsg += " => échec";
          if (options.msgRate) smsg += options.msgRate;
        }
        expliquer(smsg);
        afterSave(reussite, rollText);
      });
  }

  function partialSave(ps, target, showTotal, dmgDisplay, total, expliquer, evt, afterSave) {
    if (ps.partialSave !== undefined) {
      if ((ps.partialSave.carac == 'CON' || ps.partialSave.carac2 == 'CON') && estNonVivant(target)) {
        expliquer("Les créatures non-vivantes sont immnunisées aux attaques qui demandent un test de constitution");
        afterSave({
          succes: true,
          display: '0',
          dmgDisplay: '0',
          total: 0,
          showTotal: false
        });
        return;
      }
      save(ps.partialSave, target, expliquer, {
          msgPour: " pour réduire les dégâts",
          msgReussite: ", dégâts divisés par 2",
          attaquant: ps.attaquant
        }, evt,
        function(succes, rollText) {
          if (succes) {
            if (showTotal) dmgDisplay = "(" + dmgDisplay + ")";
            dmgDisplay = dmgDisplay + " / 2";
            showTotal = true;
            total = Math.ceil(total / 2);
          } else {}
          afterSave({
            succes: succes,
            display: rollText,
            dmgDisplay: dmgDisplay,
            total: total,
            showTotal: showTotal
          });
        });
    } else afterSave();
  }

  // Fonction asynchrone
  // displayRes est optionnel, et peut avoir 2 arguments
  // - un texte affichant le jet de dégâts
  // - la valeur finale des dégâts infligés
  function dealDamage(target, dmg, otherDmg, evt, crit, options, explications, displayRes) {
    if (options === undefined) options = {};
    var expliquer = function(msg) {
      if (explications) explications.push(msg);
      else sendChar(target.charId, msg);
    };
    if (attributeAsBool(target, 'intangible') ||
      attributeAsBool(target, 'ombreMortelle') ||
      (options.aoe === undefined &&
        attributeAsBool(target, 'formeGazeuse'))) {
      expliquer("L'attaque passe à travers de " + target.token.get('name'));
      if (displayRes) displayRes('0', 0);
      return 0;
    }
    if (options.asphyxie && estNonVivant(target)) {
      expliquer("L'asphyxie est sans effet sur une créature non-vivante");
      if (displayRes) displayRes('0', 0);
      return 0;
    }
    crit = crit || 1;
    otherDmg = otherDmg || [];
    evt.affectes = evt.affectes || [];
    var dmgDisplay = dmg.display;
    var dmgTotal = dmg.total;
    var showTotal = false;
    if (crit > 1) {
      dmgDisplay += " X " + crit;
      dmgTotal = dmgTotal * crit;
      if (options.affute) {
        var bonusCrit = randomInteger(6);
        dmgDisplay = "(" + dmgDisplay + ")+" + bonusCrit;
        dmgTotal += bonusCrit;
      } else {
        showTotal = true;
      }
    }
    //On trie les DM supplémentaires selon leur type
    var dmgParType = {};
    otherDmg.forEach(function(d) {
      if (_.has(dmgParType, d.type)) dmgParType[d.type].push(d);
      else dmgParType[d.type] = [d];
    });

    // Dommages de même type que le principal, mais à part, donc non affectés par les critiques
    var mainDmgType = dmg.type;
    var dmgExtra = dmgParType[mainDmgType];
    if (dmgExtra && dmgExtra.length > 0) {
      if (crit > 1) dmgDisplay = "(" + dmgDisplay + ")";
      showTotal = true;
      var count = dmgExtra.length;
      dmgExtra.forEach(function(d) {
        count--;
        partialSave(d, target, false, d.display, d.total, expliquer, evt,
          function(res) {
            if (res) {
              dmgTotal += res.total;
              dmgDisplay += "+" + res.dmgDisplay;
            } else {
              dmgTotal += d.total;
              dmgDisplay += "+" + d.display;
            }
            if (count === 0) dealDamageAfterDmgExtra(target, mainDmgType, dmgTotal, dmgDisplay, showTotal, dmgParType, dmgExtra, crit, options, evt, expliquer, displayRes);
          });
      });
    } else {
      return dealDamageAfterDmgExtra(target, mainDmgType, dmgTotal, dmgDisplay, showTotal, dmgParType, dmgExtra, crit, options, evt, expliquer, displayRes);
    }
  }

  function applyRDMagique(rdMagique, dmgType, total, display) {
    if (total && rdMagique && rdMagique > 0) {
      switch (dmgType) {
        case 'normal':
        case 'poison':
        case 'maladie':
          if (total < rdMagique) {
            display += "-" + total;
            rdMagique -= total;
            total = 0;
          } else {
            display += "-" + rdMagique;
            total -= rdMagique;
            rdMagique = 0;
          }
          return {
            total: total,
            rdMagique: rdMagique,
            display: display
          };
        default:
          return;
      }
    }
    return;
  }

  function applyRDSauf(rds, dmgType, total, display) {
    if (total) {
      for (var saufType in rds) {
        var rd = rds[saufType];
        if (rd < 1 || saufType == dmgType) break;
        if (total < rd) {
          display += "-" + total;
          rds[saufType] -= total;
          total = 0;
        } else {
          display += "-" + rd;
          total -= rd;
          rds[saufType] = 0;
        }
      }
    }
    return {
      total: total,
      display: display
    };
  }

  function dealDamageAfterDmgExtra(target, mainDmgType, dmgTotal, dmgDisplay, showTotal, dmgParType, dmgExtra, crit, options, evt, expliquer, displayRes) {
    var rdMain = typeRD(target.charId, mainDmgType);
    if (rdMain > 0 && dmgTotal > 0) {
      dmgTotal -= rdMain;
      if (dmgTotal < 0) {
        rdMain += dmgTotal;
        dmgTotal = 0;
      }
      dmgDisplay += " - " + rdMain;
      showTotal = true;
    }
    var rdMagique;
    if (options.magique) rdMagique = 0;
    else rdMagique = typeRD(target.charId, 'sauf_magique');
    if (rdMagique) showTotal = true;
    var resMagique = applyRDMagique(rdMagique, mainDmgType, dmgTotal, dmgDisplay);
    if (resMagique) {
      rdMagique = resMagique.rdMagique;
      dmgTotal = resMagique.total;
      dmgDisplay = resMagique.display;
    }
    var rdElems = 0;
    if (attributeAsBool(target, 'protectionContreLesElements')) {
      rdElems = charAttributeAsInt(target, 'voieDeLaMagieElementaire', 0) * 2;
    }
    if (rdElems > 0 && dmgTotal > 0 && estElementaire(mainDmgType)) {
      if (dmgTotal > rdElems) {
        dmgDisplay += ' - ' + rdElems;
        dmgTotal -= rdElems;
        rdElems = 0;
      } else {
        dmgDisplay += ' - ' + dmgTotal;
        rdElems -= dmgTotal;
        dmgTotal = 0;
      }
    }
    var rdSauf = [];
    if (target.attrs === undefined) {
      target.attrs = findObjs({
        _type: 'attribute',
        _characterid: target.charId
      });
    }
    target.attrs.forEach(function(attr) {
      var attrName = attr.get('name');
      if (attrName.startsWith('RD_sauf_')) {
        if (attrName == 'RD_sauf_magique') return;
        var rds = parseInt(attr.get('current'));
        if (isNaN(rds) || rds < 1) return;
        rdSauf[attrName.substr(8)] = rds;
      }
    });
    var resSauf = applyRDSauf(rdSauf, mainDmgType, dmgTotal, dmgDisplay);
    dmgTotal = resSauf.total;
    dmgDisplay = resSauf.display;
    var invulnerable = charAttributeAsBool(target, 'invulnerable');
    var mitigate = function(dmgType, divide, zero) {
      if (estElementaire(dmgType)) {
        if (invulnerable) {
          divide();
        }
        if (dmgType == 'froid' && attributeAsBool(target, 'masqueMortuaire')) {
          divide();
        }
      } else {
        if ((dmgType == 'poison' || dmgType == 'maladie') && (invulnerable || estNonVivant(target))) {
          zero();
        } else if (attributeAsBool(target, 'armureMagie')) {
          divide();
        }
      }
    };
    // Damage mitigaters for main damage
    mitigate(mainDmgType,
      function() {
        dmgTotal = Math.ceil(dmgTotal / 2);
        if (dmgExtra) dmgDisplay = "(" + dmgDisplay + ")";
        dmgDisplay += " / 2";
        showTotal = true;
      },
      function() {
        dmgTotal = 0;
      });
    // Other sources of damage
    // First count all other sources of damage, for synchronization
    var count = 0;
    for (var dt in dmgParType) {
      count += dmgParType[dt].length;
    }
    var dealOneType = function(dmgType) {
      if (dmgType == mainDmgType) {
        count -= dmgParType[dmgType].length;
        if (count === 0) dealDamageAfterOthers(target, crit, options, evt, expliquer, displayRes, dmgTotal, dmgDisplay, showTotal);
        return; //type principal déjà géré
      }
      showTotal = true;
      var dm = 0;
      var typeDisplay = "";
      var typeCount = dmgParType[dmgType].length;
      dmgParType[dmgType].forEach(function(d) {
        partialSave(d, target, false, d.display, d.total, expliquer, evt,
          function(res) {
            if (res) {
              dm += res.total;
              if (typeDisplay === '') typeDisplay = res.dmgDisplay;
              else typeDisplay += "+" + res.dmgDisplay;
            } else {
              dm += d.total;
              if (typeDisplay === '') typeDisplay = d.display;
              else typeDisplay += "+" + d.display;
            }
            typeCount--;
            if (typeCount === 0) {
              var rdl = typeRD(target.charId, dmgType);
              if (rdl > 0 && dm > 0) {
                dm -= rdl;
                if (dm < 0) {
                  rdl += dm;
                  dm = 0;
                }
                typeDisplay += "-" + rdl;
              }
              var resMagique = applyRDMagique(rdMagique, dmgType, dm, typeDisplay);
              if (resMagique) {
                rdMagique = resMagique.rdMagique;
                dm = resMagique.total;
                typeDisplay = resMagique.display;
              }
              if (rdElems > 0 && dm > 0 && estElementaire(dmgType)) {
                if (dm > rdElems) {
                  typeDisplay += ' - ' + rdElems;
                  dm -= rdElems;
                  rdElems = 0;
                } else {
                  typeDisplay += ' - ' + dm;
                  rdElems -= dm;
                  dm = 0;
                }
              }
              var resSauf = applyRDSauf(rdSauf, dmgType, dm, typeDisplay);
              dm = resSauf.total;
              typeDisplay = resSauf.display;
              mitigate(dmgType,
                function() {
                  dm = Math.ceil(dm / 2);
                  if (dmgParType[dmgType].length > 1) typeDisplay = "(" + typeDisplay + ")";
                  typeDisplay += " / 2";
                },
                function() {
                  dm = 0;
                });
              dmgTotal += dm;
              dmgDisplay += "+" + typeDisplay;
            }
            count--;
            if (count === 0) dealDamageAfterOthers(target, crit, options, evt, expliquer, displayRes, dmgTotal, dmgDisplay, showTotal);
          });
      });
    };
    if (count > 0) {
      for (var dmgType in dmgParType) {
        dealOneType(dmgType);
      }
    } else {
      return dealDamageAfterOthers(target, crit, options, evt, expliquer, displayRes, dmgTotal, dmgDisplay, showTotal);
    }
  }

  function mort(personnage, evt) {
    setState(personnage, 'mort', true, evt);
    var targetPos = {
      x: personnage.token.get('left'),
      y: personnage.token.get('top')
    };
    spawnFxBetweenPoints(targetPos, {
      x: 400,
      y: 400
    }, "splatter-blood");
  }

  function dealDamageAfterOthers(target, crit, options, evt, expliquer, displayRes, dmgTotal, dmgDisplay, showTotal) {
    var charId = target.charId;
    var token = target.token;
    // Now do some dmg mitigation rolls, if necessary
    if ((options.distance || options.aoe) &&
      attributeAsBool(target, 'a_couvert')) {
      if (showTotal) dmgDisplay = "(" + dmgDisplay + ")";
      dmgDisplay += " / 2";
      dmgTotal = Math.ceil(dmgTotal / 2);
      showTotal = true;
    }
    partialSave(options, target, showTotal, dmgDisplay, dmgTotal,
      expliquer, evt,
      function(saveResult) {
        if (saveResult) {
          dmgTotal = saveResult.total;
          dmgDisplay = saveResult.dmgDisplay;
          showTotal = saveResult.showTotal;
        }
        var rd = charAttributeAsInt(charId, 'RDS', 0);
        if (crit > 1) rd += charAttributeAsInt(charId, 'RD_critique', 0);
        if (options.tranchant) rd += charAttributeAsInt(charId, 'RD_tranchant', 0);
        if (options.percant) rd += charAttributeAsInt(charId, 'RD_percant', 0);
        if (options.contondant) rd += charAttributeAsInt(charId, 'RD_contondant', 0);
        if (options.distance) {
          var piqures = charAttributeAsInt(charId, 'puquresDInsecte', 0);
          if (piqures > 0 && charAttributeAsBool(charId, 'DEFARMUREON') && charAttributeAsInt(charId, 'DEFARMURE', 0) > 5) rd += piqures;
        }
        if (attributeAsBool(target, 'masqueMortuaire')) rd += 2;
        if (target.defautCuirasse) rd = 0;
        if (options.intercepter) rd += options.intercepter;
        if (target.extraRD) {
          rd += target.extraRD;
          expliquer(target.tokName + " dévie le coup sur son armure");
        }
        if (rd > 0) {
          if (showTotal) dmgDisplay = "(" + dmgDisplay + ") - " + rd;
          else {
            dmgDisplay += " - " + rd;
            showTotal = true;
          }
        }
        dmgTotal -= rd;
        if (dmgTotal < 0) dmgTotal = 0;
        if (options.divise) {
          dmgTotal = dmgTotal / options.divise;
          dmgDisplay = "(" + dmgDisplay + ")/" + options.divise;
          showTotal = true;
        }
        // compute effect on target
        if (options.pointsVitaux && dmgTotal > 0) { //dégâts retardés pour une pression mortelle
          var pMortelle = tokenAttribute(target, 'pressionMortelle');
          var dmgPMort = dmgTotal;
          var numberPMort = 1;
          if (pMortelle.length > 0) {
            dmgPMort += pMortelle[0].get('current');
            numberPMort += pMortelle[0].get('max');
          }
          setTokenAttr(target, 'pressionMortelle', dmgPMort, evt, undefined,
            numberPMort);
        } else {
          var bar1 = parseInt(token.get('bar1_value'));
          var pvmax = parseInt(token.get('bar1_max'));
          if (isNaN(bar1)) {
            error("Pas de points de vie chez la cible", token);
            bar1 = 0;
            pvmax = 0;
          } else if (isNaN(pvmax)) {
            pvmax = bar1;
            token.set("bar1_max", bar1);
          }
          var manaAttr = findObjs({
            _type: 'attribute',
            _characterid: charId,
            name: 'PM'
          });
          var hasMana = false;
          if (manaAttr.length > 0) {
            var manaMax = parseInt(manaAttr[0].get('max'));
            hasMana = !isNaN(manaMax) && manaMax > 0;
          }
          var tempDmg = 0;
          if (hasMana) {
            tempDmg = attributeAsInt(target, 'DMTEMP', 0);
          } else {
            tempDmg = parseInt(token.get("bar2_value"));
            if (isNaN(tempDmg)) {
              if (options.tempDmg) { //then try to set bar2 correctly
                var link = token.get("bar1_link");
                if (link === "") {
                  token.set("bar2_max", pvmax);
                } else {
                  var tmpHitAttr =
                    findObjs({
                      _type: "attribute",
                      _characterid: charId,
                      name: "DMTEMP"
                    });
                  var dmTemp;
                  if (tmpHitAttr.length === 0) {
                    dmTemp =
                      createObj("attribute", {
                        characterid: charId,
                        name: "DMTEMP",
                        current: 0,
                        max: pvmax
                      });
                  } else {
                    dmTemp = tmpHitAttr[0];
                  }
                  token.set("bar2_max", pvmax);
                  token.set("bar2_link", dmTemp.id);
                }
              }
              tempDmg = 0;
            }
          }
          if (options.tempDmg) {
            var oldTempDmg = tempDmg;
            tempDmg += dmgTotal;
            if (tempDmg > pvmax) tempDmg = pvmax;
            if (hasMana) {
              setTokenAttr(target, 'DMTEMP', tempDmg, evt);
            } else {
              evt.affectes.push({
                affecte: token,
                prev: {
                  bar2_value: oldTempDmg
                }
              });
              updateCurrentBar(token, 2, tempDmg);
            }
          } else {
            evt.affectes.push({
              affecte: token,
              prev: {
                bar1_value: bar1
              }
            });
            if (bar1 > 0 && bar1 <= dmgTotal && charAttributeAsBool(charId, 'instinctDeSurvieHumain')) {
              dmgTotal = dmgTotal / 2;
              if (dmgTotal < 1) dmgTotal = 1;
              dmgDisplay += "/2";
              showTotal = true;
              expliquer("L'instinct de survie aide à réduire une attaque fatale");
            }
            bar1 = bar1 - dmgTotal;
            if (bar1 <= 0) {
              if (charAttributeAsBool(charId, 'sergent') &&
                !attributeAsBool(target, 'sergentUtilise')) {
                expliquer(token.get('name') + " évite l'attaque in-extremis");
                setTokenAttr(target, 'sergentUtilise', true, evt);
              } else {
                updateCurrentBar(token, 1, 0);
                if (charAttributeAsBool(charId, 'baroudHonneur')) {
                  expliquer(token.get('name') + " devrait être mort, mais il continue à se battre !");
                  setTokenAttr(target, 'baroudHonneurActif', true, evt);
                } else {
                  var defierLaMort = charAttributeAsInt(charId, 'defierLaMort', 0);
                  if (defierLaMort > 0) {
                    save({
                        carac: 'CON',
                        seuil: defierLaMort
                      }, target, expliquer, {
                        msgPour: " pour défier la mort",
                        msgReussite: ", conserve 1 PV"
                      }, evt,
                      function(reussite, rollText) {
                        if (reussite) {
                          updateCurrentBar(token, 1, 1);
                          bar1 = 1;
                          setTokenAttr(target, 'defierLaMort', defierLaMort + 10, evt);
                        } else mort(target, evt);
                        if (bar1 > 0 && tempDmg >= bar1) { //assomé
                          setState(target, 'assome', true, evt);
                        }
                        if (showTotal) dmgDisplay += " = " + dmgTotal;
                        if (displayRes === undefined) return dmgDisplay;
                        displayRes(dmgDisplay, dmgTotal);
                      });
                    if (displayRes === undefined) return dmgDisplay;
                    return;
                  } else mort(target, evt);
                }
              }
            } else { // bar1>0
              updateCurrentBar(token, 1, bar1);
            }
          }
          if (bar1 > 0 && tempDmg >= bar1) { //assomé
            setState(target, 'assome', true, evt);
          }
          if (showTotal) dmgDisplay += " = " + dmgTotal;
        }
        if (displayRes === undefined) return dmgDisplay;
        displayRes(dmgDisplay, dmgTotal);
      });
    return dmgDisplay;
  }


  function improve_image(image_url) {
    image_url = image_url.replace('/med.png', '/thumb.png');
    image_url = image_url.substring(0, image_url.indexOf('?'));

    return image_url;
  }

  function startFramedDisplay(playerId, action, perso1, perso2) {
    var playerBGColor = getObj("player", playerId).get("color");
    var playerTXColor = (getBrightness(playerBGColor) < 50) ? "#FFF" : "#000";
    var res =
      '/direct ' +
      '<div style="-webkit-box-shadow: 2px 2px 5px 0px rgba(0,0,0,0.75); -moz-box-shadow: 2px 2px 5px 0px rgba(0,0,0,0.75); box-shadow: 2px 2px 5px 0px rgba(0,0,0,0.75); border: 1px solid #000; border-radius: 6px; -moz-border-radius: 6px; -webkit-border-radius: 6px; overflow: hidden;">' +
      '<div style="overflow:auto; text-align: center; vertical-align: middle; padding: 5px 5px; border-bottom: 1px solid #000; color: ' + playerTXColor + '; background-color: ' + playerBGColor + ';" title=""> ' +
      '<table>';
    var name1 = '';
    var avatar1 = '';
    if (perso1) {
      if (perso1.tokName) name1 = perso1.tokName;
      else name1 = perso1.token.get('name');
      name1 = '<b>' + name1 + '</b>';
      var character1 = getObj('character', perso1.charId);
      if (character1)
        avatar1 = '<img src="' + improve_image(character1.get('avatar')) + '" style="width: ' + (perso2 ? 50 : 100) + '%; display: block; max-width: 100%; height: auto; border-radius: 6px; margin: 0 auto;">';
    }
    if (perso2) {
      var name2 = perso2.tokName;
      if (name2 === undefined) name2 = perso2.token.get('name');
      name2 = '<b>' + name2 + '</b>';
      var avatar2 = '';
      var character2 = getObj('character', perso2.charId);
      if (character2 !== undefined) {
        avatar2 = '<img src="' + improve_image(character2.get('avatar')) + '" style="width: 50%; display: block; max-width: 100%; height: auto; border-radius: 6px; margin: 0 auto;">';
      }
      res +=
        '<tr style="text-align: center">' +
        '<td style="width:45%; vertical-align: middle;">' +
        name1 +
        '</td>' +
        '<td style="width:10%; vertical-align: middle;" rowspan="2">' +
        'VS' +
        '</td>' +
        '<td style="width:45%; vertical-align: middle;">' +
        name2 +
        '</td>' +
        '</tr>' +
        '<tr style="text-align: center">' +
        '<td style="width:45%; vertical-align: middle;">' +
        avatar1 +
        '</td>' +
        '<td style="width:45%; vertical-align: middle;">' +
        avatar2 +
        '</td>' +
        '</tr>';
    } else {
      res +=
        '<tr style="text-align: left">' +
        '<td style="width:25%; vertical-align: middle;">' +
        avatar1 +
        '</td>' +
        '<td style="width:75%; vertical-align: middle;">' +
        name1 +
        '</td>' +
        '</tr>';
    }
    res +=
      '</table>' +
      '</div>' +
      '<div style="font-size: 85%; text-align: left; vertical-align: middle; padding: 5px 5px; border-bottom: 1px solid #000; color: #a94442; background-color: #f2dede;" title=""> ' +
      action +
      '</div>' +
      '<div style="background-color: #FFF;">';
    return {
      output: res,
      isOdd: true,
      isfirst: true,
    };
  }

  function addLineToFramedDisplay(display, line, size, new_line) {
    size = size || 100;
    new_line = (new_line !== 'undefined') ? new_line : true;

    var background_color, border, separator = '';

    if (!new_line) display.isOdd = !display.isOdd;
    if (display.isOdd) {
      background_color = "transparent";
      display.isOdd = false;
    } else {
      background_color = "#f3f3f3";
      display.isOdd = true;
    }
    if (size < 100) background_color = "#fcf8e3";

    if (!display.isfirst) {
      if (new_line) border = "border-top: 1px solid #333;";
    } else display.isfirst = false;

    var formatedLine = '<div style="padding: 0 5px 0; background-color: ' + background_color + '; color: #000;' + border + '">';

    if (!new_line) separator = "border-top: 1px solid #ddd;";
    formatedLine += '<div style="padding: 4px 0; font-size: ' + size + '%;' + separator + '">' + line + '</div>';
    formatedLine += '</div>';
    display.output += formatedLine;
  }

  function endFramedDisplay(display) {
    var res = display.output;
    res += '</div>';
    res += '</div>';
    return res;
  }

  function buildinline(inlineroll, dmgType, magique) {
    var InlineBorderRadius = 5;
    var InlineColorOverride = "";
    var values = [];
    var critRoll = false;
    var failRoll = false;
    var critCheck = false;
    var failCheck = false;
    var highRoll = false;
    var lowRoll = false;
    var noHighlight = false;

    inlineroll.results.rolls.forEach(function(roll) {
      var result = processRoll(roll, critRoll, failRoll, highRoll, lowRoll, noHighlight);
      if (result.value.toString().indexOf("critsuccess") != -1) critCheck = true;
      if (result.value.toString().indexOf("critfail") != -1) failCheck = true;
      values.push(result.value);
      critRoll = result.critRoll;
      failRoll = result.failRoll;
      highRoll = result.highRoll;
      lowRoll = result.lowRoll;
      noHighlight = result.noHighlight;
    });

    // Overrides the default coloring of the inline rolls...
    switch (dmgType) {
      case 'normal':
      case 'maladie':
        if (magique)
          InlineColorOverride = ' background-color: #FFFFFF; color: #534200;';
        else
          InlineColorOverride = ' background-color: #F1E6DA; color: #000;';
        break;
      case 'feu':
        InlineColorOverride = ' background-color: #FF3011; color: #440000;';
        break;
      case 'froid':
        InlineColorOverride = ' background-color: #77FFFF; color: #004444;';
        break;
      case 'acide':
        InlineColorOverride = ' background-color: #80BF40; color: #020401;';
        break;
      case 'sonique':
        InlineColorOverride = ' background-color: #E6CCFF; color: #001144;';
        break;
      case 'electrique':
        InlineColorOverride = ' background-color: #FFFF80; color: #222200;';
        break;
      case 'poison':
        InlineColorOverride = ' background-color: #558000; color: #DDAFFF;';
        break;
      default:
        if (critCheck && failCheck) {
          InlineColorOverride = ' background-color: #8FA4D4; color: #061539;';
        } else if (critCheck && !failCheck) {
          InlineColorOverride = ' background-color: #88CC88; color: #004400;';
        } else if (!critCheck && failCheck) {
          InlineColorOverride = ' background-color: #FFAAAA; color: #660000;';
        } else {
          InlineColorOverride = ' background-color: #FFFEA2; color: #000;';
        }
    }
    var rollOut = '<span style="display: inline-block; border-radius: ' + InlineBorderRadius + 'px; padding: 0 4px; ' + InlineColorOverride + '" title="' + inlineroll.expression + ' = ' + values.join("");
    rollOut += '" class="a inlinerollresult showtip tipsy-n';
    rollOut += (critCheck && failCheck) ? ' importantroll' : (critCheck ? ' fullcrit' : (failCheck ? ' fullfail' : ''));
    rollOut += '">' + inlineroll.results.total + '</span>';
    return rollOut;
  }

  function processRoll(roll, critRoll, failRoll, highRoll, lowRoll, noHighlight) {
    switch (roll.type) {
      case 'C':
        return {
          value: " " + roll.text + " "
        };
      case 'L':
        if (roll.text.indexOf("HR") != -1) highRoll = parseInt(roll.text.substring(2));
        else highRoll = false;
        if (roll.text.indexOf("LR") != -1) lowRoll = parseInt(roll.text.substring(2));
        else lowRoll = false;
        if (roll.text.indexOf("NH") != -1) {
          // Blocks highlight on an individual roll...
          noHighlight = true;
        }
        // Remove inline tags to reduce clutter...
        roll.text = roll.text.replace(/HR(\d+)/g, "");
        roll.text = roll.text.replace(/LR(\d+)/g, "");
        roll.text = roll.text.replace(/NH/g, "");
        if (roll.text !== "") roll.text = " [" + roll.text + "] ";
        return {
          value: roll.text,
          highRoll: highRoll,
          lowRoll: lowRoll,
          noHighlight: noHighlight
        };
      case 'M':
        roll.expr = roll.expr.toString().replace(/\+/g, " + ");
        return {
          value: roll.expr
        };
      case 'R':
        var rollValues = [];
        roll.results.forEach(function(result) {
          if (result.tableItem !== undefined) {
            rollValues.push(result.tableItem.name);
          } else {
            // Turn off highlighting if true...
            if (noHighlight) {
              critRoll = false;
              failRoll = false;
            } else {
              if (_.has(roll, 'mods') && _.has(roll.mods, 'customCrit')) {
                switch (roll.mods.customCrit[0].comp) {
                  case '=':
                  case '==':
                    critRoll = (result.v == roll.mods.customCrit[0].point);
                    break;
                  case '>=':
                  case '=>':
                  case '>':
                    critRoll = (result.v >= roll.mods.customCrit[0].point);
                    break;
                  default:
                    critRoll =
                      (highRoll !== false && result.v >= highRoll ||
                        result.v === roll.sides);
                }
              } else {
                critRoll =
                  (highRoll !== false && result.v >= highRoll ||
                    result.v === roll.sides);
              }
              failRoll =
                (!critRoll &&
                  (lowRoll !== false && result.v <= lowRoll || result.v === 1));
            }
            var rv = "<span class='basicdiceroll" + (critRoll ? ' critsuccess' : (failRoll ? ' critfail' : '')) + "'>" + result.v + "</span>";
            rollValues.push(rv);
          }
        });
        var separator = ' + ';
        if (roll.mods && roll.mods.keep) separator = ' , ';
        return {
          value: "(" + rollValues.join(separator) + ")",
          critRoll: critRoll,
          failRoll: failRoll,
          highRoll: highRoll,
          lowRoll: lowRoll,
          noHighlight: noHighlight
        };
      case 'G':
        var grollVal = [];
        roll.rolls.forEach(function(groll) {
          groll.forEach(function(groll2) {
            var result = processRoll(groll2, highRoll, lowRoll, noHighlight);
            grollVal.push(result.value);
            critRoll = critRoll || result.critRoll;
            failRoll = failRoll || result.failRoll;
            highRoll = highRoll || result.highRoll;
            lowRoll = lowRoll || result.lowRoll;
            noHighlight = noHighlight || result.noHighlight;
          });
        });
        return {
          value: "{" + grollVal.join(" ") + "}",
          critRoll: critRoll,
          failRoll: failRoll,
          highRoll: highRoll,
          lowRoll: lowRoll,
          noHighlight: noHighlight
        };
    }
  }

  function getBrightness(hex) {
    hex = hex.replace('#', '');
    var c_r = hexDec(hex.substr(0, 2));
    var c_g = hexDec(hex.substr(2, 2));
    var c_b = hexDec(hex.substr(4, 2));
    return ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;
  }

  function hexDec(hex_string) {
    hex_string = (hex_string + '').replace(/[^a-f0-9]/gi, '');
    return parseInt(hex_string, 16);
  }

  function addOrigin(name, toEvaluate) {
    return toEvaluate.replace(/@{/g, "@{" + name + "|");
  }

  function getPortee(charId, weaponPrefix) {
    var res = getAttrByName(charId, weaponPrefix + "armeportee");
    if (res === undefined) return 0;
    res = parseInt(res);
    if (isNaN(res) || res <= 0) return 0;
    return res;
  }

  function tokenCenter(tok) {
    return [tok.get('left'), tok.get('top')];
  }

  // Retourne le diamètre d'un disque inscrit dans un carré de surface
  // équivalente à celle du token
  function tokenSizeAsCircle(token) {
    var surface = token.get('width') * token.get('height');
    return Math.sqrt(surface);
  }

  // if token is bigger than thresh reduce the distance by that size
  function tokenSize(tok, thresh) {
    var size = (tok.get('width') + tok.get('height')) / 2;
    if (size > thresh) return ((size - thresh) / 2);
    return 0;
  }

  //strict1 = true si on considère que tok1 doit avoir une taille nulle
  function distanceCombat(tok1, tok2, pageId, strict1) {
    if (pageId === undefined) {
      pageId = tok1.get('pageid');
    }
    var PIX_PER_UNIT = 70;
    var page = getObj("page", pageId);
    var scale = page.get('scale_number');
    var pt1 = tokenCenter(tok1);
    var pt2 = tokenCenter(tok2);
    var distance_pix = VecMath.length(VecMath.vec(pt1, pt2));
    if (!strict1) distance_pix -= tokenSize(tok1, PIX_PER_UNIT);
    distance_pix -= tokenSize(tok2, PIX_PER_UNIT);
    if (distance_pix < PIX_PER_UNIT * 1.5) return 0; //cases voisines
    return ((distance_pix / PIX_PER_UNIT) * scale);
  }


  function malusDistance(perso1, tok2, distance, portee, pageId, explications, ignoreObstacles) {
    if (distance === 0) return 0;
    var tok1 = perso1.token;
    var mPortee = (distance <= portee) ? 0 : (Math.ceil(5 * (distance - portee) / portee));
    if (mPortee > 0) {
      explications.push("Distance > " + portee + " m => -" + mPortee + " en Attaque");
    }
    if (ignoreObstacles || charAttributeAsBool(perso1.charId, 'joliCoup'))
      return mPortee;
    // Now determine if any token is between tok1 and tok2
    var allToks =
      findObjs({
        _type: "graphic",
        _pageid: pageId,
        _subtype: "token",
        layer: "objects"
      });
    var mObstacle = 0;
    var PIX_PER_UNIT = 70;
    var pt1 = tokenCenter(tok1);
    var pt2 = tokenCenter(tok2);
    var distance_pix = VecMath.length(VecMath.vec(pt1, pt2));
    var liste_obstacles = [];
    allToks.forEach(function(obj) {
      if (obj.id == tok1.id || obj.id == tok2.id) return;
      var objCharId = obj.get('represents');
      var perso = {
        token: obj,
        charId: objCharId
      };
      if (objCharId !== '' && (getState(perso, 'mort') ||
          getState(perso, 'assome') || getState(perso, 'endormi') ||
          attributeAsBool(perso, 'intangible')))
        return;
      var pt = tokenCenter(obj);
      var obj_dist = VecMath.length(VecMath.vec(pt1, pt));
      if (obj_dist > distance_pix) return;
      obj_dist = VecMath.length(VecMath.vec(pt2, pt));
      if (obj_dist > distance_pix) return;
      var distToTrajectory = VecMath.ptSegDist(pt, pt1, pt2);
      // On modélise le token comme un disque
      var rayonObj = tokenSizeAsCircle(obj) / 2;
      if (distToTrajectory > rayonObj) return;
      liste_obstacles.push(obj.get("name"));
      // On calcule un malus proportionnel à l'arc à traverser
      // Pour l'instant, malus = 1 si distance = PIX_PER_UNIT
      var longueurArc = 2 * Math.sqrt(rayonObj * rayonObj - distToTrajectory * distToTrajectory);
      var mToken = longueurArc / PIX_PER_UNIT;
      //malus plus important si l'obstacle est au contact de la cible
      if (distanceCombat(tok2, obj, pageId) === 0) mToken *= 5;
      else mToken *= 3;
      mObstacle += mToken;
    });
    // On ajuste aussi en fonction de la taille de la cible
    mObstacle = mObstacle / (tokenSizeAsCircle(tok2) / PIX_PER_UNIT);
    if (mObstacle > 5) mObstacle = 5;
    else mObstacle = Math.round(mObstacle);
    var res = mPortee + mObstacle;
    if (mObstacle > 0) {
      log("Obstacle" + ((mObstacle > 1) ? "s" : "") + " trouvé : " + liste_obstacles.join(', '));
      explications.push('Obstacle' + ((mObstacle > 1) ? 's' : '') + ' sur le trajet => -' + mObstacle + ' en Attaque<br /><span style="font-size: 0.8em; color: #666;">' + liste_obstacles.join(', ') + '</span>');
    }
    return res;
  }

  // Returns all attributes in attrs, with name name or starting with name_
  function allAttributesNamed(attrs, name) {
    var nameExt = name + '_';
    return attrs.filter(function(obj) {
      var attrName = obj.get('name');
      return (name == attrName || attrName.startsWith(nameExt));
    });
  }

  function removeAllAttributes(name, evt, attrs) {
    if (attrs === undefined) {
      attrs = findObjs({
        _type: 'attribute'
      });
    }
    var attrsNamed = allAttributesNamed(attrs, name);
    if (attrsNamed.length === 0) return attrs;
    if (evt.deletedAttributes === undefined) evt.deletedAttributes = [];
    attrsNamed.forEach(function(attr) {
      evt.deletedAttributes.push(attr);
      attr.remove();
    });
    attrs.filter(function(attr) {
      var ind = attrsNamed.findIndex(function(nattr) {
        return nattr.id == attr.id;
      });
      return (ind == -1);
    });
    return attrs;
  }

  //Met tous les attributs avec le nom au max
  function resetAttr(attrs, attrName, evt, msg) {
    allAttributesNamed(attrs, attrName).forEach(function(att) {
      var vm = parseInt(att.get("max"));
      if (!isNaN(vm)) {
        var vc = parseInt(att.get("current"));
        if (vc != vm) {
          evt.attributes.push({
            attribute: att,
            current: vc
          });
          att.set("current", vm);
          if (msg) {
            var charId = att.get('characterid');
            var character = getObj('character', charId);
            var name = character.get('name');
            sendChar(charId, "/w " + name + " " + msg);
          }
        }
      }
    });
  }

  function sortirDuCombat() {
    if (!state.COFantasy.combat) {
      log("Pas en combat");
      return;
    }
    sendChat("GM", "Le combat est terminé");
    var evt = {
      type: 'fin_combat',
      initiativepage: Campaign().get('initiativepage'),
      turnorder: Campaign().get('turnorder'),
      attributes: [],
      combat: true,
      tour: state.COFantasy.tour,
      init: state.COFantasy.init,
      deletedAttributes: []
    };
    state.COFantasy.combat = false;
    setActiveToken(undefined, evt);
    Campaign().set('initiativepage', false);
    var attrs = findObjs({
      _type: 'attribute'
    });
    // Fin des effets qui durent pour le combat
    attrs = removeAllAttributes('soinsDeGroupe', evt, attrs);
    attrs = removeAllAttributes('sergentUtilise', evt, attrs);
    attrs = removeAllAttributes('enflamme', evt, attrs);
    attrs = removeAllAttributes('protegerUnAllie', evt, attrs);
    attrs = removeAllAttributes('protegePar', evt, attrs);
    attrs = removeAllAttributes('intercepter', evt, attrs);
    attrs = removeAllAttributes('defenseTotale', evt, attrs);
    attrs = removeAllAttributes('dureeStrangulation', evt, attrs);
    attrs = removeAllAttributes('defautDansLaCuirasse', evt, attrs);
    attrs = removeAllAttributes('postureDeCombat', evt, attrs);
    attrs = removeAllAttributes('dedouble', evt, attrs);
    attrs = removeAllAttributes('limiteParCombat', evt, attrs);
    // Autres attributs
    // Remettre le pacifisme au max
    resetAttr(attrs, 'pacifisme', evt, "retrouve son pacifisme");
    // Remettre le traquenard à 1
    resetAttr(attrs, 'traquenard', evt);
    // Tout le monde recharge ses armes après un combat, non ?
    resetAttr(attrs, 'charge', evt, "recharge ses armes");
    // Et on récupère les munitions récupérables
    resetAttr(attrs, 'munition', evt, "récupère ses munitions");
    // Remettre défier la mort à 10
    resetAttr(attrs, 'defierLaMort', evt);
    //Effet de ignorerLaDouleur
    var ilds = allAttributesNamed(attrs, 'ignorerLaDouleur');
    ilds.forEach(function(ild) {
      var douleur = parseInt(ild.get('current'));
      if (isNaN(douleur)) {
        error("La douleur ignorée n'est pas un nombre", douleur);
        return;
      }
      var charId = ild.get('characterid');
      if (charId === undefined || charId === '') {
        error("Attribut sans personnage", ild);
        return;
      }
      var ildName = ild.get('name');
      if (ildName == 'ignorerLaDouleur') {
        var pvAttr = findObjs({
          _type: 'attribute',
          _characterid: charId,
          name: 'PV'
        });
        if (pvAttr.length === 0) {
          error("Personnage sans PV ", charId);
          return;
        }
        pvAttr = pvAttr[0];
        var pv = parseInt(pvAttr.get('current'));
        if (isNaN(pv)) {
          error("PV mal formés ", pvAttr);
          return;
        }
        evt.attributes.push({
          attribute: pvAttr,
          current: pv
        });
        var newPv = pv - douleur;
        if (newPv < 0) newPv = 0;
        pvAttr.set('current', newPv);
        if (pv > 0 && newPv === 0) {
          sendChar(charId, "s'écroule. Il semble sans vie. La douleur qu'il avait ignorée l'a finalement rattrapé...");
        } else {
          var tempDmg = charAttributeAsInt(charId, 'DMTEMP', 0);
          if (pv > tempDmg && newPv <= tempDmg) {
            sendChar(charId, "s'écroule, assomé. La douleur qu'il avait ignorée l'a finalement rattrapé...");
          } else {
            sendChar(charId, "subit le contrecoup de la douleur qu'il avait ignorée");
          }
        }
      } else { // ignorer la douleur d'un token 
        var tokName = ildName.substring(ildName.indexOf('_') + 1);
        var tokensIld = findObjs({
          _type: 'graphic',
          _subtype: 'token',
          represents: charId,
          name: tokName
        });
        if (tokensIld.length === 0) {
          error("Pas de token nommé " + tokName + " qui aurait ignoré la douleur", ild);
          return;
        }
        if (tokensIld.length > 1) {
          sendChar(charId, "a plusieurs tokens nommés " + tokName + ". Un seul d'entre eux subira l'effet d'ignorer la douleur");
        }
        var tokPv = parseInt(tokensIld[0].get('bar1_value'));
        var tokNewPv = tokPv - douleur;
        if (tokNewPv < 0) tokNewPv = 0;
        evt.affectes.push({
          affecte: tokensIld[0],
          prev: {
            bar1_value: tokPv
          }
        });
        updateCurrentBar(tokensIld[0], 1, tokNewPv);
        //TODO: faire mourrir, assomer
      }
    }); // end forEach on all attributes ignorerLaDouleur
    ilds.forEach(function(ild) {
      evt.deletedAttributes.push(ild);
      ild.remove();
    });
    // fin des effets temporaires (durée en tours, ou durée = combat)
    attrs.forEach(function(obj) {
      var attrName = obj.get('name');
      var charId = obj.get('characterid');
      if (estEffetTemp(attrName)) {
        finDEffet(obj, effetTempOfAttribute(obj), attrName, charId, evt);
      } else if (estEffetCombat(attrName)) {
        sendChar(charId, messageEffetCombat[effetCombatOfAttribute(obj)].fin);
        evt.deletedAttributes.push(obj);
        obj.remove();
      }
    });
    addEvent(evt);
  }

  function tokensNamed(names, pageId) {
    var tokens = findObjs({
      _type: 'graphic',
      _subtype: 'token',
      _pageid: pageId,
      layer: 'objects'
    });
    tokens = tokens.filter(function(obj) {
      var tokCharId = obj.get('represents');
      if (tokCharId === undefined) return false;
      var tokChar = getObj('character', tokCharId);
      if (tokChar === undefined) return false;
      var i = names.indexOf(tokChar.get('name'));
      return (i >= 0);
    });
    return tokens;
  }

  // actif est un argument optionnel qui représente (token+charId) de l'unique token sélectionné
  function getSelected(msg, callback, actif) {
    var pageId;
    if (msg.who.endsWith("(GM)")) {
      var player = getObj('player', msg.playerid);
      pageId = player.get('lastpage');
    }
    if (pageId === undefined || pageId === "") {
      var pages = Campaign().get('playerspecificpages');
      if (pages && pages[msg.playerid] !== undefined) {
        pageId = pages[msg.playerid];
      } else {
        pageId = Campaign().get('playerpageid');
      }
    }
    var args = msg.content.split(' --');
    var selected = [];
    var enleveAuxSelected = [];
    var count = args.length - 1;
    var called;
    var finalCall = function() {
      called = true;
      var res = selected.filter(function(sel) {
        var interdit = enleveAuxSelected.find(function(i) {
          return (i._id == sel._id);
        });
        return (interdit === undefined);
      });
      callback(res);
    };
    if (args.length > 1) {
      args.shift();
      args.forEach(function(cmd) {
        count--;
        var cmdSplit = cmd.split(' ');
        switch (cmdSplit[0]) {
          case 'equipe':
            var nomEquipe = 'Equipe' + cmd.substring(cmd.indexOf(' '));
            var equipes = findObjs({
              _type: 'handout',
              name: nomEquipe
            });
            if (equipes.length === 0) {
              error(nomEquipe + " inconnue", msg.content);
              return;
            }
            if (equipes.length > 1) {
              error("Plus d'une " + nomEquipe, cmd);
            }
            count += equipes.length;
            equipes.forEach(function(equipe) {
              equipe.get('notes', function(note) { //asynchrone
                var names = note.split('<br>');
                var tokens = tokensNamed(names, pageId);
                if (tokens.length === 0) {
                  error("Pas de token de l'" + nomEquipe + " sur la page");
                }
                tokens.forEach(function(tok) {
                  selected.push({
                    _id: tok.id
                  });
                });
                count--;
                if (count === 0) finalCall();
                return;
              });
            });
            return;
          case 'allies':
          case 'saufAllies':
            var selection = selected;
            if (cmdSplit[0] == 'saufAllies') selection = enleveAuxSelected;
            var activeNames = [];
            // First get the acting token (in msg.selected)
            if (actif) {
              activeNames = [getObj('character', actif.charId).get('name')];
            } else {
              if (msg.selected === undefined || msg.selected.length === 0) {
                error("Pas d'allié car pas de token sélectionné", msg);
                return;
              }
              iterSelected(msg.selected, function(personnage) {
                var character = getObj('character', personnage.charId);
                activeNames.push(character.get('name'));
              });
            }
            var toutesEquipes = findObjs({
              _type: 'handout'
            });
            toutesEquipes = toutesEquipes.filter(function(obj) {
              return (obj.get('name').startsWith("Equipe "));
            });
            count += toutesEquipes.length;
            toutesEquipes.forEach(function(equipe) {
              equipe.get('notes', function(note) { //asynchrone
                count--;
                var names = note.split('<br>');
                var allie = names.some(function(n) {
                  return (activeNames.indexOf(n) >= 0);
                });
                if (allie) {
                  //On enlève le token actif, mais seulement pour allies
                  if (cmdSplit[0] == 'allies') {
                    names = names.filter(function(n) {
                      return (activeNames.indexOf(n) < 0);
                    });
                  }
                  var tokens = tokensNamed(names, pageId);
                  tokens.forEach(function(tok) {
                    selection.push({
                      _id: tok.id
                    });
                  });
                }
                if (count === 0) finalCall();
                return;
              });
            }); //end toutesEquipes.forEach
            return;
          case 'self':
            if (actif) {
              selected.push({
                _id: actif.token.id
              });
              return;
            }
            if (msg.selected === undefined) return;
            msg.selected.forEach(function(obj) {
              var inSelf = selected.findIndex(function(o) {
                return (o._id == obj._id);
              });
              if (inSelf < 0) selected.push(obj);
            });
            return;
          case 'target':
            if (cmdSplit.length < 2) {
              error("Il manque l'id de la cible (après --target)", cmd);
              return;
            }
            selected.push({
              _id: cmdSplit[1]
            });
            return;
          case 'disque':
            if (cmdSplit.length < 3) {
              error("Pas assez d'argument pour définir un disque", cmdSplit);
              return;
            }
            var centre = tokenOfId(cmdSplit[1], cmdSplit[1], pageId);
            if (centre === undefined) {
              error("le premier argument du disque n'est pas un token valide", cmdSplit);
              return;
            }
            var rayon = parseInt(cmdSplit[2]);
            if (isNaN(rayon) || rayon < 0) {
              error("Rayon du disque mal défini", cmdSplit);
              return;
            }
            var portee;
            if (cmdSplit.length > 3) {
              portee = parseInt(cmdSplit[3]);
              if (isNaN(portee) || portee < 0) {
                error("La portée du disque est mal formée", cmdSplit);
                return;
              }
              if (actif === undefined) {
                if (msg.selected === undefined || msg.selected.length != 1) {
                  error("Pas de token sélectionné pour calculer la distance du disque", msg);
                  return;
                }
                actif = tokenOfId(msg.selected[0]._id, msg.selected[0]._id, pageId);
              }
              if (distanceCombat(centre.token, actif.token, pageId, true) > portee) {
                sendChar("Le centre de l'effet est placé trop loin (portée " + portee + ")");
                return;
              }
            }
            var allToksDisque =
              findObjs({
                _type: "graphic",
                _pageid: pageId,
                _subtype: "token",
                layer: "objects"
              });
            allToksDisque.forEach(function(obj) {
              if (portee === 0 && obj.id == actif.token.id) return; //on ne se cible pas si le centre de l'aoe est soi-même
              var objCharId = obj.get('represents');
              if (objCharId === '') return;
              if (getState({
                  token: obj,
                  charId: objCharId
                }, 'mort')) return; //pas d'effet aux morts
              if (obj.get('bar1_max') == 0) return; // jshint ignore:line
              var objChar = getObj('character', objCharId);
              if (objChar === undefined) return;
              var distanceCentre = distanceCombat(centre.token, obj, pageId, true);
              if (distanceCentre > rayon) return;
              selected.push({
                _id: obj.id
              });
            });
            if (centre.token.get('bar1_max') == 0) { // jshint ignore:line
              //C'est juste un token utilisé pour définir le disque
              centre.token.remove(); //On l'enlève, normalement plus besoin
              centre = undefined;
            }
            return;
          default:
        }
      });
    }
    if (count === 0) {
      if (selected.length === 0) {
        if (_.has(msg, 'selected')) {
          if (!called) {
            var res = msg.selected.filter(function(sel) {
              var interdit = enleveAuxSelected.find(function(i) {
                return (i._id == sel._id);
              });
              return (interdit === undefined);
            });
            callback(res);
          }
          return;
        }
        if (!called) callback([]);
        return;
      }
      if (!called) finalCall();
      return;
    }
  }


  function pointsDeRecuperation(charId) {
    // retourne les nombre de PR restant
    var pr = 5;
    var x;
    for (var i = 1; i < 6; i++) {
      x = getAttrByName(charId, "PR" + i);
      if (x == 1) pr--;
    }
    return pr;
  }

  function enleverPointDeRecuperation(charId) {
    for (var i = 1; i < 6; i++) {
      var prAttr = findObjs({
        _type: 'attribute',
        _characterid: charId,
        name: "PR" + i
      });
      if (prAttr.length === 0) {
        prAttr = createObj("attribute", {
          characterid: charId,
          name: "PR" + i,
          current: 1,
          max: 1
        });
        return {
          attribute: prAttr,
          current: null
        };
      } else if (prAttr[0].get('current') == 0) { // jshint ignore:line
        prAttr[0].set("current", 1);
        return {
          attribute: prAttr[0],
          current: 0
        };
      }
    }
    sendChat("COF", "Plus de point de récupération à enlever");
  }

  function rajouterPointDeRecuperation(charId) {
    for (var i = 1; i < 6; i++) {
      var prAttr =
        findObjs({
          _type: "attribute",
          _characterid: charId,
          name: "PR" + i
        });
      if (prAttr.length > 0 && prAttr[0].get("current") == 1) {
        prAttr[0].set("current", 0);
        return {
          attribute: prAttr[0],
          current: 1
        };
      }
    }
    log("Pas de point de récupération à récupérer pour " + charId);
  }

  // Récupération pour tous les tokens sélectionnés
  function nuit(msg) {
    if (state.COFantasy.combat) sortirDuCombat();
    var sel;
    if (_.has(msg, "selected")) {
      sel = _.map(msg.selected, function(tokId) {
        return tokId._id;
      });
    } else { //select all token. valid tokens will be filtered by recuperation
      var page = Campaign().get("playerpageid");
      var tokens =
        findObjs({
          t_ype: 'graphic',
          _subtype: 'token',
          layer: 'objects',
          _pageid: page
        });
      sel = _.map(tokens, function(obj) {
        return obj.id;
      });
    }
    recuperation(sel, "nuit");
  }

  // Remise à zéro de toutes les limites journalières
  function jour(evt) {
    var attrs;
    attrs = removeAllAttributes('pressionMortelle', evt);
    attrs = removeAllAttributes('soinsLegers', evt, attrs);
    attrs = removeAllAttributes('soinsModeres', evt, attrs);
    attrs = removeAllAttributes('fortifie', evt, attrs);
    attrs = removeAllAttributes('limiteParJour', evt, attrs);
    attrs = removeAllAttributes('tueurFantasmagorique', evt, attrs);
    removeAllAttributes('baieMagique', evt, attrs);
  }

  function recuperer(msg) {
    if (state.COFantasy.combat) {
      sendChat("", "/w " + msg.who + " impossible de se reposer en combat");
      return;
    }
    if (!_.has(msg, "selected")) {
      sendChat("COF", "/w " + msg.who + " !cof-recuperer sans sélection de tokens");
      log("!cof-recuperer requiert des tokens sélectionnés");
      return;
    }
    var sel = _.map(msg.selected, function(tokId) {
      return tokId._id;
    });
    recuperation(sel, "recuperer");
  }

  function recuperation(selection, option) {
    if (option != "nuit" && option != "recuperer") {
      log("Wrong option " + option + " for recuperation");
      return;
    }
    var evt = {
      type: "recuperation",
      affectes: [],
      attributes: []
    };
    if (option == 'nuit') jour(evt);
    selection.forEach(function(tokId) {
      var token = getObj('graphic', tokId);
      if (token === undefined) return;
      var charId = token.get('represents');
      if (charId === undefined || charId === "") return;
      var perso = {
        token: token,
        charId: charId
      };
      if (getState(perso, 'mort')) return;
      var character = getObj("character", charId);
      var characterName = character.get("name");
      var pr = pointsDeRecuperation(charId);
      var bar2 = parseInt(token.get("bar2_value"));
      var tokEvt = {
        affecte: token,
        prev: {}
      };
      var manaAttr = findObjs({
        _type: 'attribute',
        _characterid: charId,
        name: 'PM'
      });
      var hasMana = false;
      var dmTemp = bar2;
      if (manaAttr.length > 0) { // Récupération des points de mana
        var manaMax = parseInt(manaAttr[0].get('max'));
        hasMana = !isNaN(manaMax) && manaMax > 0;
        if (hasMana) {
          dmTemp = attributeAsInt(perso, 'DMTEMP', 0);
          if (option == 'nuit' && (isNaN(bar2) || bar2 < manaMax)) {
            tokEvt.prev.bar2_value = bar2;
            updateCurrentBar(token, 2, manaMax);
          }
        }
      }
      if (!isNaN(dmTemp) && dmTemp > 0) { // récupération de DM temp
        if (option == "nuit") dmTemp = 0;
        else dmTemp = Math.max(0, dmTemp - 10);
        if (hasMana) {
          setTokenAttr(perso, 'DMTEMP', dmTemp, evt);
        } else {
          tokEvt.prev.bar2_value = bar2;
          updateCurrentBar(token, 2, dmTemp);
        }
      }
      var dVie = charAttributeAsInt(charId, "DV", 0);
      if (dVie < 4) {
        if (tokEvt.prev != {}) evt.affectes.push(tokEvt);
        return; //Si pas de dé de vie, alors pas de PR.
      }
      var message;
      if (option == "nuit" && pr < 5) { // on récupère un PR
        var affAttr = rajouterPointDeRecuperation(charId);
        if (affAttr === undefined) {
          error("Pas de point de récupérartion à rajouter et pourtant pas au max", token);
          return;
        }
        evt.attributes.push(affAttr);
        evt.affectes.push(tokEvt);
        message =
          "Au cours de la nuit, les points de récupération de " + characterName +
          " passent de " + pr + " à " + (pr + 1);
        sendChat("", message);
        return;
      }
      var bar1 = parseInt(token.get("bar1_value"));
      var pvmax = parseInt(token.get("bar1_max"));
      if (isNaN(bar1) || isNaN(pvmax)) return;
      if (bar1 >= pvmax) {
        if (option == "recuperer") {
          sendChat("", characterName + " n'a pas besoin de repos");
        }
        return;
      }
      if (option == "recuperer") {
        if (pr === 0) { //pas possible de récupérer
          message = characterName + " a besoin d'une nuite complète pour récupérer";
          sendChat("", message);
          return;
        } else { //dépense d'un PR
          evt.attributes.push(enleverPointDeRecuperation(charId));
          pr--;
        }
      }
      var conMod = modCarac(charId, 'CONSTITUTION');
      var niveau = charAttributeAsInt(charId, 'NIVEAU', 1);
      var rollExpr = addOrigin(characterName, "[[1d" + dVie + "]]");
      sendChat("COF", rollExpr, function(res) {
        var rolls = res[0];
        var dVieRoll = rolls.inlinerolls[0].results.total;
        var bonus = conMod + niveau;
        var total = dVieRoll + bonus;
        if (total < 0) total = 0;
        tokEvt.prev.bar1_value = bar1;
        evt.affectes.push(tokEvt);
        bar1 += total;
        if (bar1 > pvmax) bar1 = pvmax;
        updateCurrentBar(token, 1, bar1);
        if (option == "nuit") {
          message = "Au cours de la nuit, ";
        } else {
          message = "Après une dizaine de minutes de repos, ";
        }
        message +=
          characterName + " récupère " + buildinline(rolls.inlinerolls[0]) + "+" + bonus + " PV. Il lui reste " + pr + " points de récupération";
        sendChat("", "/direct " + message);
      });
    });
    addEvent(evt);
  }

  function iterSelected(selected, iter, callback) {
    selected.forEach(function(sel) {
      var token = getObj('graphic', sel._id);
      if (token === undefined) {
        if (callback !== undefined) callback();
        return;
      }
      var charId = token.get('represents');
      if (charId === undefined || charId === "") {
        if (callback !== undefined) callback();
        return;
      }
      iter({
        token: token,
        charId: charId
      });
    });
  }

  function recharger(msg) {
    if (!_.has(msg, "selected")) {
      sendChat("COF", "/w " + msg.who + " !cof-recharger sans sélection de tokens");
      log("!cof-recharger requiert des tokens sélectionnés");
      return;
    }
    var cmd = msg.content.split(" ");
    if (cmd.length < 2) {
      error("La fonction !cof-recharger attend au moins un argument", msg);
      return;
    }
    var attackLabel = cmd[1];
    var evt = {
      type: 'recharger',
      attributes: []
    };
    iterSelected(msg.selected, function(perso) {
      var name = perso.token.get('name');
      var attrs =
        findObjs({
          _type: 'attribute',
          _characterid: perso.charId,
          name: "charge_" + attackLabel
        });
      if (attrs.length < 1) {
        log("Personnage " + name + " sans charge " + attackLabel);
        return;
      }
      attrs = attrs[0];
      var att = getAttack(attackLabel, name, perso.charId);
      if (att === undefined) {
        //  error("Arme "+attackLabel+" n'existe pas pour "+name, charId);
        return;
      }
      var weaponName = att.weaponName;
      var maxCharge = parseInt(attrs.get('max'));
      if (isNaN(maxCharge)) {
        error("max charge mal formée", attrs);
        return;
      }
      var currentCharge = parseInt(attrs.get('current'));
      if (isNaN(currentCharge)) {
        error("charge mal formée", attrs);
        return;
      }
      if (currentCharge < maxCharge) {
        evt.attributes.push({
          attribute: attrs,
          current: currentCharge
        });
        attrs.set('current', currentCharge + 1);
        updateNextInit(perso.token);
        sendChar(perso.charId, "recharge " + weaponName);
        return;
      }
      sendChar(perso.charId, "a déjà tous ses " + weaponName + " chargés");
    });
    addEvent(evt);
  }

  function chance(msg) {
    if (!_.has(msg, "selected")) {
      sendChat("COF", "/w " + msg.who + " !cof-chance sans sélection de token");
      log("!cof-chance requiert de sélectionner un token");
      return;
    } else if (msg.selected.length != 1) {
      sendChat("COF", "/w " + msg.who + " !cof-chance ne doit selectionner qu'un token");
      log("!cof-chance requiert de sélectionner exactement un token");
      return;
    }
    var cmd = msg.content.split(" ");
    if (cmd.length < 2 || (cmd[1] != "combat" && cmd[1] != "autre")) {
      error("La fonction !cof-chance attend au moins un argument (combat ou autre)", msg);
      return;
    }
    var tokenId = msg.selected[0]._id;
    var perso = tokenOfId(tokenId);
    var token = getObj('graphic', tokenId);
    if (perso === undefined) {
      error(" !cof-chance ne fonctionne qu'avec des tokens qui représentent des personnages", perso);
      return;
    }
    var name = perso.token.get('name');
    var attaque;
    if (cmd[1] == 'combat') { //further checks
      var lastAct = lastEvent();
      if (lastAct !== undefined) {
        if (lastAct.type == 'Attaque' && lastAct.succes === false) {
          attaque = lastAct.action;
        }
      }
      if (attaque === undefined ||
        attaque.attaquant.token.id != tokenId) {
        error("Pas de dernière action de combat ratée trouvée pour " + name, attaque);
        return;
      }
    }
    var chance = attributeAsInt(perso, 'PC', 0);
    if (chance <= 0) {
      sendChat("", name + " n'a plus de point de chance à dépenser...");
      return;
    }
    var evt = {
      type: 'chance'
    };
    chance--;
    setTokenAttr(perso, 'PC', chance, evt,
      " a dépensé un point de chance. Il lui en reste " + chance);
    switch (cmd[1]) {
      case 'autre':
        addEvent(evt);
        return;
      case 'combat':
        chanceCombat(perso, attaque, evt);
        return;
      default:
        error("argument de chance inconnu", cmd);
        addEvent(evt);
        return;
    }
  }

  function chanceCombat(perso, a, evt) {
    // first undo the failure
    undoEvent();
    // then re-attack with bonus
    var options = a.options;
    options.chance = (options.chance + 10) || 10;
    options.rollsAttack = a.rollsAttack;
    options.evt = evt;
    attack(a.player_id, perso, a, a.attack_label, options);
  }

  function intercepter(msg) {
    getSelected(msg, function(selected) {
      iterSelected(selected, function(cible) {
        var charId = cible.charId;
        var character = getObj('character', charId);
        if (character === undefined) {
          error("L'argument de !cof-intercepter n'est pas une id de token valide (personnage non défini)", msg.content);
          return;
        }
        cible.tokName = cible.token.get('name');
        cible.name = character.get('name');
        if (attributeAsBool(cible, 'intercepter')) {
          sendChar(charId, " a déjà intercepté une attaque ce tour");
          return;
        }
        var voieMeneur = charAttributeAsInt(charId, "voieDuMeneurDHomme", 0);
        if (voieMeneur < 2) {
          error(cible.tokName + " n'a pas un rang suffisant dans la voie du meneur d'homme pour intercepter l'attaque", voieMeneur);
          return;
        }
        var attaque;
        var lastAct = lastEvent();
        if (lastAct !== undefined) {
          attaque = lastAct.action;
        }
        if (attaque === undefined) {
          sendChar(charId, "la dernière action trouvée n'est pas une attaque, impossible d'intercepter");
          return;
        }
        if (attaque.cibles.length === 0) {
          sendChar(charId, "la dernière attaque n'a touché aucune cible, impossible d'intercepter");
          return;
        }
        if (attaque.cibles.length > 1) {
          sendChar(charId, "la dernière attaque a touché plus d'une cible, impossible d'intercepter");
          return;
        }
        var targetName = attaque.cibles[0].tokName;
        if (targetName === undefined) {
          error("Le token de la dernière attaque est indéfini", attaque);
          return;
        }
        if (distanceCombat(cible.token, attaque.cibles[0].token) > 0) {
          sendChar(charId, " est trop loin de " + targetName + " pour intercepter l'attaque");
          return;
        }
        var evt = {
          type: 'interception'
        };
        setTokenAttr(cible, 'intercepter', true, evt,
          "se met devant " + targetName + " pour intercepter l'attaque !");
        // On annule l'ancienne action
        undoEvent();
        // Puis on refait en changeant la cible
        var options = attaque.options;
        options.intercepter = voieMeneur;
        options.rollsAttack = attaque.rollsAttack;
        options.rollsDmg = attaque.rollsDmg;
        options.evt = evt;
        cible.rollsDamg = attaque.cibles[0].rollsDmg;
        attack(attaque.player_id, attaque.attaquant, {
          cibles: [cible]
        }, attaque.attack_label, options);
      });
    });
  }

  function exemplaire(msg) {
    getSelected(msg, function(selected) {
      iterSelected(selected, function(cible) {
        var charId = cible.charId;
        if (attributeAsBool(cible, 'exemplaire')) {
          sendChar(charId, " a déjà montré l'exemple à ce tour");
          return;
        }
        var attaque;
        var lastAct = lastEvent();
        if (lastAct !== undefined) {
          if (lastAct.type == 'Attaque' && lastAct.succes === false) {
            attaque = lastAct.action;
          }
        }
        if (attaque === undefined) {
          sendChar(charId, "la dernière action trouvée n'est pas une attaque ratée, impossible de montrer l'exemple");
          return;
        }
        var attackerName = attaque.attaquant.token.get('name');
        if (attackerName === undefined) {
          error("Le token de la dernière attaque est indéfini", attaque);
          return;
        }
        var evt = {
          type: "Montrer l'exemple"
        };
        setTokenAttr(cible, 'exemplaire', true, evt,
          "montre l'exemple à " + attackerName);
        // On annule l'ancienne action
        undoEvent();
        // Puis on refait 
        var options = attaque.options;
        options.evt = evt;
        attack(attaque.player_id, attaque.attaquant, attaque, attaque.attack_label, options);
      });
    });
  }

  function surprise(msg) {
    getSelected(msg, function(selected) {
      if (selected.length === 0) {
        sendChat("COF", "/w " + msg.who + " !cof-surprise sans sélection de token");
        log("!cof-surprise requiert de sélectionner des tokens");
        return;
      }
      var cmd = msg.content.split(" ");
      var testSurprise;
      if (cmd.length > 1) {
        testSurprise = parseInt(cmd[1]);
        if (isNaN(testSurprise)) testSurprise = undefined;
      }
      var display;
      if (testSurprise === undefined) {
        display = startFramedDisplay(msg.playerid, "<b>Surprise !</b>");
      } else {
        display = startFramedDisplay(msg.playerid, "Test de surprise difficulté " + testSurprise);
      }
      var evt = {
        type: 'surprise',
        affectes: []
      };
      var tokensToProcess = selected.length;
      var sendEvent = function() {
        if (tokensToProcess == 1) {
          addEvent(evt);
          sendChat("", endFramedDisplay(display));
        }
        tokensToProcess--;
      };
      iterSelected(selected, function(perso) {
        if (!isActive(perso)) {
          sendEvent();
          return;
        }
        var name = perso.token.get('name');
        if (testSurprise !== undefined) {
          var bonusSurprise = 0;
          if (surveillance(perso)) bonusSurprise += 5;
          testCaracteristique(perso, 'SAG', ['vigilance', 'perception'], testSurprise, bonusSurprise, evt,
            function(reussite, rolltext) {
              var result;
              if (reussite) result = "réussi";
              else {
                result = "raté, " + name + " est surpris";
                result += eForFemale(perso.charId);
                setState(perso, 'surpris', true, evt);
              }
              var message = name + " fait " + rolltext + " : " + result;
              addLineToFramedDisplay(display, message);
              sendEvent();
            });
        } else { //no test
          setState(perso, 'surpris', true, evt);
          addLineToFramedDisplay(display, name + " est surpris." + eForFemale(perso.charId));
          sendEvent();
        }
      }, sendEvent);
    });
  }

  function isActive(perso) {
    var inactif =
      getState(perso, 'mort') || getState(perso, 'surpris') ||
      getState(perso, 'assome') || getState(perso, 'etourdi') ||
      getState(perso, 'paralyse') || getState(perso, 'endormi') ||
      getState(perso, 'apeure');
    return !inactif;
  }

  function interchangeable(attackingToken, target, pageId) { //détermine si il y a assez de tokens 
    var token = target.token;
    var charId = target.charId;
    var res = {
      result: false,
      targets: []
    };
    if (!isActive(target)) return res;
    var meuteAttr =
      findObjs({
        _type: 'attribute',
        _characterid: charId,
        name: 'interchangeable'
      });
    if (meuteAttr.length < 1) return res;
    meuteAttr = parseInt(meuteAttr[0].get('current'));
    if (isNaN(meuteAttr) || meuteAttr <= 0) return res;
    var tokens = findObjs({
      _type: 'graphic',
      _subtype: 'token',
      represents: charId,
      _pageid: pageId
    });
    tokens = tokens.filter(function(tok) {
      return isActive({
        token: tok
      });
    });
    res.result = (tokens.length > meuteAttr);
    // Now select the tokens which could be valid targets
    var p = distanceCombat(attackingToken, token);
    if (p === 0) { //cible au contact, on garde toutes celles au contact
      res.targets = tokens.filter(function(tok) {
        var d = distanceCombat(attackingToken, tok);
        return (d === 0);
      });
    } else { // cible à distance, on garde celles au contact de la cible
      res.targets = tokens.filter(function(tok) {
        var d = distanceCombat(token, tok);
        return (d === 0);
      });
    }
    return res;
  }

  function setActiveToken(tokenId, evt) {
    evt.affectes = evt.affectes || [];
    var pageId = Campaign().get('initiativepage');
    if (state.COFantasy.activeTokenId) {
      if (tokenId == state.COFantasy.activeTokenId) return;
      var prevToken = getObj('graphic', state.COFantasy.activeTokenId);
      if (prevToken) {
        evt.affectes.push({
          affecte: prevToken,
          prev: {
            statusmarkers: prevToken.get('statusmarkers')
          }
        });
        prevToken.set('status_flying-flag', false);
      } else {
        if (pageId) {
          prevToken = findObjs({
            _type: 'graphic',
            _subtype: 'token',
            layer: 'objects',
            _pageid: pageId,
            name: state.COFantasy.activeTokenName
          });
        } else {
          prevToken = findObjs({
            _type: 'graphic',
            _subtype: 'token',
            layer: 'objects',
            name: state.COFantasy.activeTokenName
          });
        }
        prevToken.forEach(function(o) {
          evt.affectes.push({
            affecte: o,
            prev: {
              statusmarkers: o.get('statusmarkers')
            }
          });
          o.set('status_flying-flag', false);
        });
      }
    }
    if (tokenId) {
      var act = tokenOfId(tokenId, tokenId);
      if (act) {
        var token = act.token;
        var charId = act.charId;
        evt.affectes.push({
          affecte: token,
          prev: {
            statusmarkers: token.get('statusmarkers')
          }
        });
        token.set('status_flying-flag', true);
        state.COFantasy.activeTokenId = tokenId;
        state.COFantasy.activeTokenName = token.get('name');
        // Gestion de la confusion
        if (attributeAsBool(act, "confusion")) {
          //Une chance sur deux de ne pas agir
          if (randomInteger(2) < 2) {
            sendChar(charId, "est en pleine confusion. Il ne fait rien ce tour");
            token.set('status_flying-flag', false);
          } else {
            //Trouver la créature la plus proche
            var closestToken;
            pageId = token.get('pageid');
            var toksOnPage = findObjs({
              _type: 'graphic',
              _subtype: 'token',
              _pageid: pageId,
              layer: 'objects'
            });
            toksOnPage.forEach(function(tok) {
              if (tok.id == tokenId) return;
              var perso = {
                token: tok
              };
              perso.charId = tok.get('represents');
              if (perso.charId === '') return;
              if (getState(perso, 'mort')) return;
              var dist = distanceCombat(token, tok, pageId);
              if (closestToken) {
                if (dist > closestToken.distance) return;
                if (dist < closestToken.distance) {
                  closestToken = {
                    distance: dist,
                    names: [tok.get('name')]
                  };
                  return;
                }
                closestToken.names.push(tok.get('name'));
                return;
              }
              closestToken = {
                distance: dist,
                names: [tok.get('name')]
              };
            });
            if (closestToken) {
              var r = randomInteger(closestToken.names.length) - 1;
              sendChar(charId,
                "est en pleine confusion. " + onGenre(charId, 'Il', 'Elle') +
                " attaque " + closestToken.names[r] + ".");
            } else {
              sendChar(charId, "est seul et en plein confusion");
            }
          }
        }
        //On enlève aussi les états qui ne durent qu'un tour
        var defenseTotale = tokenAttribute(act, 'defenseTotale');
        if (defenseTotale.length > 0) {
          defenseTotale = defenseTotale[0];
          var tourDefTotale = defenseTotale.get('max');
          if (tourDefTotale < state.COFantasy.tour) {
            evt.deletedAttributes = evt.deletedAttributes || [];
            evt.deletedAttributes.push(defenseTotale);
            defenseTotale.remove();
          }
        }
      } else {
        error("Impossible de trouver le token dont c'est le tour", tokenId);
        state.COFantasy.activeTokenId = undefined;
      }
    }
  }

  function getTurnOrder(evt) {
    var turnOrder = Campaign().get('turnorder');
    evt.turnorder = evt.turnorder || turnOrder;
    if (turnOrder === "") {
      turnOrder = [{
        id: "-1",
        pr: 1,
        custom: "Tour",
        formula: "+1"
      }];
      evt.tour = state.COFantasy.tour;
      state.COFantasy.tour = 1;
    } else {
      turnOrder = JSON.parse(turnOrder);
    }
    var indexTour = turnOrder.findIndex(function(elt) {
      return (elt.id == "-1" && elt.custom == "Tour");
    });
    if (indexTour == -1) {
      indexTour = turnOrder.length;
      turnOrder.push({
        id: "-1",
        pr: 1,
        custom: "Tour",
        formula: "+1"
      });
      evt.tour = state.COFantasy.tour;
      state.COFantasy.tour = 1;
    }
    var res = {
      tour: turnOrder[indexTour],
      pasAgi: turnOrder.slice(0, indexTour),
      dejaAgi: turnOrder.slice(indexTour + 1, turnOrder.length)
    };
    return res;
  }

  function initiative(selected, evt) { //set initiative for selected tokens
    // Always called when entering combat mode
    // set the initiative counter, if not yet set
    // Assumption: all tokens that have not acted yet are those before the turn 
    // counter.
    // When initiative for token not present, assumes it has not acted
    // When present, stays in same group, but update position according to
    // current initiative.
    // Tokens appearing before the turn are sorted
    if (!Campaign().get('initiativepage')) evt.initiativepage = false;
    if (!state.COFantasy.combat) { //actions de début de combat
      evt.combat = false;
      evt.combat_pageid = state.COFantasy.combat_pageid;
      state.COFantasy.combat = true;
      Campaign().set({
        turnorder: JSON.stringify([{
          id: "-1",
          pr: 1,
          custom: "Tour",
          formula: "+1"
        }]),
        initiativepage: true
      });
      evt.tour = state.COFantasy.tour;
      state.COFantasy.tour = 1;
      evt.init = state.COFantasy.init;
      state.COFantasy.init = 1000;
      removeAllAttributes('transeDeGuérison', evt);
    }
    if (!Campaign().get('initiativepage')) {
      Campaign().set('initiativepage', true);
    }
    var to = getTurnOrder(evt);
    if (to.pasAgi.length === 0) { // Fin de tour, on met le tour à la fin et on retrie
      to.pasAgi = to.dejaAgi;
      to.dejaAgi = [];
    }
    iterSelected(selected, function(perso) {
      state.COFantasy.combat_pageid = perso.token.get('pageid');
      if (!isActive(perso)) return;
      var init = tokenInit(perso, evt);
      // On place le token à sa place dans la liste du tour
      var dejaIndex =
        to.dejaAgi.findIndex(function(elt) {
          return (elt.id == perso.token.id);
        });
      if (dejaIndex == -1) {
        to.pasAgi =
          to.pasAgi.filter(function(elt) {
            return (elt.id != perso.token.id);
          });
        to.pasAgi.push({
          id: perso.token.id,
          pr: init,
          custom: ''
        });
      } else {
        to.dejaAgi[dejaIndex].pr = init;
      }
    });
    setTurnOrder(to, evt);
  }

  function setTurnOrder(to, evt) {
    if (to.pasAgi.length > 0) {
      to.pasAgi.sort(function(a, b) {
        if (a.id == "-1") return 1;
        if (b.id == "-1") return -1;
        if (a.pr < b.pr) return 1;
        if (b.pr < a.pr) return -1;
        // Priorité aux joueurs
        // Premier critère : la barre de PV des joueurs ets liée
        var tokenA = getObj('graphic', a.id);
        if (tokenA === undefined) return 1;
        var tokenB = getObj('graphic', b.id);
        if (tokenB === undefined) return -1;
        if (tokenA.get('bar1_link') === '') {
          if (tokenB.get('bar1_link') === '') return 0;
          return 1;
        }
        if (tokenB.get('bar1_link') === '') return -1;
        // Deuxième critère : les joueurs ont un DV
        var charIdA = tokenA.get('represents');
        if (charIdA === '') return 1;
        var charIdB = tokenB.get('represents');
        if (charIdB === '') return -1;
        var dvA = charAttributeAsInt(charIdA, "DV", 0);
        var dvB = charAttributeAsInt(charIdB, "DV", 0);
        if (dvA === 0) {
          if (dvB === 0) return 0;
          return 1;
        }
        if (dvB === 0) return -1;
        //Entre joueurs, priorité à la plus grosse sagesse
        var sagA = charAttributeAsInt(charIdA, 'SAGESSE', 10);
        var sagB = charAttributeAsInt(charIdB, 'SAGESSE', 10);
        if (sagA < sagB) return 1;
        if (sagB > sagA) return -1;
        return 0;
      });
      setActiveToken(to.pasAgi[0].id, evt);
    }
    to.pasAgi.push(to.tour);
    var turnOrder = to.pasAgi.concat(to.dejaAgi);
    Campaign().set('turnorder', JSON.stringify(turnOrder));
  }

  function attendreInit(msg) {
    if (!_.has(msg, 'selected')) {
      error("La fonction !cof-attendre : rien à faire, pas de token selectionné", msg);
      return;
    }
    var cmd = msg.content.split(' ');
    if (cmd.length < 2) {
      error("Attendre jusqu'à quelle initiative ?", cmd);
      return;
    }
    var newInit = parseInt(cmd[1]);
    if (isNaN(newInit) || newInit < 1) {
      error("On ne peut attendre que jusqu'à une initiative de 1", cmd);
      newInit = 1;
    }
    var evt = {
      type: "attente"
    };
    var to = getTurnOrder(evt);
    iterSelected(msg.selected, function(perso) {
      var charId = perso.charId;
      var token = perso.token;
      if (!isActive(perso)) return;
      var tokenPos =
        to.pasAgi.findIndex(function(elt) {
          return (elt.id == token.id);
        });
      if (tokenPos == -1) { // token ne peut plus agir
        sendChar(charId, " a déjà agit ce tour");
        return;
      }
      if (newInit < to.pasAgi[tokenPos].pr) {
        to.pasAgi[tokenPos].pr = newInit;
        sendChar(charId, " attend un peu avant d'agir...");
        updateNextInit(token);
      } else {
        sendChar(charId, " a déjà une initiative inférieure à " + newInit);
      }
    });
    setTurnOrder(to, evt);
    addEvent(evt);
  }

  function containsEffectStartingWith(allAttrs, effet) {
    return (allAttrs.findIndex(function(attr) {
      return (attr.get('name').startsWith(effet + '_'));
    }) >= 0);
  }

  function statut(msg) { // show some character informations
    if (!_.has(msg, 'selected')) {
      error("Dans !cof-status : rien à faire, pas de token selectionné", msg);
      return;
    }
    var playerId = msg.playerid;
    iterSelected(msg.selected, function(perso) {
      var token = perso.token;
      var charId = perso.charId;
      var name = token.get('name');
      var display = startFramedDisplay(playerId, "État de " + name, perso);
      var line =
        "Points de vie    : " + token.get('bar1_value') + " / " +
        getAttrByName(charId, 'PV', 'max');
      addLineToFramedDisplay(display, line);
      var manaAttr = findObjs({
        _type: 'attribute',
        _characterid: charId,
        name: 'PM'
      });
      var hasMana = false;
      if (manaAttr.length > 0) {
        var manaMax = parseInt(manaAttr[0].get('max'));
        hasMana = !isNaN(manaMax) && manaMax > 0;
      }
      var dmTemp = parseInt(token.get('bar2_value'));
      if (hasMana) {
        var mana = dmTemp;
        if (token.get('bar1_link') !== "") mana = manaAttr[0].get('current');
        line = "Points de mana   : " + mana + " / " + manaAttr[0].get('max');
        addLineToFramedDisplay(display, line);
        dmTemp = attributeAsInt(perso, 'DMTEMP', 0);
      } else if (token.get('bar1_link') !== "") {
        dmTemp = charAttributeAsInt(charId, 'DMTEMP', 0);
      }
      if (!isNaN(dmTemp) && dmTemp > 0) {
        line = "Dommages temporaires : " + dmTemp;
        addLineToFramedDisplay(display, line);
      }
      var aDV = charAttributeAsInt(charId, 'DV', 0);
      if (aDV > 0) { // correspond aux PJs
        line =
          "Points de récupération : " + pointsDeRecuperation(charId) + " / 5";
        addLineToFramedDisplay(display, line);
        line =
          "Points de chance : " + getAttrByName(charId, 'PC') + " / " +
          (3 + modCarac(charId, 'CHARISME'));
        addLineToFramedDisplay(display, line);
        var pacifisme =
          findObjs({
            _type: "attribute",
            _characterid: charId,
            name: "pacifisme"
          });
        if (pacifisme.length > 0) {
          pacifisme = parseInt(pacifisme[0].get('current'));
          if (!isNaN(pacifisme)) {
            if (pacifisme > 0) addLineToFramedDisplay(display, "Pacifisme actif");
            else addLineToFramedDisplay(display, "Pacifisme non actif");
          }
        }
      }
      var attrsChar = findObjs({
        _type: 'attribute',
        _characterid: charId
      });
      var attrsArmes = attrsChar.filter(function(attr) {
        var attrName = attr.get('name');
        return (attrName.startsWith("repeating_armes_") &&
          attrName.endsWith("_armenom"));
      });
      attrsArmes.forEach(function(attr) {
        var nomArme = attr.get('current');
        var armeLabel = nomArme.split(' ', 1)[0];
        nomArme = nomArme.substring(nomArme.indexOf(' ') + 1);
        var charge = attrsChar.find(function(a) {
          return (a.get('name') == 'charge_' + armeLabel);
        });
        if (charge) {
          charge = parseInt(charge.get('current'));
          if (!isNaN(charge)) {
            if (charge === 0) {
              line = nomArme + " n'est pas chargé";
            } else if (charge == 1) {
              line = nomArme + " est chargé";
            } else if (charge > 1) {
              line = nomArme + " contient encore " + charge + " charges";
            }
            var enMain =
              findObjs({
                _type: "attribute",
                _characterid: charId,
                name: "initEnMain" + armeLabel
              });
            if (enMain.length > 0) {
              enMain = parseInt(enMain[0].get('current'));
              if (!isNaN(enMain)) {
                if (enMain === 0) line += ", pas en main";
                else if (enMain > 0) line += " et en main";
              }
            }
            addLineToFramedDisplay(display, line);
          }
        }
        if (attributeAsBool(perso, 'poisonRapide_' + armeLabel)) {
          addLineToFramedDisplay(display, nomArme + " est enduit de poison.");
        }
      });
      if (attributeAsInt(perso, 'enflamme', 0))
        addLineToFramedDisplay(display, "en flammes");
      var bufDef = attributeAsInt(perso, 'bufDEF', 0);
      if (bufDef > 0)
        addLineToFramedDisplay(display, "Défense temporairement modifiée de " + bufDef);
      for (var etat in cof_states) {
        if (getState(perso, etat))
          addLineToFramedDisplay(display, etat + eForFemale(charId));
      }
      if (charAttributeAsInt(charId, 'DEFARMUREON', 1) === 0) {
        addLineToFramedDisplay(display, "Ne porte pas son armure");
        if (charAttributeAsInt(charId, 'vetementsSacres', 0) > 0)
          addLineToFramedDisplay(display, "  mais bénéficie de ses vêtements sacrés");
        if (charAttributeAsInt(charId, 'armureDeVent', 0) > 0)
          addLineToFramedDisplay(display, "  mais bénéficie de son armure de vent");
      }
      if (charAttributeAsInt(charId, 'DEFBOUCLIERON', 1) === 0)
        addLineToFramedDisplay(display, "Ne porte pas son bouclier");
      var allAttrs = findObjs({
        _type: 'attribute',
        _characterid: charId
      });
      for (var effet in messageEffetTemp) {
        var effetActif = false;
        if (effet == 'forgeron' || effet == 'dmgArme1d6') {
          effetActif = containsEffectStartingWith(allAttrs, effet);
        } else effetActif = attributeAsBool(perso, effet);
        if (effetActif)
          addLineToFramedDisplay(display, messageEffetTemp[effet].actif);
      }
      for (var effetC in messageEffetCombat) {
        if (attributeAsBool(perso, effetC))
          addLineToFramedDisplay(display, messageEffetCombat[effetC].actif);
      }
      for (var effetI in messageEffetIndetermine) {
        if (attributeAsBool(perso, effetI))
          addLineToFramedDisplay(display, messageEffetIndetermine[effetI].actif);
      }
      allAttributesNamed(attrsChar, 'munition').forEach(function(attr) {
        var attrName = attr.get('name');
        var underscore = attrName.indexOf('_');
        if (underscore < 0 || underscore == attrName.length - 1) return;
        var munitionNom = attrName.substring(underscore + 1).replace(/_/g, ' ');
        addLineToFramedDisplay(display, munitionNom + " : " + attr.get('current') + " / " + attr.get('max'));
      });
      var attrPosture = tokenAttribute(perso, 'postureDeCombat');
      if (attrPosture.length > 0) {
        attrPosture = attrPosture[0];
        var posture = attrPosture.get('max');
        var postureMsg = "a une posture ";
        switch (posture.substr(-1, 3)) {
          case 'DEF':
            msg += "défensive";
            break;
          case 'ATT':
            msg += "offensive";
            break;
          case '_DM':
            msg += "puissante";
            break;
          default:
        }
        msg += " mais ";
        switch (posture.substr(0, 3)) {
          case 'DEF':
            msg += "risquée";
            break;
          case 'ATT':
            msg += "moins précise";
            break;
          case 'DM_':
            msg += "moins puissante";
            break;
          default:
        }
        addLineToFramedDisplay(display, posture);
      }
      sendChat("", endFramedDisplay(display));
    });
  }

  function removeFromTurnTracker(tokenId, evt) {
    var turnOrder = Campaign().get('turnorder');
    if (turnOrder === "" || !state.COFantasy.combat) {
      return;
    }
    evt.turnorder = evt.turnorder || turnOrder;
    turnOrder = JSON.parse(turnOrder).filter(
      function(elt) {
        return (elt.id != tokenId);
      });
    Campaign().set('turnorder', JSON.stringify(turnOrder));
  }

  function updateCurrentBar(token, barNumber, val) {
    var attrId = token.get("bar" + barNumber + "_link");
    if (attrId === "") {
      token.set("bar" + barNumber + "_value", val);
      return;
    }
    var attr = getObj('attribute', attrId);
    attr.set('current', val);
    return;
  }

  function eForFemale(charId) {
    return onGenre(charId, '', 'e');
  }

  function onGenre(charId, male, female) {
    var sex = getAttrByName(charId, 'SEXE');
    if (sex.startsWith('F')) return female;
    return male;
  }

  function setTokenAttr(personnage, attribute, value, evt, msg, maxval) {
    var charId = personnage.charId;
    var token = personnage.token;
    if (msg !== undefined) {
      sendChar(charId, msg);
    }
    evt.attributes = evt.attributes || [];
    var agrandir = false;
    if (attribute == 'agrandissement' && token) agrandir = true;
    // check if the token is linked to the character. If not, use token name
    // in attribute name (token ids don't persist over API reload)
    if (token) {
      var link = token.get('bar1_link');
      if (link === "") attribute += "_" + token.get('name');
    }
    var attr = findObjs({
      _type: 'attribute',
      _characterid: charId,
      name: attribute
    });
    if (attr.length === 0) {
      if (maxval === undefined) maxval = '';
      attr = createObj('attribute', {
        characterid: charId,
        name: attribute,
        current: value,
        max: maxval
      });
      evt.attributes.push({
        attribute: attr,
        current: null
      });
      if (agrandir) {
        var width = token.get('width');
        var height = token.get('height');
        evt.affectes = evt.affectes || [];
        evt.affectes.push({
          affecte: token,
          prev: {
            width: width,
            height: height
          }
        });
        width += width / 2;
        height += height / 2;
        token.set('width', width);
        token.set('height', height);
      }
      return;
    }
    attr = attr[0];
    evt.attributes.push({
      attribute: attr,
      current: attr.get('current'),
      max: attr.get('max')
    });
    attr.set('current', value);
    if (maxval !== undefined) attr.set('max', maxval);
  }

  function setAttr(selected, attribute, value, evt, msg, maxval) {
    if (selected === undefined || selected.length === 0) return [];
    iterSelected(selected, function(perso) {
      setTokenAttr(perso, attribute, value, evt, msg, maxval);
    });
  }

  // evt et msg peuvent être undefined
  function removeTokenAttr(personnage, attribute, evt, msg) {
    var charId = personnage.charId;
    var token = personnage.token;
    if (msg !== undefined) {
      sendChar(charId, msg);
    }
    // check if the token is linked to the character. If not, use token name
    // in attribute name (token ids don't persist over API reload)
    if (token) {
      var link = token.get('bar1_link');
      if (link === '') attribute += "_" + token.get('name');
    }
    var attr = findObjs({
      _type: 'attribute',
      _characterid: charId,
      name: attribute
    });
    if (attr.length === 0) return;
    attr = attr[0];
    if (evt) {
      evt.deletedAttributes = evt.deletedAttributes || [];
      evt.deletedAttributes.push(attr);
    }
    attr.remove();
  }

  function removeAttr(selected, attribute, evt, msg) {
    if (selected === undefined || selected.length === 0) return [];
    iterSelected(selected, function(perso) {
      removeTokenAttr(perso, attribute, evt, msg);
    });
  }

  function tokenAttribute(personnage, name) {
    var token = personnage.token;
    if (token) {
      var link = token.get('bar1_link');
      if (link === "") name += "_" + token.get('name');
    }
    return findObjs({
      _type: 'attribute',
      _characterid: personnage.charId,
      name: name
    });
  }

  // Caution : does not work with repeating attributes!!!!
  // Caution not to use token when the attribute should not be token dependant
  function attributeAsInt(personnage, name, def) {
    var attr = tokenAttribute(personnage, name);
    if (attr.length === 0) return def;
    attr = parseInt(attr[0].get('current'));
    if (isNaN(attr)) return def;
    return attr;
  }

  function charAttributeAsInt(charId, name, def) {
    var perso = {
      charId: charId
    };
    if (charId.charId) perso.charId = charId.charId;
    return attributeAsInt(perso, name, def);
  }

  function attributeAsBool(personnage, name) {
    var attr = tokenAttribute(personnage, name);
    if (attr.length === 0) return false;
    attr = attr[0].get('current');
    if (attr == 'true') return true;
    if (attr === 'false' || attr === false) return false;
    return true;
  }

  function charAttributeAsBool(charId, name) {
    var perso = {
      charId: charId
    };
    if (charId.charId) perso.charId = charId.charId;
    return attributeAsBool(perso, name);
  }

  function armureMagique(msg) {
    msg.content += " armureMagique";
    effetCombat(msg);
  }

  function bufDef(msg) {
    var cmd = msg.content.split(' ');
    if (cmd.length < 2) {
      error("La fonction !cof-buf-def attend un argument", cmd);
      return;
    }
    var buf = parseInt(cmd[1]);
    if (isNaN(buf)) {
      error("Argument de !cof-bu-def invalide", cmd);
      return;
    }
    if (buf === 0) return;
    var message = "";
    if (buf > 0) message = "voit sa défense augmenter";
    else message = "voit sa défense baisser";
    var evt = {
      type: 'other'
    };
    getSelected(msg, function(selected) {
      setAttr(selected, 'bufDEF', buf, evt, message);
      if (evt.attributes.length === 0) {
        error("Pas de cible valide sélectionnée pour !cod-buf-def", msg);
        return;
      }
      addEvent(evt);
    });
  }

  function removeBufDef(msg) {
    var evt = {
      type: 'other'
    };
    getSelected(msg, function(selected) {
      removeAttr(selected, 'bufDEF', evt, "retrouve sa défense normale");
      if (evt.deletedAttributes.length === 0) {
        error("Pas de cible valide sélectionnée pour !cod-remove-buf-def", msg);
        return;
      }
      addEvent(evt);
    });
  }

  //retourne un entier
  function bonusTestCarac(carac, personnage) {
    var charId = personnage.charId;
    var bonus = modCarac(charId, caracOfMod(carac));
    bonus += charAttributeAsInt(charId, carac + "_BONUS", 0);
    if (attributeAsBool(personnage, 'chant_des_heros')) {
      bonus += 1;
    }
    if (attributeAsBool(personnage, 'benediction')) {
      bonus += 1;
    }
    if (attributeAsBool(personnage, 'strangulation')) {
      var malusStrangulation =
        1 + attributeAsInt(personnage, 'dureeStrangulation', 0);
      bonus -= malusStrangulation;
    }
    if (attributeAsBool(personnage, 'nueeDInsectes')) {
      bonus -= 2;
    }
    if (carac == 'DEX') {
      if (charAttributeAsInt(charId, 'DEFARMUREON', 1))
        bonus -= charAttributeAsInt(charId, 'DEFARMUREMALUS', 0);
      if (charAttributeAsInt(charId, 'DEFBOUCLIERON', 1))
        bonus -= charAttributeAsInt(charId, 'DEFBOUCLIERMALUS', 0);
      if (attributeAsBool(personnage, 'agrandissement'))
        bonus -= 2;
    }
    if (carac == 'FOR') {
      if (attributeAsBool(personnage, 'rayon_affaiblissant'))
        bonus -= 2;
      if (attributeAsBool(personnage, 'agrandissement'))
        bonus += 2;
    }
    return bonus;
  }

  function nbreDeTestCarac(carac, charId) {
    var typeJet = findObjs({
      _type: 'attribute',
      _characterid: charId,
      name: carac + '_SUP'
    });
    if (typeJet.length === 0) return 1;
    switch (typeJet[0].get('current')) {
      case '@{JETNORMAL}':
        return 1;
      case '@{JETSUP}':
      case '@{JETSUPHERO}':
        return 2;
      default:
        error("Jet inconnu", typeJet[0].get('current'));
    }
    return 1;
  }

  function deTest(personnage) {
    var dice = 20;
    if (getState(personnage, 'affaibli')) dice = 12;
    return dice;
  }

  //callback peut prendre en argument
  // - Le texte du jet
  // - Le résultat total du jet
  // - La valeur du de20
  // - le inlineroll (pour les statistiques
  function jetCaracteristique(personnage, carac, callback) {
    var charId = personnage.charId;
    var token = personnage.token;
    var bonusCarac = bonusTestCarac(carac, personnage);

    var carSup = nbreDeTestCarac(carac, charId);
    var de = computeDice(personnage, carSup);

    var bonusText = (bonusCarac > 0) ? ' + ' + bonusCarac : (bonusCarac === 0) ? "" : ' - ' + (-bonusCarac);
    var rollExpr = "[[" + de + "cs20cf1" + "]]";

    sendChat("", rollExpr, function(res) {
      var rolls = res[0];
      var d20roll = rolls.inlinerolls[0].results.total;
      var rtext = buildinline(rolls.inlinerolls[0]) + bonusText;
      var total = d20roll + bonusCarac;
      if (d20roll == 1) rtext += " -> échec critique";
      else if (d20roll == 20) rtext += " -> réussite critique";
      else if (bonusCarac !== 0) rtext += " = " + total;
      callback(rtext, total, d20roll, rolls.inlinerolls[0]);
    });
  }

  // Test de caractéristique
  // Après le test, lance callback(reussite, texte).
  //  texte est l'affichage du jet de dé
  //   reussite est false si le jet échoue, undefined si c'est un échec critique
  //     true si c'est une réussite, et 2 si c'est un critique.
  function testCaracteristique(personnage, carac, bonusAttrs, seuil, bonus, evt, callback) { //asynchrone
    var charId = personnage.charId;
    var token = personnage.token;
    var bonusCarac = bonusTestCarac(carac, personnage);
    bonusAttrs.forEach(function(attr) {
      bonusCarac += charAttributeAsInt(charId, attr, 0);
    });
    bonusCarac += bonus;
    if (carac == 'SAG' || carac == 'INT' || carac == 'CHA') {
      if (charAttributeAsBool(charId, 'sansEsprit')) {
        callback(true, "(sans esprit : réussite automatique)");
        return;
      }
    }
    var carSup = nbreDeTestCarac(carac, charId);
    var de = computeDice(personnage, carSup);
    var rollExpr = "[[" + de + "cs20cf1]]";
    var name = getObj('character', charId).get('name');
    sendChat("", rollExpr, function(res) {
      var rolls = res[0];
      var d20roll = rolls.inlinerolls[0].results.total;
      var bonusText = (bonusCarac > 0) ? "+" + bonusCarac : (bonusCarac === 0) ? "" : bonusCarac;
      var rtext = buildinline(rolls.inlinerolls[0]) + bonusText;
      if (d20roll == 20) callback(2, rtext);
      else if (d20roll == 1) {
        diminueMalediction(personnage, evt);
        callback(undefined, rtext);
      } else if (d20roll + bonusCarac >= seuil) callback(true, rtext);
      else {
        diminueMalediction(personnage, evt);
        callback(false, rtext);
      }
    });
  }

  // Ne pas remplacer les inline rolls, il faut les afficher correctement
  function aoe(msg) {
    getSelected(msg, function(selected) {
      if (selected === undefined || selected.length === 0) {
        error("pas de cible pour l'aoe", msg);
        return;
      }
      var action = "<b>Dégats à aire d'effets.</b>";
      var optArgs = msg.content.split(' --');
      var cmd = optArgs[0].split(' ');
      if (cmd.length < 2) {
        error("cof-aoe prend les dégats en argument, avant les options",
          msg.content);
        return;
      }
      var dmg;
      var dmgRollNumber = findRollNumber(cmd[1]);
      if (dmgRollNumber === undefined) {
        dmg = {
          display: cmd[1],
          total: parseInt(cmd[1]),
          type: 'normal'
        };
        if (isNaN(dmg.total)) {
          error("Le premier argument de !cof-aoe n'est pas un nombre",
            msg.content);
          return;
        }
      } else {
        var r = msg.inlinerolls[dmgRollNumber];
        dmg = {
          total: r.results.total,
          display: buildinline(r, 'normal'),
          type: 'normal'
        };
        if (isNaN(dmg.total)) {
          error("Le premier argument de !cof-aoe n'est pas un nombre",
            msg.content);
          return;
        }
      }
      var partialSave;
      var options = {
        aoe: true
      };
      var evt = {
        type: "aoe",
        affectes: []
      };
      optArgs.forEach(function(opt) {
        opt = opt.split(' ');
        switch (opt[0]) {
          case '!cof-aoe':
            break;
          case 'psave':
            partialSave = opt;
            break;
          case 'once':
            if (opt.length < 2) {
              error("Il manque l'id de l'événement qui a provoqué l'aoe", optArgs);
              options.return = true;
              return;
            }
            var originalEvt = findEvent(opt[1]);
            if (originalEvt === undefined) {
              sendChat(msg.who, "Trop tard pour l'aoe : l'action de départ est trop ancienne ou a été annulée");
              options.return = true;
              return;
            }
            if (originalEvt.waitingForAoe) {
              evt = originalEvt;
              // Il faudra enlever waitingForAoe à la place de faire un addEvent
              return;
            }
            sendChat(msg.who, "Action déjà effectuée");
            options.return = true;
            return;
          case 'morts-vivants':
            options[opt[0]] = true;
            return;
          default:
        }
      });
      if (options.return) return;
      if (partialSave !== undefined) {
        if (partialSave.length < 3) {
          error("Usage : !cof-aoe dmg --psave carac seuil", partialSave);
          return;
        }
        if (isNotCarac(partialSave[1])) {
          error("Le premier argument de --psave n'est pas une caractéristique", partialSave);
          return;
        }
        options.partialSave = {
          carac: partialSave[1],
          seuil: parseInt(partialSave[2])
        };
        if (isNaN(options.partialSave.seuil)) {
          error("Le deuxième argument de --psave n'est pas un nombre", partialSave);
          return;
        }
        action +=
          " Jet de " + partialSave[1] + " difficulté " + partialSave[2] +
          " pour réduire les dégâts";
      }
      var display = startFramedDisplay(msg.playerid, action);
      var tokensToProcess = selected.length;

      function finalDisplay() {
        if (tokensToProcess == 1) {
          sendChat("", endFramedDisplay(display));
          if (evt.affectes.length > 0) {
            if (evt.waitingForAoe) {
              evt.waitingForAoe = undefined;
            } else {
              addEvent(evt);
            }
          }
        }
        tokensToProcess--;
      }
      iterSelected(selected, function(perso) {
        if (options['morts-vivants'] && !(estMortVivant(perso))) {
          finalDisplay();
          return;
        }
        var name = perso.token.get('name');
        var explications = [];
        dealDamage(perso, dmg, [], evt, 1, options, explications,
          function(dmgDisplay, dmgFinal) {
            addLineToFramedDisplay(display,
              name + " reçoit " + dmgDisplay + " points de dégâts", undefined, true);
            explications.forEach(function(e) {
              addLineToFramedDisplay(display, e);
            });
            finalDisplay();
          });
      }, finalDisplay);
    });
  }

  function findRollNumber(msg) {
    if (msg.length > 4) {
      if (msg.substring(0, 3) == '$[[') {
        var res = rollNumber(msg);
        if (isNaN(res)) return undefined;
        return res;
      }
    }
    return undefined;
  }

  function isNotCarac(x) {
    return (x != 'FOR' && x != 'DEX' && x != 'CON' && x != 'SAG' && x != 'INT' && x != 'CHA');
  }

  function estElementaire(t) {
    if (t === undefined) return false;
    return (t == "feu" || t == "froid" || t == "acide" || t == "electrique");
  }

  function interfaceSetState(msg) {
    getSelected(msg, function(selected) {
      if (selected === undefined || selected.length === 0) {
        error("Pas de cible pour le changement d'état", msg);
        return;
      }
      var cmd = msg.content.split(' ');
      if (cmd.length < 3) {
        error("Pas assez d'arguments pour !cof-set-state", msg.content);
        return;
      }
      var etat = cmd[1];
      var valeur = cmd[2];
      if (valeur == "false" || valeur == "0") valeur = false;
      if (valeur == "true") valeur = true;
      if (!_.has(cof_states, etat)) {
        error("Premier argument de !cof-set-state n'est pas un état valide", cmd);
        return;
      }
      var evt = {
        type: "set_state",
        affectes: []
      };
      iterSelected(selected, function(perso) {
        setState(perso, etat, valeur, evt);
      });
      addEvent(evt);
    });
  }

  function updateInit(token, evt) {
    if (state.COFantasy.combat &&
      token.get('pageid') == state.COFantasy.combat_pageid)
      initiative([{
        _id: token.id
      }], evt);
  }

  function updateNextInit(token) {
    updateNextInitSet.add(token.id);
  }

  function attributesInitEnMain(charId) {
    var attrs = findObjs({
      _type: 'attribute',
      _characterid: charId
    });
    attrs = attrs.filter(function(obj) {
      return (obj.get('name').startsWith('initEnMain'));
    });
    return attrs;
  }

  function labelInitEnMain(attr) {
    var attrN = attr.get('name').substring(10);
    return attrN;
  }

  function degainer(msg) {
    if (msg.selected === undefined || msg.selected.length === 0) {
      error("Qui doit dégainer ?", msg);
      return;
    }
    var cmd = msg.content.split(' ');
    if (cmd.length < 2) {
      error("Pas assez d'arguments pour !cof-degainer", msg.content);
      return;
    }
    var armeLabel = cmd[1];
    var evt = {
      type: "other",
      attributes: []
    };
    iterSelected(msg.selected, function(perso) {
      var token = perso.token;
      var charId = perso.charId;
      var name = token.get('name');
      var attrs = attributesInitEnMain(charId);
      attrs.forEach(function(attr) {
        var cur = parseInt(attr.get('current'));
        var attrN = labelInitEnMain(attr);
        var att = getAttack(attrN, name, charId);
        if (att === undefined) {
          error("Init en main avec un label introuvable dans les armes", attr);
          return;
        }
        var nomArme = att.weaponName;
        if (attrN == armeLabel) {
          if (cur === 0) {
            sendChar(charId, "dégaine " + nomArme);
            evt.attributes.push({
              attribute: attr,
              current: cur
            });
            attr.set('current', attr.get('max'));
            updateNextInit(token);
            return;
          }
          sendChar(charId, "a déjà " + nomArme + " en main");
          return;
        }
        if (cur !== 0) {
          sendChar(charId, "rengaine " + nomArme);
          evt.attributes.push({
            attribute: attr,
            current: cur
          });
          attr.set('current', 0);
        }
      });
    });
    if (evt.attributes.length > 0) addEvent(evt);
  }

  function echangeInit(msg) {
    var args = msg.content.split(" ");
    if (args.length < 4) {
      error("Pas assez d'arguments pour !cof-echange-init: " + msg.content, args);
      return;
    }
    var perso1 = tokenOfId(args[1], args[1]);
    if (perso1 === undefined) {
      error("le premier argument n'est pas un token valide", args[1]);
      return;
    }
    var perso2 = tokenOfId(args[2], args[2]);
    if (perso2 === undefined) {
      error("le second argument n'est pas un token valide", args[2]);
      return;
    }
    var attackBonus = parseInt(args[3]);
    if (isNaN(attackBonus) || attackBonus < 1 || attackBonus > 2) {
      error("Le troisième argument n'est pas un nombre", args[3]);
      return;
    }
    var evt = {
      type: "echange_init"
    };
    var to = getTurnOrder(evt);
    var tourTok1 = to.pasAgi.findIndex(function(t) {
      return (t.id == perso1.token.id);
    });
    var tourTok2 = to.pasAgi.findIndex(function(t) {
      return (t.id == perso2.token.id);
    });
    if (tourTok1 < 0) {
      sendChar(perso1.charId, "a déjà agit, pas moyen d'échanger son initiative");
      return;
    }
    if (tourTok2 < 0) {
      sendChar(perso2.charId, "a déjà agit, pas moyen d'échanger son initiative");
      return;
    }
    var pr1 = to.pasAgi[tourTok1].pr;
    var pr2 = to.pasAgi[tourTok2].pr;
    if (pr1 == pr2) {
      sendChar(perso1.charId, "a la même initiative que " + perso2.token.get('name'));
      return;
    }
    if (pr1 > pr2) {
      setTokenAttr(perso1, 'actionConcertee', attackBonus, evt, "gagne un bonus de " + attackBonus + " à ses attaques et en DEF pour ce tour");
      addEvent(evt);
    }
    to.pasAgi[tourTok1].pr = pr2;
    to.pasAgi[tourTok2].pr = pr1;
    var t1 = to.pasAgi[tourTok1];
    to.pasAgi[tourTok1] = to.pasAgi[tourTok2];
    to.pasAgi[tourTok2] = t1;
    updateNextInit(perso1.token);
    updateNextInit(perso2.token);
    to.pasAgi.push(to.tour);
    var turnOrder = to.pasAgi.concat(to.dejaAgi);
    Campaign().set('turnorder', JSON.stringify(turnOrder));
    addEvent(evt);
  }

  function aCouvert(msg) {
    var args = msg.content.split(" ");
    if (args.length < 2) {
      error("Pas assez d'arguments pour !cof-a-couvert: " + msg.content, args);
      return;
    }
    var perso1 = tokenOfId(args[1], args[1]);
    if (perso1 === undefined) {
      error("Le premier argument n'est pas un token valide", args[1]);
      return;
    }
    var evt = {
      type: "a_couvert"
    };
    var init = getInit();
    setTokenAttr(perso1, 'a_couvert', 1, evt, "reste à couvert", init);
    if (args.length > 2) {
      var perso2 = tokenOfId(args[2], args[2]);
      if (perso2 === undefined) {
        error("Le second argument n'est pas un token valide", args[2]);
        addEvent(evt);
        return;
      }
      if (perso2.token.id == perso1.token.id) {
        sendChar(perso1.charId, "s'est ciblé lui-même, il est donc le seul à couvert");
        addEvent(evt);
        return;
      }
      var d = distanceCombat(perso1.token, perso2.token);
      if (d > 0) {
        sendChar(perso2.charId, "est trop éloigné de " + perso1.token.get('name') + " pour rester à couvert avec lui");
      } else {
        setTokenAttr(perso2, 'a_couvert', 1, evt,
          "suit " + perso1.token.get('name') + " et reste à couvert", init);
      }
    }
    addEvent(evt);
  }

  function parseOptions(msg) {
    var pageId;
    if (msg.selected && msg.selected.length > 0) {
      var firstSelected = getObj('graphic', msg.selected[0]._id);
      pageId = firstSelected.get('pageid');
    }
    var opts = msg.content.split(' --');
    var cmd = opts.shift().split(' ');
    var options = {
      pageId: pageId,
      cmd: cmd
    };
    opts.forEach(function(arg) {
      cmd = arg.split(' ');
      switch (cmd[0]) {
        case "lanceur":
          if (cmd.length < 2) {
            error("Il faut préciser l'id ou le nom du lanceur", arg);
            return;
          }
          options.lanceur = tokenOfId(cmd[1], cmd[1], pageId);
          if (options.lanceur === undefined) {
            error("Argument de --lanceur non valide", cmd);
          }
          return;
        case 'puissant':
          if (cmd.length < 2) {
            options.puissant = "on";
            return;
          }
          if (cmd[1] == "oui") {
            options.puissant = "on";
            return;
          }
          if (cmd[1] == "non") {
            options.puissant = "off";
            return;
          }
          error("Option puissant non reconnue", cmd);
          return;
        case "mana":
          if (cmd.length < 2) {
            error("Pas assez d'argument pour --mana", cmd);
            return;
          }
          var cout;
          if (cmd.length > 2) {
            options.lanceur = tokenOfId(cmd[1], cmd[1], pageId);
            if (options.lanceur === undefined) {
              error("Premier argument de --mana non valide", cmd);
              return;
            }
            cout = parseInt(cmd[2]);
          } else {
            cout = parseInt(cmd[1]);
          }
          if (isNaN(cout) || cout < 0) {
            error("Cout en mana incorrect", cmd);
            return;
          }
          options.mana = cout;
          return;
        case 'limiteParJour':
          if (cmd.length < 2) {
            error("Il manque la limite journalière", cmd);
            return;
          }
          var limiteParJour = parseInt(cmd[1]);
          if (isNaN(limiteParJour) || limiteParJour < 1) {
            error("La limite journalière doit être un nombre positif", cmd);
            return;
          }
          options.limiteParJour = limiteParJour;
          if (cmd.length > 2) {
            options.limiteParJourRessource = cmd[2];
          }
          return;
        case 'limiteParCombat':
          if (cmd.length < 2) {
            options.limiteParCombat = 1;
            return;
          }
          var limiteParCombat = parseInt(cmd[1]);
          if (isNaN(limiteParCombat) || limiteParCombat < 1) {
            error("La limite par combat doit être un nombre positif", cmd);
            return;
          }
          options.limiteParCombat = limiteParCombat;
          if (cmd.length > 2) {
            options.limiteParCombatRessource = cmd[2];
          }
          return;
        case "portee":
          if (cmd.length < 2) {
            error("Pas assez d'argument pour --portee n", cmd);
            return;
          }
          var portee;
          if (cmd.length > 2) {
            var tokPortee = tokenOfId(cmd[1], cmd[1], pageId);
            if (tokPortee === undefined) {
              error("Premier argument de --portee non valide", cmd);
              return;
            }
            portee = parseInt(cmd[2]);
          } else {
            portee = parseInt(cmd[1]);
          }
          if (isNaN(portee) || portee < 0) {
            error("Portée incorrecte", cmd);
            return;
          }
          options.portee = portee;
          return;
        case 'saveParTour':
          options.saveParTour = parseSave(cmd);
          return;
        case 'dose':
          if (cmd.length < 2) {
            error("Il faut le nom de la dose", cmd);
            return;
          }
          options.dose = cmd[1];
          return;
        case 'decrAttribute':
          if (cmd.length < 2) {
            error("Erreur interne d'une commande générée par bouton", opts);
            return;
          }
          var attr = getObj('attribute', cmd[1]);
          if (attr === undefined) {
            log("Attribut à changer perdu");
            log(cmd);
            return;
          }
          options.decrAttribute = attr;
          return;
        case 'contactDuToken':
          if (cmd.length < 2) {
            error("Erreur interne d'une commande générée par bouton", opts);
            return;
          }
          options.contactDuToken = cmd[1];
          return;
        default:
          return;
      }
    });
    return options;
  }

  function getInit() {
    return state.COFantasy.init;
  }

  function effetTemporaire(msg) {
    var options = parseOptions(msg);
    var cmd = options.cmd;
    if (cmd === undefined || cmd.length < 3) {
      error("Pas assez d'arguments pour !cof-effet-temp", msg.content);
      return;
    }
    var effetComplet = cmd[1];
    var effet = cmd[1];
    if (effet.startsWith('forgeron_')) effet = 'forgeron';
    else if (effet.startsWith('dmgArme1d6_')) effet = 'dmgArme1d6';
    if (!estEffetTemp(effet)) {
      error(effet + " n'est pas un effet temporaire répertorié", msg.content);
      return;
    }
    var duree = parseInt(cmd[2]);
    if (isNaN(duree) || duree < 1) {
      error(
        "Le deuxième argument de !cof-effet-temp doit être un nombre positif",
        msg.content);
      return;
    }
    var evt = {
      type: 'Effet temporaire ' + effetComplet
    };
    var lanceur = options.lanceur;
    var charId;
    if (lanceur === undefined && (options.mana || (options.portee !== undefined) || options.limiteParJour || options.limiteParCombat || options.dose)) {
      error("Il faut préciser un lanceur pour ces options d'effet", options);
      return;
    }
    if (lanceur) charId = lanceur.charId;
    if (limiteRessources(lanceur, options, effet, effet, evt)) return;
    getSelected(msg, function(selected) {
      if (selected === undefined || selected.length === 0) {
        sendChar(charId, "Pas de cible sélectionée pour l'effet");
        return;
      }
      if (options.portee !== undefined) {
        selected = selected.filter(function(sel) {
          var token = getObj('graphic', sel._id);
          var dist = distanceCombat(lanceur.token, token);
          if (dist > options.portee) {
            sendChar(charId, " est trop loin de sa cible");
            return false;
          }
          return true;
        });
      }
      if (!state.COFantasy.combat && selected.length > 0) {
        initiative(selected, evt);
      }
      setAttr(
        selected, effetComplet, duree, evt, messageEffetTemp[effet].activation,
        getInit());
      if (options.saveParTour) {
        setAttr(selected, effetComplet + "SaveParTour",
          options.saveParTour.carac, evt, undefined, options.saveParTour.seuil);
      }
      if (options.puissant) {
        var puissant = true;
        if (options.puissant == "off") puissant = false;
        setAttr(selected, effetComplet + "Puissant", puissant, evt);
      }
      addEvent(evt);
    }, lanceur);
  }

  function effetCombat(msg) {
    var options = parseOptions(msg);
    var cmd = options.cmd;
    if (cmd === undefined || cmd.length < 2) {
      error("Pas assez d'arguments pour !cof-effet-combat", msg.content);
      return;
    }
    var effet = cmd[1];
    if (!estEffetCombat(effet)) {
      error(effet + " n'est pas un effet de combat répertorié", msg.content);
      return;
    }
    var evt = {
      type: 'Effet ' + effet
    };
    var lanceur = options.lanceur;
    var charId;
    if (lanceur === undefined && (options.mana || (options.portee !== undefined) || options.limiteParJour || options.limiteParCombat)) {
      error("Il faut préciser un lanceur pour ces options d'effet", options);
      return;
    }
    if (lanceur) charId = lanceur.charId;
    if (limiteRessources(lanceur, options, effet, effet, evt)) return;
    getSelected(msg, function(selected) {
      if (selected === undefined || selected.length === 0) {
        sendChar(charId, "Pas de cible sélectionée pour l'effet");
        return;
      }
      if (options.portee !== undefined) {
        selected = selected.filter(function(sel) {
          var token = getObj('graphic', sel._id);
          var dist = distanceCombat(lanceur.token, token);
          if (dist > options.portee) {
            sendChar(charId, " est trop loin de sa cible");
            return false;
          }
          return true;
        });
      }
      if (!state.COFantasy.combat && selected.length > 0) {
        initiative(selected, evt);
      }
      setAttr(
        selected, effet, true, evt, messageEffetCombat[effet].activation);
      if (options.puissant) {
        var puissant = true;
        if (options.puissant == "off") puissant = false;
        setAttr(selected, effet + "Puissant", puissant, evt);
      }
      addEvent(evt);
    });
  }

  function effetIndetermine(msg) {
    var options = parseOptions(msg);
    var cmd = options.cmd;
    if (cmd === undefined || cmd.length < 3) {
      error("Pas assez d'arguments pour !cof-effet", msg.content);
      return;
    }
    var effet = cmd[1];
    if (!estEffetIndetermine(effet)) {
      error(effet + " n'est pas un effet répertorié", msg.content);
      return;
    }
    var activer;
    switch (cmd[2]) {
      case 'oui':
      case 'Oui':
      case 'true':
        activer = true;
        break;
      case 'non':
      case 'Non':
      case 'false':
        activer = false;
        break;
      default:
        error("Option de !cof-effet inconnue", cmd);
        return;
    }
    var evt = {
      type: 'Effet ' + effet
    };
    var lanceur = options.lanceur;
    var charId;
    if (lanceur === undefined && (options.mana || (options.portee !== undefined) || options.limiteParJour || options.limiteParCombat)) {
      error("Il faut préciser un lanceur pour ces options d'effet", options);
      return;
    }
    if (lanceur) charId = lanceur.charId;
    if (limiteRessources(lanceur, options, effet, effet, evt)) return;
    getSelected(msg, function(selected) {
      if (selected === undefined || selected.length === 0) {
        sendChar(charId, "Pas de cible sélectionée pour l'effet");
        return;
      }
      if (options.portee !== undefined) {
        selected = selected.filter(function(sel) {
          var token = getObj('graphic', sel._id);
          var dist = distanceCombat(lanceur.token, token);
          if (dist > options.portee) {
            sendChar(charId, " est trop loin de sa cible");
            return false;
          }
          return true;
        });
      }
      if (activer) {
        setAttr(
          selected, effet, true, evt, messageEffetIndetermine[effet].activation);
        if (options.puissant) {
          var puissant = true;
          if (options.puissant == "off") puissant = false;
          setAttr(selected, effet + "Puissant", puissant, evt);
        }
      } else {
        removeAttr(selected, effet, evt, messageEffetIndetermine[effet].fin);
      }
      addEvent(evt);
    });
  }

  function peurOneToken(target, pageId, difficulte, duree, options,
    display, evt, callback) {
    var charId = target.charId;
    var targetName = target.token.get('name');
    if (charAttributeAsBool(charId, 'sansPeur')) {
      addLineToFramedDisplay(display,
        targetName + " est insensible à la peur !");
      callback();
      return;
    }
    var carac = 'SAG'; //carac pour résister
    if (options.resisteAvecForce) carac += 'FOR';
    //chercher si un partenaire a sansPeur pour appliquer le bonus
    var charName = getObj('character', charId).get('name');
    var toutesEquipes = findObjs({
      _type: 'handout'
    });
    toutesEquipes = toutesEquipes.filter(function(obj) {
      return (obj.get('name').startsWith("Equipe "));
    });
    var countEquipes = toutesEquipes.length;
    var allieSansPeur = 0;
    toutesEquipes.forEach(function(equipe) {
      equipe.get('notes', function(note) {
        countEquipes--;
        if (note.includes(charName)) {
          var names = note.split('<br>');
          var tokens = tokensNamed(names, pageId);
          tokens.forEach(function(tok) {
            var cid = tok.get('represents');
            if (cid === '') return;
            if (charAttributeAsBool(cid, 'sansPeur')) {
              allieSansPeur =
                Math.max(allieSansPeur, 2 + modCarac(cid, 'CHARISME'));
            }
          });
        }
        if (countEquipes === 0) { //continuation
          testCaracteristique(target, carac, [], difficulte, allieSansPeur, evt,
            function(reussite, rollText) {
              var line = "Jet de résistance de " + targetName + ":" + rollText;
              var sujet = onGenre(charId, 'il', 'elle');
              if (reussite) {
                line += "&gt;=" + difficulte + ",  " + sujet + " résiste à la peur.";
              } else {
                setState(target, 'apeure', true, evt);
                line += "&lt;" + difficulte + ", " + sujet;
                var effet = 'peur';
                if (options.etourdi) {
                  line += "s'enfuit ou reste recroquevillé" + eForFemale(charId) + " sur place";
                  effet = 'peurEtourdi';
                } else if (options.ralenti) {
                  line += "est ralenti" + eForFemale(charId);
                  effet = 'ralentiTemp';
                } else {
                  line += "s'enfuit.";
                }
                setTokenAttr(target, effet, duree, evt, undefined, getInit());
              }
              addLineToFramedDisplay(display, line);
              callback();
            });
        }
      });
    }); //end toutesEquipes.forEach
    callback();
  }

  function peur(msg) {
    var optArgs = msg.content.split(' --');
    var cmd = optArgs[0].split(' ');
    if (cmd.length < 4) {
      error("Pas assez d'arguments pour !cof-peur", msg.content);
      return;
    }
    var caster = tokenOfId(cmd[1], cmd[1]);
    if (caster === undefined) {
      error("Le premier arguent de !cof-peur n'est pas un token valide", cmd);
      return;
    }
    var casterToken = caster.token;
    var pageId = casterToken.get('pageid');
    var difficulte = parseInt(cmd[2]);
    if (isNaN(difficulte)) {
      error("Le second argument de !cof-peur, la difficulté du test de résitance, n'est pas un nombre", cmd);
      return;
    }
    var duree = parseInt(cmd[3]);
    if (isNaN(duree) || duree < 0) {
      error("Le troisième argument de !cof-peur, la durée, n'est pas un nombre positif", cmd);
      return;
    }
    var options = {};
    optArgs.shift();
    optArgs.forEach(function(opt) {
      var optCmd = opt.split(' ');
      switch (optCmd[0]) {
        case "attaqueMagique":
          error("TODO", opt);
          return;
        case "resisteAvecForce":
        case "etourdi":
        case "ralenti":
        case "effroi":
          options[optCmd[0]] = true;
          return;
        case "portee":
          if (optCmd.length < 2) {
            error("Il manque l'argument de portée", optArgs);
            return;
          }
          options.portee = parseInt(optCmd[1]);
          if (isNaN(options.portee) || options.portee < 0) {
            error("La portée n'est pas un nombre positif", optCmd);
            options.portee = undefined;
          }
          return;
        default:
          return;
      }
    });
    getSelected(msg, function(selected) {
      if (selected === undefined || selected.length === 0) {
        error("Pas de cible sélectionnée pour la peur", msg);
        return;
      }
      var action = "<b>" + casterToken.get('name') + "</b> ";
      if (options.effroi)
        action += "est vraiment effrayant" + eForFemale(caster.charId);
      else action = "<b>Capacité</b> : Sort de peur";
      var display = startFramedDisplay(msg.playerid, action, caster);
      var evt = {
        type: 'peur'
      };
      var counter = selected.length;
      var finalEffect = function() {
        if (counter > 0) return;
        sendChat("", endFramedDisplay(display));
        addEvent(evt);
      };
      iterSelected(selected, function(perso) {
          counter--;
          if (options.portee !== undefined) {
            var distance = distanceCombat(casterToken, perso.token, pageId);
            if (distance > options.portee) {
              addLineToFramedDisplay(display,
                perso.token.get('name') + " est hors de portée de l'effet");
              finalEffect();
              return;
            }
          }
          peurOneToken(perso, pageId, difficulte, duree, options,
            display, evt, finalEffect);
        }, //fun fonction de iterSelectde
        function() { //callback pour les cas où token incorrect
          counter--;
          finalEffect();
        });
    }, caster);
  }

  // callback est seulement appelé si on fait le test
  function attaqueMagique(msg, evt, callback) {
    var args = msg.content.split(" ");
    if (args.length < 3) {
      error("Pas assez d'arguments pour " + msg.content, args);
      return;
    }
    var attaquant = tokenOfId(args[1], args[1]);
    if (attaquant === undefined) {
      error("L'attaquant n'est pas un token valide", args[1]);
      return;
    }
    var token1 = attaquant.token;
    var charId1 = attaquant.charId;
    var char1 = getObj("character", attaquant.charId);
    if (char1 === undefined) {
      error("Unexpected undefined 1", attaquant);
      return;
    }
    var name1 = char1.get('name');
    var pageId = attaquant.token.get('pageid');
    var cible = tokenOfId(args[2], args[2], pageId);
    if (cible === undefined) {
      error("La cible n'est pas un token valide" + msg.content, args[2]);
      return;
    }
    var token2 = cible.token;
    var charId2 = cible.charId;
    var char2 = getObj("character", charId2);
    if (char2 === undefined) {
      error("Unexpected undefined 1", token2);
      return;
    }
    var name2 = char2.get('name');
    var explications = [];
    evt = evt || {
      type: 'attaque magique'
    };
    var options = {};
    var opts = msg.content.split(' --');
    opts.shift();
    opts.forEach(function(option) {
      var cmd = option.split(' ');
      switch (cmd[0]) {
        case 'portee':
          if (cmd.length < 2) {
            error("Il manque l'argument de --portee", msg.content);
            return;
          }
          options.portee = parseInt(cmd[1]);
          if (isNaN(options.portee) || options.portee < 0) {
            error("La portée doit être un nombre positif", cmd);
            options.portee = undefined;
          }
          return;
        case 'mana':
          if (cmd.length < 2) {
            error("Il manque l'argument de --mana", msg.content);
            return;
          }
          options.mana = parseInt(cmd[1]);
          if (isNaN(options.mana) || options.mana < 0) {
            error("Le coût en mana doit être un nombre positif", cmd);
            options.mana = undefined;
          }
          return;
        default:
          error("Option d'attaque magique inconnue", cmd);
          return;
      }
    });
    if (options.portee !== undefined) {
      var distance = distanceCombat(token1, token2, pageId);
      if (distance > options.portee) {
        sendChar(charId1, "est trop loin de " + cible.token.get('name') +
          " pour l'attaque magique");
        return;
      }
    }
    if (options.mana) {
      var msgMana = "l'attaque magique";
      if (!depenseMana(attaquant, options.mana, msgMana, evt)) return;
    }
    var bonus1 = bonusDAttaque(attaquant, explications, evt);
    if (bonus1 === 0) bonus1 = "";
    else if (bonus1 > 0) bonus1 = " +" + bonus1;
    var attk1 = addOrigin(name1, "[[" + getAttrByName(charId1, 'ATKMAG') +
      bonus1 + "]]");
    var bonus2 = bonusDAttaque(cible, explications, evt);
    if (bonus2 === 0) bonus2 = "";
    else if (bonus2 > 0) bonus2 = " +" + bonus2;
    var attk2 = addOrigin(name2, "[[" + getAttrByName(charId2, 'ATKMAG') +
      bonus1 + "]]");
    var de1 = computeDice(attaquant, 1);
    var de2 = computeDice(cible, 1);
    var toEvaluate = "[[" + de1 + "]] [[" + de2 + "]] " + attk1 + " " + attk2;
    sendChat("", toEvaluate, function(res) {
      var rolls = res[0];
      // Determine which roll number correspond to which expression
      var afterEvaluate = rolls.content.split(" ");
      var att1RollNumber = rollNumber(afterEvaluate[0]);
      var att2RollNumber = rollNumber(afterEvaluate[1]);
      var attk1SkillNumber = rollNumber(afterEvaluate[2]);
      var attk2SkillNumber = rollNumber(afterEvaluate[3]);
      var d20roll1 = rolls.inlinerolls[att1RollNumber].results.total;
      var att1Skill = rolls.inlinerolls[attk1SkillNumber].results.total;
      var attackRoll1 = d20roll1 + att1Skill;
      var d20roll2 = rolls.inlinerolls[att2RollNumber].results.total;
      var att2Skill = rolls.inlinerolls[attk2SkillNumber].results.total;
      var attackRoll2 = d20roll2 + att2Skill;
      var action = "Attaque magique opposée";
      var display = startFramedDisplay(msg.playerid, action, char1, cible);
      var line =
        token1.get('name') + " fait " +
        buildinline(rolls.inlinerolls[att1RollNumber]);
      if (att1Skill > 0) line += "+" + att1Skill + " = " + attackRoll1;
      else if (att1Skill < 0) line += att1Skill + " = " + attackRoll1;
      addLineToFramedDisplay(display, line);
      line =
        token2.get('name') + " fait " +
        buildinline(rolls.inlinerolls[att2RollNumber]);
      if (att2Skill > 0) line += "+" + att2Skill + " = " + attackRoll2;
      else if (att2Skill < 0) line += att2Skill + " = " + attackRoll2;
      addLineToFramedDisplay(display, line);
      var reussi;
      if (d20roll1 == 1) {
        if (d20roll2 == 1) reussi = (attackRoll1 >= attackRoll2);
        else reussi = false;
      } else if (d20roll2 == 1) reussi = true;
      else if (d20roll1 == 20) {
        if (d20roll2 == 20) reussi = (attackRoll1 >= attackRoll2);
        else reussi = true;
      } else reussi = (attackRoll1 >= attackRoll2);
      if (reussi) {
        diminueMalediction(cible, evt);
        addLineToFramedDisplay(display, "<b>Attaque réussie !</b>");
      } else {
        diminueMalediction(attaquant, evt);
        addLineToFramedDisplay(display, "<b>L'attaque échoue.</b>");
      }
      if (callback) callback(attaquant, cible, display, reussi);
      else {
        sendChat("", endFramedDisplay(display));
        addEvent(evt);
      }
    });
  }

  function tueurFantasmagorique(msg) {
    var evt = {
      type: 'Tueur fantasmagorique'
    };
    attaqueMagique(msg, evt,
      function(attaquant, cible, display, reussi) {
        if (reussi) {
          if (attributeAsBool(cible, 'tueurFantasmagorique')) {
            addLineToFramedDisplay(display, cible.token.get('name') + " a déjà été victime d'un tueur fantasmagorique aujourd'hui, c'est sans effet");
            sendChat("", endFramedDisplay(display));
            addEvent(evt);
            return;
          }
          setTokenAttr(cible, 'tueurFantasmagorique', true, evt);
          var s = {
            carac: 'SAG',
            seuil: 10 + modCarac(attaquant.charId, 'CHARISME')
          };
          var niveauAttaquant = charAttributeAsInt(attaquant.charId, 'NIVEAU', 1);
          var niveauCible = charAttributeAsInt(cible.charId, 'NIVEAU', 1);
          if (niveauCible > niveauAttaquant)
            s.seuil -= (niveauCible - niveauAttaquant) * 5;
          else if (niveauCible < niveauAttaquant)
            s.seuil += (niveauAttaquant - niveauCible);
          var expliquer = function(message) {
            addLineToFramedDisplay(display, message, 80);
          };
          var saveOpts = {
            msgPour: " pour résister au tueur fantasmagorique",
            attaquant: attaquant
          };
          save(s, cible, expliquer, saveOpts, evt,
            function(reussiteSave) {
              if (reussiteSave) {
                addLineToFramedDisplay(display, cible.token.get('name') + " perd l'équilibre et tombe par terre");
                setState(cible, 'renverse', true, evt);
              } else { //save raté
                addLineToFramedDisplay(display, cible.token.get('name') + " succombe à ses pires terreurs");
                var pv = cible.token.get('bar1_value');
                evt.affectes = evt.affectes || [];
                evt.affectes.push({
                  affecte: cible.token,
                  prev: {
                    bar1_value: pv
                  }
                });
                updateCurrentBar(cible.token, 1, 0);
                setState(cible, 'mort', true, evt);
              }
              sendChat("", endFramedDisplay(display));
              addEvent(evt);
            });
        } else {
          setTokenAttr(cible, 'tueurFantasmagorique', true, evt);
          sendChat("", endFramedDisplay(display));
          addEvent(evt);
        }
      });
  }

  function sommeil(msg) { //sort de sommeil
    var args = msg.content.split(' ');
    if (args.length < 2) {
      error("La fonction !cof-sommeil a besoin du nom ou de l'id du lanceur de sort", args);
      return;
    }
    var caster = tokenOfId(args[1], args[1]);
    if (caster === undefined) {
      error("Aucun personnage nommé " + args[1], args);
      return;
    }
    var casterCharId = caster.charId;
    var casterChar = getObj('character', casterCharId);
    getSelected(msg, function(selected) {
      if (selected === undefined || selected.length === 0) {
        sendChat(msg.who, "Pas de cible sélectionnée pour le sort de sommeil");
        return;
      }
      var casterName = caster.token.get('name');
      var casterCharName = casterChar.get('name');
      var cha = modCarac(casterCharId, 'CHARISME');
      var attMagText = addOrigin(casterCharName, getAttrByName(casterCharId, 'ATKMAG'));
      var action = "<b>Capacité</b> : Sort de sommeil";
      var display = startFramedDisplay(msg.playerid, action, caster);
      sendChat("", "[[1d6]] [[" + attMagText + "]]", function(res) {
        var rolls = res[0];
        var afterEvaluate = rolls.content.split(" ");
        var d6RollNumber = rollNumber(afterEvaluate[0]);
        var attMagRollNumber = rollNumber(afterEvaluate[1]);
        var nbTargets = rolls.inlinerolls[d6RollNumber].results.total + cha;
        var attMag = rolls.inlinerolls[attMagRollNumber].results.total;
        var evt = {
          type: 'sommeil',
          affectes: []
        };
        var targetsWithSave = [];
        var targetsWithoutSave = [];
        iterSelected(selected, function(perso) {
          perso.name = perso.token.get('name');
          var pv = perso.token.get('bar1_max');
          if (pv > 2 * attMag) {
            var line =
              perso.name + " a trop de PV pour être affecté par le sort";
            addLineToFramedDisplay(display, line);
          } else if (pv > attMag) {
            targetsWithSave.push(perso);
          } else {
            targetsWithoutSave.push(perso);
          }
        });
        var targets = [];
        var i, r;
        if (targetsWithoutSave.length > nbTargets) {
          i = 0; //position to decide
          while (nbTargets > 0) {
            r = randomInteger(nbTargets) + i;
            targets.push(targetsWithoutSave[r]);
            targetsWithoutSave[r] = targetsWithoutSave[i];
            i++;
            nbTargets--;
          }
        } else {
          targets = targetsWithoutSave;
          nbTargets -= targets.length;
        }
        targets.forEach(function(t) {
          setState(t, 'endormi', true, evt);
          addLineToFramedDisplay(display, t.name + " s'endort");
        });
        if (nbTargets > 0 && targetsWithSave.length > 0) {
          if (targetsWithSave.length > nbTargets) {
            i = 0;
            targets = [];
            while (nbTargets > 0) {
              r = randomInteger(nbTargets) + i;
              targets.push(targetsWithSave[r]);
              targetsWithSave[r] = targetsWithSave[i];
              i++;
              nbTargets--;
            }
          } else {
            targets = targetsWithSave;
            nbTargets -= targets.length;
          }
          var seuil = 10 + cha;
          var tokensToProcess = targets.length;
          var sendEvent = function() {
            if (tokensToProcess == 1) {
              addEvent(evt);
              sendChat("", endFramedDisplay(display));
            }
            tokensToProcess--;
          };
          targets.forEach(function(t) {
            testCaracteristique(t, 'SAG', [], seuil, 0, evt,
              function(reussite, rollText) {
                var line = "Jet de résistance de " + t.name + ":" + rollText;
                var sujet = onGenre(t.charId, 'il', 'elle');
                if (reussite) {
                  line += "&gt;=" + seuil + ",  " + sujet + " ne s'endort pas";
                } else {
                  setState(t, 'endormi', true, evt);
                  line += "&lt;" + seuil + ", " + sujet + " s'endort";
                }
                addLineToFramedDisplay(display, line);
                sendEvent();
              });
          });
        } else { // all targets are without save
          addEvent(evt);
          sendChat("", endFramedDisplay(display));
        }
      });
    }, caster);
  }

  function transeGuerison(msg) {
    if (state.COFantasy.combat) {
      sendChat("", "Pas possible de méditer en combat");
      return;
    }
    if (msg.selected === undefined || msg.selected.length === 0) {
      sendChat(msg.who, "Pas de cible sélectionnée pour la transe de guérison");
      return;
    }
    var evt = {
      type: "Transe de guérison",
      affectes: []
    };
    iterSelected(msg.selected, function(perso) {
      var charId = perso.charId;
      var token = perso.token;
      if (attributeAsBool(perso, 'transeDeGuérison')) {
        sendChar(charId, "a déjà médité depuis le dernier combat");
        return;
      }
      var bar1 = parseInt(token.get("bar1_value"));
      var pvmax = parseInt(token.get("bar1_max"));
      if (isNaN(bar1) || isNaN(pvmax)) return;
      if (bar1 >= pvmax) {
        sendChar(charId, "n'a pas besoin de méditer");
        return;
      }
      var sagMod = modCarac(charId, 'SAGESSE');
      var niveau = charAttributeAsInt(charId, 'NIVEAU', 1);
      var soin = niveau + sagMod;
      if (soin < 0) soin = 0;
      evt.affectes.push({
        affecte: token,
        prev: {
          bar1_value: bar1
        }
      });
      bar1 += soin;
      if (bar1 > pvmax) {
        soin -= (bar1 - pvmax);
        bar1 = pvmax;
      }
      updateCurrentBar(token, 1, bar1);
      setTokenAttr(perso, 'transeDeGuérison', true, evt);
      sendChar(charId, "entre en méditation pendant 10 minutes et récupère " + soin + " points de vie.");
    });
    addEvent(evt);
  }

  // Look for a given string in the PROFIL attribute (case insensitive)
  // type should be all lower case
  function charOfType(charId, type) {
    var attr = findObjs({
      _type: 'attribute',
      _characterid: charId,
      name: 'PROFIL'
    });
    if (attr.length === 0) return false;
    var profil = attr[0].get('current').toLowerCase();
    return (profil.includes(type));
  }

  function estNonVivant(perso) {
    return (charAttributeAsBool(perso, 'nonVivant') ||
      attributeAsBool(perso, 'masqueMortuaire'));
  }

  function raceIs(perso, race) {
    var attr = findObjs({
      _type: 'attribute',
      _characterid: perso.charId,
      name: 'RACE'
    });
    if (attr.length === 0) return false;
    var charRace = attr[0].get('current').toLowerCase();
    return (charRace == race.toLowerCase());
  }

  function estMortVivant(perso) {
    if (charAttributeAsBool(perso, 'mort-vivant')) return true;
    var attr = findObjs({
      _type: 'attribute',
      _characterid: perso.charId,
      name: 'RACE'
    });
    if (attr.length === 0) return false;
    var charRace = attr[0].get('current').toLowerCase();
    switch (charRace) {
      case 'squelette':
      case 'zombie':
      case 'mort-vivant':
      case 'momie':
        return true;
      default:
        return false;
    }
  }

  function estHumanoide(perso) {
    if (charAttributeAsBool(perso, 'humanoide')) return true;
    var attr = findObjs({
      _type: 'attribute',
      _characterid: perso.charId,
      name: 'RACE'
    });
    if (attr.length === 0) return false;
    var charRace = attr[0].get('current').toLowerCase();
    switch (charRace) {
      case 'humain':
      case 'nain':
      case 'elfe':
      case 'elfe des bois':
      case 'elfe noir':
      case 'drow':
      case 'halfelin':
      case 'géant':
      case 'ange':
      case 'barghest':
      case 'démon':
      case 'doppleganger':
      case 'dryade':
      case 'gnoll':
      case 'gobelin':
      case 'gobelours':
      case 'hobegobelin':
      case 'homme-lézard':
      case 'kobold':
      case 'nymphe':
      case 'ogre':
      case 'orque':
      case 'pixie':
      case 'troll':
        return true;
      default:
        return false;
    }
  }

  function estMauvais(perso) {
    if (charAttributeAsBool(perso, 'mauvais')) return true;
    var attr = findObjs({
      _type: 'attribute',
      _characterid: perso.charId,
      name: 'RACE'
    });
    if (attr.length === 0) return false;
    var charRace = attr[0].get('current').toLowerCase();
    switch (charRace) {
      case 'squelette':
      case 'zombie':
      case 'élémentaire':
      case 'démon':
      case 'momie':
        return true;
      default:
        return false;
    }
  }

  //Retourne un encodage des tailes :
  // 1 : minuscule
  // 2 : très petit
  // 3 : petit
  // 4 : moyen
  // 5 : grand
  // 6 : énorme
  // 7 : colossal
  function taillePersonnage(perso) {
    var attr = findObjs({
      _type: 'attribute',
      _characterid: perso.charId,
      name: 'TAILLE'
    });
    if (attr.length === 0) return undefined;
    switch (attr[0].get('current').toLowerCase()) {
      case "minuscule":
        return 1;
      case "très petit":
      case "très petite":
      case "tres petit":
        return 2;
      case "petit":
      case "petite":
        return 3;
      case "moyen":
      case "moyenne":
      case "normal":
      case "normale":
        return 4;
      case "grand":
      case "grande":
        return 5;
      case "énorme":
      case "enorme":
        return 6;
      case "colossal":
      case "colossale":
        return 7;
      default:
        return undefined;
    }
  }

  function estAussiGrandQue(perso1, perso2) {
    var t1 = taillePersonnage(perso1);
    var t2 = taillePersonnage(perso2);
    if (t1 === undefined || t2 === undefined) return true;
    if (t2 > t1) return false;
    return true;
  }

  function soigner(msg) {
    var options = parseOptions(msg);
    var cmd = options.cmd;
    if (cmd.length < 2) {
      error("Il faut au moins un argument à !cof-soin", cmd);
      return;
    }
    var soigneur = options.lanceur;
    var pageId;
    if (soigneur) pageId = soigneur.token.get('pageId');
    var cible;
    var argSoin;
    if (cmd.length > 4) {
      error("Trop d'arguments à !cof-soin", cmd);
    }
    if (cmd.length > 2) { //cof-soin lanceur [cible] montant
      if (soigneur === undefined) {
        soigneur = tokenOfId(cmd[1], cmd[1]);
        if (soigneur === undefined) {
          error("Le premier argument n'est pas un token valide", cmd[1]);
          return;
        }
        pageId = soigneur.token.get('pageid');
      }
      if (cmd.length > 3) { // on a la cible en argument
        cible = tokenOfId(cmd[2], cmd[2], pageId);
        if (cible === undefined) {
          error("Le deuxième argument n'est pas un token valide: " + msg.content, cmd[2]);
          return;
        }
        argSoin = cmd[3];
      } else {
        argSoin = cmd[2];
      }
    } else { //on a juste le montant des soins
      argSoin = cmd[1];
    }
    if (soigneur === undefined && (options.mana || (options.portee !== undefined) || options.limiteParJour || options.limiteParCombat || options.dose)) {
      error("Il faut préciser un soigneur pour ces options d'effet", options);
      return;
    }
    var charId;
    var niveau = 1;
    var rangSoin = 0;
    var soins;
    if (soigneur) {
      charId = soigneur.charId;
      niveau = charAttributeAsInt(soigneur, 'NIVEAU', 1);
      rangSoin = charAttributeAsInt(soigneur, 'voieDesSoins', 0);
    }
    var effet = "soins";
    switch (argSoin) {
      case 'leger':
        effet += ' légers';
        if (options.dose === undefined && options.limiteParJour === undefined)
          options.limiteAttribut = {
            nom: 'soinsLegers',
            message: "ne peut plus lancer de sort de soins légers aujourd'hui",
            limite: rangSoin
          };
        soins = "[[1d8 +" + niveau + "]]";
        if (options.portee === undefined) options.portee = 0;
        break;
      case 'modere':
        effet += ' modérés';
        if (options.dose === undefined && options.limiteParJour === undefined)
          options.limiteAttribut = {
            nom: 'soinsModeres',
            message: "ne peut plus lancer de sort de soins modéréss aujourd'hui",
            limite: rangSoin
          };
        if (options.portee === undefined) options.portee = 0;
        soins = "[[2d8 +" + niveau + "]]";
        break;
      case 'groupe':
        if (!state.COFantasy.combat) {
          sendChar(charId, " ne peut pas lancer de soin de groupe en dehors des combats");
          return;
        }
        effet += ' de groupe';
        if (options.dose === undefined && options.limiteParJour === undefined)
          options.limiteAttribut = {
            nom: 'soinsDeGroupe',
            message: " a déjà fait un soin de groupe durant ce combat",
            limite: 1
          };
        if (options.puissant) soins = "[[1d10";
        else soins = "[[1d8";
        soins += " + " + niveau + "]]";
        msg.content += " --allies --self";
        if (options.mana === undefined) options.mana = 1;
        break;
      default:
        soins = "[[" + argSoin + "]]";
    }
    sendChat('', soins, function(res) {
      soins = res[0].inlinerolls[0].results.total;
      var soinTxt = buildinline(res[0].inlinerolls[0], 'normal', true);
      if (soins <= 0) {
        sendChar(charId, "ne réussit pas à soigner (total de soins " + soinTxt + ")");
        return;
      }
      var evt = {
        type: effet
      };
      var limiteATester = true;
      var soinImpossible = false;
      var nbCibles;
      var display;
      var iterCibles = function(callback) {
        if (cible) {
          nbCibles = 1;
          callback(cible);
        } else {
          getSelected(msg, function(selected) {
            nbCibles = selected.length;
            if (nbCibles > 1) {
              display = startFramedDisplay(msg.playerid, effet, soigneur);
            } else if (nbCibles === 0) {
              sendChar(charId, "personne à soigner");
              return;
            }
            iterSelected(selected, callback);
          });
        }
      };
      var finSoin = function() {
        if (nbCibles == 1) {
          if (display) sendChat("", endFramedDisplay(display));
          addEvent(evt);
        }
        nbCibles--;
      };
      iterCibles(function(cible) {
        if (soinImpossible) {
          finSoin();
          return;
        }
        var token2 = cible.token;
        var name2 = token2.get('name');
        var sujet = onGenre(cible.charId, 'il', 'elle');
        var Sujet = onGenre(cible.charId, 'Il', 'Elle');
        if (options.portee !== undefined) {
          var distance = distanceCombat(soigneur.token, token2, pageId);
          if (distance > options.portee) {
            if (display)
              addLineToFramedDisplay(display, "<b>" + name2 + "</b> : trop loin pour le soin.");
            else
              sendChar(charId,
                "est trop loin de " + name2 + " pour le soigner.");
            return;
          }
        }
        if (limiteATester) {
          limiteATester = false;
          if (limiteRessources(soigneur, options, effet, effet, evt)) {
            soinImpossible = true;
            display = undefined;
            finSoin();
            return;
          } else if (display) {
            addLineToFramedDisplay(display, "Résultat des dés : " + soinTxt);
          }
        }
        var callMax = function() {
          if (display) {
            addLineToFramedDisplay(display, "<b>" + name2 + "</b> : pas besoin de soins.");
          } else {
            var maxMsg = "n'a pas besoin de ";
            if (!soigneur || token2.id == soigneur.token.id) maxMsg += "se soigner";
            else maxMsg += "soigner " + name2;
            sendChar(charId, maxMsg + ". " + Sujet + " est déjà au maximum de PV");
          }
          return;
        };
        var printTrue = function(s) {
          if (display) {
            addLineToFramedDisplay(display,
              "<b>" + name2 + "</b> : + " + s + " PV");
          } else {
            var msgSoin;
            if (!soigneur || token2.id == soigneur.token.id) msgSoin = 'se soigne';
            else msgSoin = 'soigne ' + name2;
            msgSoin += " de ";
            if (s < soins)
              msgSoin += s + " PV. (Le résultat du jet était " + soinTxt + ")";
            else msgSoin += soinTxt + " PV.";
            sendChar(charId, msgSoin);
          }
        };
        var callTrue = printTrue;
        var pvSoigneur;
        var callTrueFinal = callTrue;
        if (msg.content.includes(' --transfer')) { //paie avec ses PV
          if (soigneur === undefined) {
            error("Il faut préciser qui est le soigneur pour utiliser l'option --transfer", msg.content);
            soinImpossible = true;
            return;
          }
          pvSoigneur = parseInt(soigneur.token.get("bar1_value"));
          if (isNaN(pvSoigneur) || pvSoigneur <= 0) {
            if (display)
              addLineToFramedDisplay(display, "<b>" + name2 + "</b> : plus assez de PV pour le soigner");
            else
              sendChar(charId,
                "ne peut pas soigner " + name2 + ", " + sujet + " n'a plus de PV");
            soinImpossible = true;
            finSoin();
            return;
          }
          if (pvSoigneur < soins) {
            soins = pvSoigneur;
          }
          callTrueFinal = function(s) {
            evt.affectes.push({
              prev: {
                bar1_value: pvSoigneur
              },
              affecte: soigneur.token
            });
            updateCurrentBar(soigneur.token, 1, pvSoigneur - s);
            if (pvSoigneur == s) setState(soigneur, 'mort', true, evt);
            callTrue(s);
          };
        }
        soigneToken(token2, soins, evt, callTrueFinal, callMax);
        finSoin();
      }); //fin de iterCibles
    }); //fin du sendChat du jet de dés
  }

  //Deprecated
  function aoeSoin(msg) {
    var args = msg.content.split(' ');
    if (args.length < 2) {
      error("Pas assez d'arguments pour !cof-aoe-soin: " + msg.content, args);
      return;
    }
    var evt = {
      type: 'soins'
    };
    var soigneur;
    var soins;
    if (args[1] == "groupe") {
      if (msg.selected === undefined || msg.selected.length === 0) {
        error("Il faut sélectionner un token qui lance le sort de soins de groupe", msg);
        return;
      }
      if (msg.selected.length > 1) {
        error("Plusieurs tokens sélectionnés comme lançant le sort de soins de groupe.", msg.selected);
      }
      var persoSoigneur = tokenOfId(msg.selected[0]._id);
      if (persoSoigneur === undefined) {
        error("Le token sélectionné ne représente aucun personnage", tokSoigneur);
        return;
      }
      var tokSoigneur = persoSoigneur.token;
      var charIdSoigneur = persoSoigneur.charId;
      var niveau = charAttributeAsInt(charIdSoigneur, 'NIVEAU', 1);
      if (state.COFantasy.combat) {
        var dejaSoigne = charAttributeAsBool(charIdSoigneur, 'soinsDeGroupe');
        if (dejaSoigne) {
          sendChar(charIdSoigneur, " a déjà fait un soin de groupe durant ce combat");
          return;
        }
        setTokenAttr(persoSoigneur, 'soinsDeGroupe', true, evt);
      }
      if (!depenseMana(persoSoigneur, 1, "lancer un soin de groupe", evt))
        return;
      if (msg.content.includes(' --puissant')) {
        soins = randomInteger(10) + niveau;
      } else {
        soins = randomInteger(8) + niveau;
      }
      var nameSoigneur = tokSoigneur.get('name');
      soigneur = getObj('character', charIdSoigneur);
      msg.content += " --allies --self";
    } else { // soin générique
      soins = parseInt(args[1]);
      if (isNaN(soins) || soins < 1) {
        error(
          "L'argument de !cof-aoe-soin doit être un nombre positif",
          msg.content);
        return;
      }
    }
    if (soins <= 0) {
      sendChat('', "Pas de soins (total de soins " + soins + ")");
      return;
    }

    var action = "Soins de groupe";
    var display = startFramedDisplay(msg.playerid, action, soigneur);
    getSelected(msg, function(selected) {
      if (selected.length === 0) {
        addLineToFramedDisplay(display, "Aucune cible sélectionnée pour le soin");
        sendChat("", endFramedDisplay(display));
        addEvent(evt);
        return;
      }
      evt.affectes = evt.affectes || [];
      iterSelected(selected, function(perso) {
        var name = perso.token.get('name');
        var callMax = function() {
          addLineToFramedDisplay(display, "<b>" + name + "</b> : Pas besoin de soins.");
          return;
        };
        var callTrue = function(soinsEffectifs) {
          addLineToFramedDisplay(display,
            "<b>" + name + "</b> : + " + soinsEffectifs + " PV");
        };
        soigneToken(perso.token, soins, evt, callTrue, callMax);
      });
      sendChat("", endFramedDisplay(display));
      addEvent(evt);
    });
  }

  function natureNourriciere(msg) {
    getSelected(msg, function(selected) {
      iterSelected(selected, function(lanceur) {
        var charId = lanceur.charId;
        var duree = randomInteger(6);
        var output =
          "cherche des herbes. Après " + duree + " heures, " +
          onGenre(charId, "il", "elle");
        var evt = {
          type: "recherche d'herbes"
        };
        testCaracteristique(lanceur, 'SAG', [], 10, 0, evt,
          function(reussite, rollText) {
            if (reussite) {
              output += " revient avec de quoi soigner les blessés.";
            } else {
              output += " revient bredouille.";
            }
            sendChar(charId, output);
            addEvent(evt);
          });
      });
    });
  }

  function ignorerLaDouleur(msg) {
    getSelected(msg, function(selected) {
      iterSelected(selected, function(chevalier) {
        var charId = chevalier.charId;
        var token = chevalier.token;
        if (attributeAsInt(chevalier, 'ignorerLaDouleur', 0) > 0) {
          sendChar(charId, "a déjà ignoré la doubleur une fois pendant ce combat");
          return;
        }
        var lastAct = lastEvent();
        if (lastAct === undefined || lastAct.type != 'attaque') {
          sendChar(charId, "s'y prend trop tard pour ignorer la douleur : la dernière action n'était pas une attaque");
          return;
        }
        if (lastAct.affectes === undefined) {
          sendChar(charId, "ne peut ignorer la douleur : il semble que la dernière attaque n'ait affecté personne");
          return;
        }
        var affecte = lastAct.affectes.find(function(aff) {
          return (aff.affecte.id == token.id);
        });
        if (affecte === undefined || affecte.prev === undefined) {
          sendChar(charId, "ne peut ignorer la douleur : il semble que la dernière attaque ne l'ait pas affecté");
          return;
        }
        var lastBar1 = affecte.prev.bar1_value;
        var bar1 = parseInt(token.get('bar1_value'));
        if (isNaN(lastBar1) || isNaN(bar1) || lastBar1 <= bar1) {
          sendChar(charId, "ne peut ignorer la douleur : il semble que la dernière attaque ne lui ai pas enlevé de PV");
          return;
        }
        var evt = {
          type: 'ignorer_la_douleur',
          affectes: [{
            affecte: token,
            prev: {
              bar1_value: bar1
            }
          }]
        };
        updateCurrentBar(token, 1, lastBar1);
        setTokenAttr(chevalier, 'ignorerLaDouleur', lastBar1 - bar1, evt);
        sendChar(charId, " ignore la douleur de la dernière attaque");
      });
    });
  }

  function fortifiant(msg) {
    var cmd = msg.content.split(' ');
    if (cmd.length < 3) {
      error("La fonction !cof-fortifiant attend en argument celui qui a produit le fortifiant et celui qui en bénéficie", cmd);
      return;
    }
    var producteur = tokenOfId(cmd[1], cmd[1]);
    if (producteur === undefined) {
      error("Le premier argument de !cof-fortifiant doit être un token valide", cmd[1]);
      return;
    }
    var char1Id = producteur.charId;
    var pageId = producteur.token.get('pageid');
    var beneficiaire = tokenOfId(cmd[2], cmd[2], pageId);
    if (beneficiaire === undefined) {
      error("Le second argument de !cof-fortifiant doit être un token", cmd[2]);
      return;
    }
    var rang = charAttributeAsInt(char1Id, 'voieDesElixirs', 0);
    if (rang < 1) {
      sendChar(char1Id, "ne sait pas préparer des élixirs ?");
      return;
    }
    var nbFortifiants = attributeAsInt(producteur, 'fortifiants', 0);
    if (nbFortifiants < 1) {
      sendChar(char1Id, "n'a pas de fortifiant sur lui");
      return;
    }
    var evt = {
      type: 'fortifiant',
      attributes: []
    };
    // On enlève un fortifiant
    setTokenAttr(producteur, 'fortifiants', nbFortifiants - 1, evt);
    // Puis on soigne la cible
    var name2 = beneficiaire.token.get('name');
    var soins = randomInteger(4) + rang;
    soigneToken(beneficiaire.token, soins, evt, function(soinsEffectifs) {
      sendChar(char1Id, "donne à " + name2 + " un fortifiant");
      sendChar(beneficiaire.charId, "est soigné de " + soinsEffectifs + " PV");
    });
    // Finalement on met l'effet fortifie
    setTokenAttr(beneficiaire, 'fortifie', rang + 1, evt);
    addEvent(evt);
  }

  //Utilisé pour enlever l'argument @{selected|token_id} quand il était
  //inutile. argsNumber est le nombre d'arguments attendu, on n'enlève 
  //d'argument que si il y en a plus
  function removeSelectedTokenIdFromArgs(msg, argsNumber) {
    argsNumber = (isNaN(argsNumber) || argsNumber < 1) ? 1 : argsNumber;
    var cmd = msg.content.split(' ');
    if (cmd.length <= argsNumber) return cmd;
    if (msg.selected === undefined || msg.selected.length === 0) return cmd;
    if (cmd[1] == msg.selected[0]._id) cmd.splice(1, 1);
    return cmd;
  }

  function lancerSort(msg) {
    var cmd = removeSelectedTokenIdFromArgs(msg, 3);
    if (cmd.length < 3) {
      error("La fonction !cof-lancer-sort attend en argument le coût en mana", cmd);
      return;
    }
    cmd.shift();
    var mana = parseInt(cmd.shift());
    if (isNaN(mana) || mana < 0) {
      error("Le deuxième argument de !cof-lancer-sort doit être un nombre positif", msg.content);
      return;
    }
    var spell = cmd.join(' ');
    getSelected(msg, function(selected) {
      iterSelected(selected, function(lanceur) {
        var charId = lanceur.charId;
        var evt = {
          type: "lancement de sort"
        };
        if (depenseMana(lanceur, mana, spell, evt)) {
          sendChar(charId, "/w " + lanceur.token.get('name') + " " + spell);
          sendChar(charId, "/w GM " + spell);
          addEvent(evt);
        }
      });
    });
  }

  function murDeForce(msg) {
    var cmd = removeSelectedTokenIdFromArgs(msg, 2);
    if (cmd.length < 2) {
      error("La fonction !cof-mur-de-force attend en argument la forme du mur", cmd);
      return;
    }
    var sphere = true;
    if (cmd[1] == 'mur') sphere = false;
    getSelected(msg, function(selected) {
      iterSelected(selected, function(lanceur) {
        var charId = lanceur.charId;
        var token = lanceur.token;
        var pageId = lanceur.token.get('pageid');
        var options = {};
        var args = msg.content.split(' --');
        args.shift();
        args.forEach(function(opt) {
          var optCmd = opt.split(' ');
          switch (optCmd[0]) {
            case 'mana':
              if (optCmd.length < 2) {
                error("Il manque le coût en mana", cmd);
                options.mana = 5;
                return;
              }
              options.mana = parseInt(optCmd[1]);
              if (isNaN(options.mana) || options.mana < 0) {
                error("Coût en mana incorrect", optCmd);
                options.mana = 5;
              }
              return;
            case 'puissant':
              options.puissant = true;
              return;
            case 'image':
              if (optCmd.length < 2) {
                error("Il manque l'adresse de l'image", cmd);
                return;
              }
              options.image = optCmd[1];
              return;
            default:
              error("Option inconnue", cmd);
          }
        });
        var evt = {
          type: "Mur de force"
        };
        if (!depenseMana(lanceur, options.mana, "lancer un mur de force", evt)) {
          return;
        }
        sendChar(charId, "lance un sort de mur de force");
        if (options.image && sphere) {
          var PIX_PER_UNIT = 70;
          var page = getObj("page", pageId);
          var scale = page.get('scale_number');
          var diametre = PIX_PER_UNIT * (6 / scale);
          var imageFields = {
            _pageid: pageId,
            imgsrc: options.image,
            represents: '',
            left: token.get('left'),
            top: token.get('top'),
            width: diametre,
            height: diametre,
            layer: 'map',
            name: "Mur de force",
            isdrawing: true,
          };
          var newImage = createObj('graphic', imageFields);
          toFront(newImage);
          var duree = 5 + modCarac(charId, 'CHARISME');
          setTokenAttr(lanceur, 'murDeForce', duree, evt, undefined, getInit());
          setTokenAttr(lanceur, 'murDeForceId', newImage.id, evt);
        } else {
          sendChar(charId, "/w " + token.get('name') + " placer l'image du mur sur la carte");
        }
        addEvent(evt);
      });
    });
  }

  function tokensEnCombat() {
    var cmp = Campaign();
    var turnOrder = cmp.get('turnorder');
    if (turnOrder === '') return []; // nothing in the turn order
    turnOrder = JSON.parse(turnOrder);
    if (turnOrder.length === 0) return [];
    var tokens = [];
    turnOrder.forEach(function(a) {
      if (a.id == -1) return;
      tokens.push({
        _id: a.id
      });
    });
    return tokens;
  }

  function aUnCapitaine(cible, evt, pageId) {
    var charId = cible.charId;
    var token = cible.token;
    var attrs = findObjs({
      _type: 'attribute',
      _characterid: charId,
    });
    var attrCapitaine = attrs.find(function(a) {
      return (a.get('name') == 'capitaine');
    });
    if (attrCapitaine === undefined) return false;
    if (pageId === undefined) {
      pageId = token.get('pageid');
    }
    var nomCapitaine = attrCapitaine.get('current');
    var idCapitaine = attrCapitaine.get('max');
    var capitaine = tokenOfId(idCapitaine, nomCapitaine, pageId);
    var capitaineActif = attrs.find(function(a) {
      return (a.get('name') == 'capitaineActif');
    });
    if (capitaine && isActive(capitaine)) {
      if (capitaineActif) return true;
      setTokenAttr({
        charId: charId
      }, 'capitaineActif', true, evt);
      iterSelected(tokensEnCombat(), function(perso) {
        if (perso.charId == charId) updateInit(perso.token, evt);
      });
      return true;
    }
    if (capitaineActif) {
      removeTokenAttr({
        charId: charId
      }, 'capitaineActif', evt);
      iterSelected(tokensEnCombat(), function(perso) {
        if (perso.charId == charId) updateInit(perso.token, evt);
      });
    }
    return false;
  }


  function devientCapitaine(msg) {
    var cmd = msg.content.split(' ');
    if (cmd.length < 2) {
      error("La fonction !cof-capitaine attend en argument l'id du capitaine ou --aucun", cmd);
      return;
    }
    var remove;
    var capitaine;
    var nomCapitaine;
    if (cmd[1] == '--aucun') {
      remove = true;
    } else {
      capitaine = tokenOfId(cmd[1], cmd[1]);
      if (capitaine === undefined) {
        error("Le premier argument de !cof-lancer-sort doit être un token", cmd[1]);
        return;
      }
      nomCapitaine = capitaine.token.get('name');
    }
    var evt = {
      type: 'Capitaine'
    };
    getSelected(msg, function(selected) {
      iterSelected(selected, function(perso) {
        var charId = perso.charId;
        var token = perso.token;
        if (remove) {
          removeTokenAttr({
            charId: charId
          }, 'capitaine', evt);
          removeTokenAttr({
            charId: charId
          }, 'capitaineActif', evt);
          sendChat('COF', "/w GM " + token.get('name') + " n'a plus de capitaine");
        } else {
          if (token.id == capitaine.token.id) return;
          setTokenAttr({
              charId: charId
            }, 'capitaine', nomCapitaine, evt,
            undefined, capitaine.token.id);
          sendChat('COF', "/w GM " + nomCapitaine + " est le capitaine de " + token.get('name'));
        }
      });
      addEvent(evt);
    });
  }


  function distribuerBaies(msg) {
    if (msg.selected === undefined || msg.selected.length != 1) {
      error("Pour utiliser !cof-distribuer-baies, il faut sélectionner un token", msg);
      return;
    }
    var druide = tokenOfId(msg.selected[0]._id);
    if (druide === undefined) {
      error("Erreur de sélection dans !cof-distribuer-baies", msg.selected);
      return;
    }
    var niveau = charAttributeAsInt(druide, 'NIVEAU', 1);
    var evt = {
      type: "Distribution de baies magiques"
    };
    var action = "Distribue des baies";
    var display = startFramedDisplay(msg.playerid, action, druide);
    getSelected(msg, function(selected) {
      var tokensToProcess = selected.length;
      var sendEvent = function() {
        if (tokensToProcess == 1) {
          addEvent(evt);
          sendChat("", endFramedDisplay(display));
        }
        tokensToProcess--;
      };
      iterSelected(selected, function(perso) {
        var token = perso.token;
        var baie = attributeAsInt(perso, 'baieMagique', 0);
        if (baie >= niveau || baie < 0) return; //baie plus puissante ou déjà mangée
        setTokenAttr(perso, 'baieMagique', niveau, evt);
        var line = token.get('name') + " reçoit une baie";
        if (token.id == druide.token.id) line = token.get('name') + " en garde une pour lui";
        addLineToFramedDisplay(display, line);
        sendEvent();
      });
    });
  }

  function consommerBaie(msg) {
    if (msg.selected === undefined) {
      error("Il fait sélectionner un token pour !cof-consommer-baie", msg);
      return;
    }
    var evt = {
      type: "consommer une baie"
    };
    iterSelected(msg.selected, function(perso) {
      var charId = perso.charId;
      var baie = attributeAsInt(perso, 'baieMagique', 0);
      if (baie === 0) {
        sendChar(charId, "n'a pas de baie à manger");
        return;
      }
      if (baie < 0) {
        sendChar(charId, "a déjà mangé une baie aujourd'hui. Pas d'effet");
        return;
      }
      var soins = randomInteger(6) + baie;
      setTokenAttr(perso, 'baieMagique', -1, evt);
      soigneToken(perso.token, soins, evt, function(soinsEffectifs) {
        sendChar(charId, "mange une baie magique. Il est rassasié et récupère " + soinsEffectifs + " points de vie");
      });
    });
    addEvent(evt);
  }

  function replaceInline(msg) {
    if (_.has(msg, 'inlinerolls')) {
      msg.content = _.chain(msg.inlinerolls)
        .reduce(function(m, v, k) {
          m['$[[' + k + ']]'] = v.results.total || 0;
          return m;
        }, {})
        .reduce(function(m, v, k) {
          return m.replace(k, v);
        }, msg.content)
        .value();
    }
  }

  /* Quand on protège un allié, on stocke l'id et le nom du token dans un attribut 'protegerUnAllie' (champs current et max), et pour ce token, on met un 
   * attribut 'protegePar_nom' où nom est le nom du token protecteur, et qui contient l'id et le nom du token protecteur
   * Ces attributs disparaissent à la fin des combats */
  function protegerUnAllie(msg) {
    var args = msg.content.split(" ");
    if (args.length < 3) {
      error("Pas assez d'arguments pour !cof-proteger-un-allie: " + msg.content, args);
      return;
    }
    var protecteur = tokenOfId(args[1], args[1]);
    if (protecteur === undefined) {
      error("Le premier argument n'est pas un token valide", args[1]);
      return;
    }
    var tokenProtecteur = protecteur.token;
    var charIdProtecteur = protecteur.charId;
    var nameProtecteur = tokenProtecteur.get('name');
    var pageId = tokenProtecteur.get('pageid');
    var target = tokenOfId(args[2], args[2], pageId);
    if (target === undefined) {
      error("Le deuxième argument n'est pas un token valide: " + msg.content, args[2]);
      return;
    }
    var tokenTarget = target.token;
    if (tokenTarget.id == tokenProtecteur.id) {
      sendChar(charIdProtecteur, "ne peut pas se protéger lui-même");
      return;
    }
    var charIdTarget = target.charId;
    var nameTarget = tokenTarget.get('name');
    var evt = {
      type: "Protéger un allié"
    };
    var attrsProtecteur = tokenAttribute(protecteur, 'protegerUnAllie');
    var protegePar = 'protegePar_' + nameProtecteur;
    if (attrsProtecteur.length > 0) { //On protège déjà quelqu'un
      var previousTarget =
        tokenOfId(attrsProtecteur[0].get('current'),
          attrsProtecteur[0].get('max'), pageId);
      if (previousTarget) {
        if (previousTarget.token.id == tokenTarget.id) {
          sendChar(charIdProtecteur, "protège déjà " + nameTarget);
          return;
        }
        removeTokenAttr(previousTarget, protegePar, evt,
          "n'est plus protégé par " + nameProtecteur);
      }
    }
    setTokenAttr(protecteur, 'protegerUnAllie',
      tokenTarget.id, evt, "protège " + nameTarget, nameTarget);
    setTokenAttr(target, protegePar, tokenProtecteur.id, evt, undefined, nameProtecteur);
    addEvent(evt);
  }

  function actionDefensive(msg) {
    var cmd = msg.content.split(' ');
    var def = 2; //pour une défense simple
    var defMsg = "préfère se défendre pendant ce tour";
    if (cmd.length > 1) {
      switch (cmd[1]) {
        case 'totale':
          def = 4;
          defMsg = "se consacre entièrement à sa défense pendant ce tour";
          break;
        case 'simple':
          def = 2;
          break;
        default:
          error("Argument de !cof-action-defensive non reconnu", cmd);
      }
    }
    var evt = {
      type: "action défensive"
    };
    initiative(msg.selected, evt);
    iterSelected(msg.selected, function(perso) {
      setTokenAttr(perso, 'defenseTotale', def, evt, defMsg, state.COFantasy.tour);
    });
    addEvent(evt);
  }

  function strangulation(msg) {
    var args = msg.content.split(' ');
    if (args.length < 3) {
      error("Pas assez d'arguments pour !cof-strangulation: " + msg.content, args);
      return;
    }
    var necromancien = tokenOfId(args[1], args[1]);
    if (necromancien === undefined) {
      error("Le premier argument n'est pas un token", args[1]);
      return;
    }
    var charId1 = necromancien.charId;
    var pageId = necromancien.token.get('pageid');
    var target = tokenOfId(args[2], args[2], pageId);
    if (target === undefined) {
      error("Le deuxième argument n'est pas un token valide: " + msg.content, args[2]);
      return;
    }
    var charId2 = target.charId;
    var name2 = target.token.get('name');
    if (!attributeAsBool(target, 'strangulation')) {
      sendChar(charId1, "ne peut pas maintenir la strangulation. Il faut (re)lancer le cort");
      return;
    }
    var evt = {
      type: "Strangulation"
    };
    var dureeStrang = tokenAttribute(target, 'dureeStrangulation');
    var nouvelleDuree = 1;
    if (dureeStrang.length > 0) {
      nouvelleDuree = parseInt(dureeStrang[0].get('current'));
      if (isNaN(nouvelleDuree)) {
        log("Durée de strangulation n'est pas un nombre");
        log(dureeStrang);
        nouvelleDuree = 1;
      } else nouvelleDuree++;
    }
    setTokenAttr(target, 'dureeStrangulation', nouvelleDuree, evt, undefined, true);
    var deStrang = 6;
    if (msg.content.includes(' --puissant')) deStrang = 8;
    var dmgExpr = "[[1d" + deStrang + " ";
    var modInt = modCarac(charId1, 'INTELLIGENCE');
    if (modInt > 0) dmgExpr += "+" + modInt;
    else if (modInt < 0) dmgExpr += modInt;
    dmgExpr += "]]";
    sendChat('', dmgExpr, function(res) {
      var dmg = {
        type: 'magique',
        total: res[0].inlinerolls[0].results.total,
        display: buildinline(res[0].inlinerolls[0], 'normal', true),
      };
      dealDamage(target, dmg, [], evt, 1, {
          attaquant: necromancien
        }, undefined,
        function(dmgDisplay, dmg) {
          sendChar(charId1, "maintient sa strangulation sur " + name2 + ". Dommages : " + dmgDisplay);
          addEvent(evt);
        });
    });
  }


  function ombreMortelle(msg) {
    var args = msg.content.split(' ');
    if (args.length < 4) {
      error("Pas assez d'arguments pour " + args[0], args);
      return;
    }
    var lanceur = tokenOfId(args[1], args[1]);
    if (lanceur === undefined) {
      error("Le premier argument n'est pas un token valide", args[1]);
      return;
    }
    var pageId = lanceur.token.get('pageid');
    var cible = tokenOfId(args[2], args[2], pageId);
    if (cible === undefined) {
      error("La cible n'est pas un token valide", args[2]);
      return;
    }
    cible.name = cible.token.get('name');
    var duree = parseInt(args[3]);
    if (isNaN(duree) || duree <= 0) {
      error("La durée doit être un nombre positif", args);
      return;
    }
    var image = IMAGE_OMBRE;
    var options = {};
    var opts = msg.content.split(' --');
    opts.shift();
    opts.forEach(function(option) {
      var cmd = option.split(' ');
      switch (cmd[0]) {
        case 'portee':
          if (cmd.length < 2) {
            error("Il manque l'argument de --portee", msg.content);
            return;
          }
          options.portee = parseInt(cmd[1]);
          if (isNaN(options.portee) || options.portee < 0) {
            error("La portée doit être un nombre positif", cmd);
            options.portee = undefined;
          }
          return;
        case 'mana':
          if (cmd.length < 2) {
            error("Il manque l'argument de --mana", msg.content);
            return;
          }
          options.mana = parseInt(cmd[1]);
          if (isNaN(options.mana) || options.mana < 0) {
            error("Le coût en mana doit être un nombre positif", cmd);
            options.mana = undefined;
          }
          return;
        case 'image':
          if (cmd.length < 2) {
            error("Il manque l'argument de --mana", msg.content);
            return;
          }
          image = cmd[1];
          return;
        default:
          return;
      }
    });
    if (options.portee !== undefined) {
      var distance = distanceCombat(lanceur.token, cible.token, pageId);
      if (distance > options.portee) {
        sendChar(lanceur.charId, "est trop loind de " + cible.name +
          " pour animer son ombre");
        return;
      }
    }
    var evt = {
      type: "Ombre mortelle"
    };
    if (options.mana) {
      var msgMana = "invoquer une ombre mortelle";
      if (!depenseMana(lanceur, options.mana, msgMana, evt)) return;
    }
    copieToken(cible, image, IMAGE_OMBRE, "Ombre de " + cible.name, 'ombreMortelle', duree, pageId, evt);
    sendChar(lanceur.charId,
      "anime l'ombre de " + cible.name + ". Celle-ci commence à attaquer " +
      cible.name + "&nbsp;!");
    addEvent(evt);
  }

  function copieToken(cible, image1, image2, nom, effet, duree, pageId, evt) {
    var pv = parseInt(cible.token.get('bar1_value'));
    if (isNaN(pv)) {
      error("Token avec des PV qui ne sont pas un nombre", cible.token);
      return;
    }
    if (pv > 1) pv = Math.floor(pv / 2);
    var pvMax = parseInt(cible.token.get('bar1_max'));
    if (isNaN(pvMax)) {
      error("Token avec des PV max qui ne sont pas un nombre", cible.token);
      return;
    }
    if (pvMax > 1) pvMax = Math.floor(pvMax / 2);
    var tokenFields = {
      _pageid: pageId,
      imgsrc: image1,
      represents: cible.charId,
      left: cible.token.get('left') + 60,
      top: cible.token.get('top'),
      width: cible.token.get('width'),
      height: cible.token.get('height'),
      rotation: cible.token.get('rotation'),
      layer: 'objects',
      name: nom,
      bar1_value: pv,
      bar1_max: pvMax,
      bar2_value: cible.token.get('bar2_value'),
      bar2_max: cible.token.get('bar2_max'),
      bar3_value: cible.token.get('bar3_value'),
      bar3_max: cible.token.get('bar3_max'),
      showname: true,
      showplayers_name: true,
      showplayers_bar1: true,
    };
    var newToken;
    if (image1) newToken = createObj('graphic', tokenFields);
    if (newToken === undefined) {
      tokenFields.imgsrc = cible.token.get('imgsrc').replace("max", "thumb");
      newToken = createObj('graphic', tokenFields);
      if (newToken === undefined) {
        log(tokenFields.imgsrc);
        if (image2 && image2 != image1) {
          tokenFields.imgsrc = image2;
          newToken = createObj('graphic', tokenFields);
        }
        if (newToken === undefined) {
          error("L'image du token sélectionné n'a pas été uploadé, et l'image par défaut n'est pas correcte. Impossible de créer un token.", tokenFields);
          return;
        }
      }
    }
    setTokenAttr({
      token: newToken,
      charId: cible.charId
    }, effet, duree, evt, undefined, getInit());
    initiative([{
      _id: newToken.id
    }], evt);
  }

  //Attention : ne tient pas compte de la rotation !
  function intersection(pos1, size1, pos2, size2) {
    if (pos1 == pos2) return true;
    if (pos1 < pos2) return ((pos1 + size1 / 2) >= pos2 - size2 / 2);
    return ((pos2 + size2 / 2) >= pos1 - size1 / 2);
  }

  var labelsEscalier = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

  function escalier(msg) {
    getSelected(msg, function(selected) {
      if (selected.length === 0) {
        sendChat("COF", "/w " + msg.who + " !cof-escalier sans sélection de token");
        log("!cof-escalier requiert de sélectionner des tokens");
        return;
      }
      var pageId = getObj('graphic', selected[0]._id).get('pageid');
      var escaliers = findObjs({
        _type: 'graphic',
        _pageid: pageId,
        layer: 'gmlayer'
      });
      if (escaliers.length === 0) {
        sendChat("COF", "/w " + msg.who + " pas de token dans le layer GM");
        return;
      }
      iterSelected(selected, function(perso) {
        var token = perso.token;
        var posX = token.get('left');
        var sizeX = token.get('width');
        var posY = token.get('top');
        var sizeY = token.get('height');
        var sortieEscalier;
        var etages;
        escaliers.forEach(function(esc) {
          if (sortieEscalier) return;
          if (intersection(posX, sizeX, esc.get('left'), esc.get('width')) &&
            intersection(posY, sizeY, esc.get('top'), esc.get('height'))) {
            var escName = esc.get('name');
            var l = escName.length;
            if (l > 2) {
              etages = escName.substr(l - 2, 1);
              if (isNaN(etages)) return;
              var label = escName.substr(l - 1, 1);
              escName = escName.substr(0, l - 1);
              var i = labelsEscalier.indexOf(label);
              if (i == etages - 1) escName += labelsEscalier[0];
              else escName += labelsEscalier[i + 1];
              sortieEscalier = escaliers.find(function(esc2) {
                if (esc2.get('name') == escName) return true;
                return false;
              });
            }
          }
        });
        if (sortieEscalier) {
          token.set('left', sortieEscalier.get('left'));
          token.set('top', sortieEscalier.get('top'));
          return;
        }
        sendChat('COF', "/w " + msg.who + " " + token.get('name') + " n'est pas sur un escalier");
      });
    }); //fin getSelected
  }

  function defautDansLaCuirasse(msg) {
    var args = msg.content.split(' ');
    if (args.length < 3) {
      error("Pas assez d'arguments pour !cof-defaut-dans-la-cuirasse", args);
      return;
    }
    var tireur = tokenOfId(args[1], args[1]);
    if (tireur === undefined) {
      error("Le premier argument n'est pas un token valide", args[1]);
      return;
    }
    var pageId = tireur.token.get('pageid');
    var cible = tokenOfId(args[2], args[2], pageId);
    if (cible === undefined) {
      error("La cible n'est pas un token valide", args[2]);
      return;
    }
    var evt = {
      type: "Défaut dans la cuirasse"
    };
    setTokenAttr(cible, 'defautDansLaCuirasse_' + tireur.token.get('name'), 2, evt);
    sendChar(tireur.charId, "passe le tour à analyser les points faibles de " + cible.token.get('name'));
    addEvent(evt);
  }

  function postureDeCombat(msg) {
    var args = removeSelectedTokenIdFromArgs(msg, 4);
    if (args.length < 4) {
      error("Pas assez d'arguments pour !cof-posture-de-combat", args);
      return;
    }
    var bonus = parseInt(args[1]);
    var attrDebuf = args[2];
    if (attrDebuf != 'DEF' && attrDebuf != 'ATT' && attrDebuf != 'DM') {
      error("L'attribut à débuffer pour la posture de combat est incorrect", args);
      return;
    }
    var attrBuf = args[3];
    if (attrBuf != 'DEF' && attrBuf != 'ATT' && attrBuf != 'DM') {
      error("L'attribut à augmenter pour la posture de combat est incorrect", args);
      return;
    }
    getSelected(msg, function(selected) {
      iterSelected(selected, function(guerrier) {
        var charId = guerrier.charId;
        if (isNaN(bonus) || bonus < 1) {
          sendChar(charId, "doit choisir un bonus positif (pas " + args[1] + ") pour sa posture de combat");
          return;
        }
        var rang = charAttributeAsInt(charId, "voieDuSoldat", 0);
        if (rang > 0 && rang < bonus) {
          sendChar(charId, "ne peut choisir qu'un bonus inférieur à " + rang + " pour sa posture de combat");
          return;
        }
        var evt = {
          type: "Posture de combat"
        };
        if (attrBuf == attrDebuf) {
          sendChar(charId, "prend une posture de combat neutre");
          removeTokenAttr(guerrier, 'postureDeCombat', evt);
          addEvent(evt);
          return;
        }
        msg = "prend une posture ";
        switch (attrBuf) {
          case 'DEF':
            msg += "défensive";
            break;
          case 'ATT':
            msg += "offensive";
            break;
          case 'DM':
            msg += "puissante";
            break;
          default:
        }
        msg += " mais ";
        switch (attrDebuf) {
          case 'DEF':
            msg += "risquée";
            break;
          case 'ATT':
            msg += "moins précise";
            break;
          case 'DM':
            msg += "moins puissante";
            break;
          default:
        }
        setTokenAttr(guerrier, 'postureDeCombat', bonus, evt, msg,
          attrDebuf + "_" + attrBuf);
        addEvent(evt);
      });
    });
  }

  function tourDeForce(msg) {
    var args = removeSelectedTokenIdFromArgs(msg, 2);
    if (args.length < 2) {
      error("Il manque un argument à !cof-tour-de-force", args);
      return;
    }
    var seuil = parseInt(args[1]);
    var action = "<b>Capacité</b> : Tour de force";
    getSelected(msg, function(selected) {
      iterSelected(selected, function(barbare) {
        if (isNaN(seuil)) {
          sendChar(barbare.charId, "le seuil de difficulté du tour de force doit être un nombre");
          return;
        }
        var display = startFramedDisplay(msg.playerid, action, barbare);
        var evt = {
          type: "Tour de force"
        };
        testCaracteristique(barbare, 'FOR', [], seuil, 10, evt,
          function(reussite, rollText) {
            addLineToFramedDisplay(display, " Jet de force difficulté " + seuil);
            var smsg = barbare.token.get('name') + " fait " + rollText;
            if (reussite) {
              smsg += " => réussite";
            } else {
              smsg += " => échec";
            }
            addLineToFramedDisplay(display, smsg);
            sendChat("", "[[1d4]]", function(res) {
              var rolls = res[0];
              var explRoll = rolls.inlinerolls[0];
              var r = {
                total: explRoll.results.total,
                type: 'normal',
                display: buildinline(explRoll, 'normal')
              };
              var explications = [];
              dealDamage(barbare, r, [], evt, 1, {}, explications,
                function(dmgDisplay, dmg) {
                  var dmgMsg = "mais cela lui coûte " + dmgDisplay + " PV";
                  addLineToFramedDisplay(display, dmgMsg);
                  finaliseDisplay(display, explications, evt);
                });
            });
          });
      });
    });
  }

  function encaisserUnCoup(msg) {
    getSelected(msg, function(selected) {
      if (selected.length === 0) {
        error("Personne n'est sélectionné pour encaisser un coup", msg);
        return;
      }
      var lastAct = lastEvent();
      if (lastAct === undefined) {
        sendChat('', "Historique d'actions vide, pas d'action trouvée pour encaisser un coup");
        return;
      }
      if (lastAct.type != 'Attaque' || lastAct.succes === false) {
        sendChat('', "la dernière action n'est pas une attaque réussie, trop tard pour encaisser le coup d'une action précédente");
        return;
      }
      var attaque = lastAct.action;
      if (attaque.options.distance) {
        sendChat('', "Impossible d'encaisser le dernier coup, ce n'était pas une attaque au contact");
        return;
      }
      var toProceed;
      var evt = {
        type: "Encaisser un coup"
      };
      iterSelected(selected, function(chevalier) {
        if (!attributeAsBool(chevalier, 'encaisserUnCoup')) {
          sendChar(chevalier.charId, "n'est pas placé pour encaisser un coup");
          return;
        }
        var cible = attaque.cibles.find(function(target) {
          return (target.token.id === chevalier.token.id);
        });
        if (cible === undefined) {
          sendChar(chevalier.charId, "n'est pas la cible de la dernière attaque");
          return;
        }
        removeTokenAttr(chevalier, 'encaisserUnCoup', evt);
        cible.extraRD =
          charAttributeAsInt(chevalier, 'DEFARMURE', 0) *
          charAttributeAsInt(chevalier, 'DEFARMUREON', 1) +
          charAttributeAsInt(chevalier, 'DEFBOUCLIER', 0) *
          charAttributeAsInt(chevalier, 'DEFBOUCLIERON', 1);
        toProceed = true;
      }); //fin iterSelected
      if (toProceed) {
        undoEvent();
        var options = attaque.options;
        options.rollsAttack = attaque.rollsAttack;
        options.evt = evt;
        attack(attaque.player_id, attaque.attaquant, attaque, attaque.attack_label, options);
      }
    }); //fin getSelected
  }

  // asynchrone : on fait les jets du guerrier en opposition
  function absorberAuBouclier(msg) {
    getSelected(msg, function(selected) {
      if (selected.length === 0) {
        error("Personne n'est sélectionné pour absorber", msg);
        return;
      }
      var lastAct = lastEvent();
      if (lastAct === undefined) {
        sendChat('', "Historique d'actions vide, pas d'action trouvée pour absorber un coup ou un sort");
        return;
      }
      if (lastAct.type != 'Attaque' || lastAct.succes === false) {
        sendChat('', "la dernière action n'est pas une attaque réussie, trop tard pour absorber l'attaque précédente");
        return;
      }
      var attaque = lastAct.action;
      var options = attaque.options;
      options.rollsAttack = attaque.rollsAttack;
      options.evt = evt;
      var evt = {
        type: "absorber un "
      };
      var attrAbsorbe = 'absorberUn';
      if (options.sortilege) {
        evt.type += "sort";
        attrAbsorbe += "Sort";
      } else {
        evt.type += "coup";
        attrAbsorbe += "Coup";
      }
      var toProceed;
      var count = selected.length;
      iterSelected(selected, function(guerrier) {
        if (charAttributeAsInt(guerrier, 'DEFBOUCLIERON', 1) != 1) {
          sendChar(guerrier.charId, "ne porte pas son bouclier, il ne peut pas " + evt.type);
          count--;
          return;
        }
        if (!attributeAsBool(guerrier, attrAbsorbe)) {
          sendChar(guerrier.charId, "n'est pas placé pour " + evt.type);
          count--;
          return;
        }
        var cible = attaque.cibles.find(function(target) {
          return (target.token.id === guerrier.token.id);
        });
        if (cible === undefined) {
          sendChar(guerrier.charId, "n'est pas la cible de la dernière attaque");
          count--;
          return;
        }
        removeTokenAttr(guerrier, attrAbsorbe, evt);
        toProceed = true;
        var attackRollExpr = "[[" + computeDice(guerrier, 1) + "]]";
        sendChat('', attackRollExpr, function(res) {
          var rolls = res[0];
          var attackRoll = rolls.inlinerolls[0];
          var totalAbsorbe = attackRoll.results.total;
          var msgAbsorber = buildinline(attackRoll);
          var attBonus = charAttributeAsInt(guerrier, 'NIVEAU', 1);
          if (options.sortilege) {
            attBonus += modCarac(guerrier.charId, 'SAGESSE');
            attBonus += charAttributeAsInt(guerrier, 'ATKMAG_DIV', 0);
          } else {
            attBonus += modCarac(guerrier.charId, 'FORCE');
            attBonus += charAttributeAsInt(guerrier, 'ATKCAC_DIV', 0);
          }
          totalAbsorbe += attBonus;
          if (attBonus > 0) msgAbsorber += "+" + attBonus;
          else if (attBonus < 0) msgAbsorber += attBonus;
          var explAbsorber = [];
          var attAbsBonus = bonusAttaqueA(cible, cible.tokName, 'bouclier', evt, explAbsorber, {});
          var pageId = guerrier.token.get('pageid');
          bonusAttaqueD(cible, attaque.attaquant, 0, pageId, evt, explAbsorber, {}, function(bad) {
            attAbsBonus += bad;
            if (attAbsBonus > 0) msgAbsorber += "+" + attAbsBonus;
            else if (attAbsBonus < 0) msgAbsorber += attAbsBonus;
            explAbsorber.push(cible.tokName + " tente d'absorber l'attaque avec son bouclier. Il fait " + msgAbsorber);
            cible.absorber = totalAbsorbe;
            cible.absorberDisplay = msgAbsorber;
            cible.absorberExpl = explAbsorber;
            count--;
            if (count === 0) {
              toProceed = false;
              undoEvent();
              attack(attaque.player_id, attaque.attaquant, attaque, attaque.attack_label, options);
            }
          }); //fin bonusAttaqueD
        }); //fin lancé de dés asynchrone
      }); //fin iterSelected
      if (count === 0 && toProceed) {
        undoEvent();
        attack(attaque.player_id, attaque.attaquant, attaque, attaque.attack_label, options);
      }
    }); //fin getSelected
  }


  // modifie res et le retourne (au cas où il ne serait pas donné)
  function listRollResults(roll, res) {
    res = res || [];
    switch (roll.type) {
      case 'V': //top-level des rolls
        if (roll.rolls === undefined) break;
        roll.rolls.forEach(function(r) {
          listRollResults(r, res);
        });
        return res;
      case 'R': //jet simple
        if (roll.results === undefined) break;
        roll.results.forEach(function(r) {
          if (r.v) res.push(r.v);
          else if (r.d) res.push(r.d);
          else log("Type de résultat de dé inconnu " + r);
        });
        return res;
      case 'M':
      case 'L':
        return res;
      case 'G':
        if (roll.rolls === undefined) break;
        roll.rolls.forEach(function(ra) {
          ra.forEach(function(r) {
            listRollResults(r, res);
          });
        });
        return res;
      default:
        log("tag inconnu");
    }
    error("Structure de roll inconnue", roll);
    return res;
  }

  //category est un tableau de string, le premier élément étant la catégorie
  //principale, le suivant la sous-catégorie, etc
  //value peut être un nombre, un tableau de nombres, ou un inline roll
  function addStatistics(playerId, category, value) {
    if (state.COFantasy.statistiques === undefined) return;
    var stat = state.COFantasy.statistiques;
    if (playerId) {
      var player = getObj('player', playerId);
      if (player) {
        //On utilise l'id roll20 qui semble persistante
        var pid = player.get('d20userid');
        stat[pid] = stat[pid] || {};
        stat = stat[pid];
      }
    }
    if (category) {
      category.forEach(function(cat) {
        stat[cat] = stat[cat] || {};
        stat = stat[cat];
      });
    }
    if (!Array.isArray(value)) {
      if (value.results) value = listRollResults(value.results);
      else value = [value];
    }
    value.forEach(function(v) {
      if (isNaN(v)) {
        error("statistique sur une valeur qui n'est pas un nombre", value);
        return;
      }
      if (typeof v != 'number') v = parseInt(v);
      if (stat.total) stat.total += v;
      else stat.total = v;
      if (stat.nombre) stat.nombre++;
      else stat.nombre = 1;
    });
  }

  function displayStatCategory(stats, indent, categoryName, accum) {
    var res = {
      nombre: 0,
      total: 0,
    };
    if (stats.nombre) { //on peut afficher des résultats
      res.nombre = stats.nombre;
      res.total = stats.total;
    }
    var nindent = indent + "&nbsp;&nbsp;";
    var nAccum = [];
    for (var category in stats) {
      if (category == 'total' || category == 'nombre') break;
      var catRes = displayStatCategory(stats[category], nindent, category, nAccum);
      res.nombre += catRes.nombre;
      res.total += catRes.total;
    }
    var msg = "aucun jet cellecté";
    if (res.nombre > 0) {
      var moyenne = res.total / res.nombre;
      msg = res.nombre + " jet" + ((res.nombre > 1) ? "s" : "") + ", moyenne " + moyenne;
    }
    if (nAccum.length > 0) msg = indent + categoryName + " (" + msg + ") :";
    else msg = indent + categoryName + " : " + msg;
    accum.push(msg);
    nAccum.forEach(function(m) {
      accum.push(m);
    });
    return res;
  }

  function displayStatistics(msg) {
    var stats = state.COFantasy.statistiques;
    var display = startFramedDisplay(msg.playerid, "Statistiques");
    if (stats === undefined) {
      stats = state.COFantasy.statistiquesEnPause;
      if (stats)
        addLineToFramedDisplay(display, "Statistiques en pause");
      else {
        addLineToFramedDisplay(display, "Aucune statistique collectée");
        sendChat("COF", endFramedDisplay(display));
        return;
      }
    }
    var tot = {
      total: 0,
      nombre: 0
    };
    var players = findObjs({
      type: 'player'
    });
    var findPlayer = function(pid) {
      return players.find(function(p) {
        return (p.get('d20userid') == pid);
      });
    };
    var addMessages = function(mv) {
      mv.forEach(function(m) {
        addLineToFramedDisplay(display, m);
      });
    };
    for (var category in stats) {
      //first, check if the category is a player id
      var pl = findPlayer(category);
      var catName = category;
      if (pl) catName = pl.get('displayname');
      var accum = [];
      var catRes = displayStatCategory(stats[category], "", catName, accum);
      addMessages(accum);
      tot.total += catRes.total;
      tot.nombre += catRes.nombre;
    }
    addLineToFramedDisplay(display, tot.nombre + " jets au total, dont la somme fait " + tot.total);
    sendChat("COF", endFramedDisplay(display));
  }

  function destructionDesMortsVivants(msg) {
    var args = removeSelectedTokenIdFromArgs(msg, 2);
    if (args.length < 2) {
      error("Il faut au moins un argument à !cof-destruction-des-morts-vivants", args);
      return;
    }
    args.shift();
    var dm = args.join(' ');
    dm = dm.replace(/%/g, '&#37;');
    dm = dm.replace(/\)/g, '&#41;');
    dm = dm.replace(/\?/g, '&#63;');
    dm = dm.replace(/@/g, '&#64;');
    dm = dm.replace(/\[/g, '&#91;');
    dm = dm.replace(/\]/g, '&#93;');
    getSelected(msg, function(selected) {
      iterSelected(selected, function(lanceur) {
        var evt = {
          type: "Destruction des morts-vivants"
        };
        var display = startFramedDisplay(msg.playerid, "<b>Sort :<b> destruction des morts-vivants", lanceur);
        var name = lanceur.token.get('name');
        testCaracteristique(lanceur, 'SAG', [], 13, 0, evt,
          function(reussite, rollText) {
            var msgJet = "Jet de SAG : " + rollText;
            if (reussite) {
              var eventId = state.COFantasy.eventId;
              var action = "!cof-aoe &lbrack;&lbrack;" + dm + "&rbrack;&rbrack; --once " + eventId + " --morts-vivants";
              evt.waitingForAoe = true;
              addLineToFramedDisplay(display, msgJet + " &ge; 13");
              sendChat(name, endFramedDisplay(display));
              sendChat('COF', "/w GM Sélectionner les token en vue de " + name + ", et [cliquer ici](" + action + ")");
            } else {
              addLineToFramedDisplay(display, msgJet + " < 13");
              addLineToFramedDisplay(display, name + " ne réussit pas à invoquer son dieu.");
              sendChat(name, endFramedDisplay(display));
            }
            addEvent(evt);
          });
      });
    });
  }

  function enduireDePoison(msg) {
    var optArgs = msg.content.split(' --');
    var cmd = optArgs[0].split(' ');
    optArgs.shift();
    if (cmd.length < 5) {
      error("Usage : !cof-enduire-poison L type force save", cmd);
      return;
    }
    var labelArme = cmd[1];
    var typePoison = cmd[2];
    if (typePoison != 'rapide') {
      error("le seul type de poison géré est rapide, pas " + typePoison, cmd);
    }
    var attribut = 'poisonRapide_' + labelArme;
    var forcePoison = cmd[3];
    var savePoison = parseInt(cmd[4]);
    if (isNaN(savePoison)) {
      error("Le dernier argument non optionnel doit être la difficulté du test de CON", cmd);
      return;
    }
    var testINT = 14;
    var dose;
    var decrAttribute;
    var proprio;
    optArgs.forEach(function(arg) {
      cmd = arg.split(' ');
      switch (cmd[0]) {
        case 'testINT':
          if (cmd.length < 2) {
            error("Il faut un argument à --testINT", cmd);
            return;
          }
          testINT = parseInt(cmd[1]);
          if (isNaN(testINT)) {
            error("Argument de --testINT invalide", cmd);
            testINT = 14;
          }
          return;
        case 'dose':
          if (cmd.length < 2) {
            error("Il manque le nom de la dose de poison", cmd);
            return;
          }
          dose = cmd[1];
          return;
        case 'decrAttribute':
          if (cmd.length < 2) {
            error("Erreur interne d'une commande générée par bouton", cmd);
            return;
          }
          var attr = getObj('attribute', cmd[1]);
          if (attr === undefined) {
            log("Attribut à changer perdu");
            log(cmd);
            return;
          }
          decrAttribute = attr;
          return;
        case 'contactDuToken':
          if (cmd.length < 2) {
            error("Erreur interne d'une commande générée par bouton", cmd);
            return;
          }
          proprio = cmd[1];
          return;
      }
    }); //fin du traitement des options
    getSelected(msg, function(selected) {
      iterSelected(selected, function(perso) {
        if (proprio && perso.token.id != proprio) {
          sendChar(perso.charId, "ne peut pas utiliser un poison qu'il n'a pas");
          return;
        }
        var name = perso.token.get('name');
        var att = getAttack(labelArme, name, perso.charId);
        if (att === undefined) {
          error(name + " n'a pas d'arme associée au label " + labelArme, cmd);
          return;
        }
        if (attributeAsBool(perso, attribut)) {
          sendChar(perso.charId, att.weaponName + " est déjà enduit de poison.");
          return;
        }
        var evt = {
          type: "Enduire de poison"
        };
        var display = startFramedDisplay(msg.playerid, "Essaie d'enduire " + att.weaponName + " de poison", perso);
        if (dose) {
          var nomDose = dose.replace(/_/g, ' ');
          var doseAttr = tokenAttribute(perso, 'dose_' + dose);
          if (doseAttr.length === 0) {
            sendChar(perso.charId, "n'a pas de dose de " + nomDose);
            return; //evt toujours vide
          }
          doseAttr = doseAttr[0];
          var nbDoses = parseInt(doseAttr.get('current'));
          if (isNaN(nbDoses) || nbDoses < 1) {
            sendChar(perso.charId, "n'a plus de dose de " + nomDose);
            return; //evt toujours vide
          }
          evt.attributes = evt.attributes || [];
          evt.attributes.push({
            attribute: doseAttr,
            current: nbDoses
          });
          //À partir de ce point, tout return doit ajouter evt
          nbDoses--;
          addLineToFramedDisplay(display, "Il restera " + nbDoses + " dose de " + nomDose + " à " + name);
          doseAttr.set('current', nbDoses);
        }
        if (decrAttribute) {
          var oldval = parseInt(decrAttribute.get('current'));
          if (isNaN(oldval) || oldval < 1) {
            sendChar(perso.charId, "n'a plus de ce poison");
            return;
          }
          evt.attributes = evt.attributes || [];
          evt.attributes.push({
            attribute: decrAttribute,
            current: oldval,
            max: decrAttribute.get('max')
          });
          decrAttribute.set('current', oldval - 1);
        }
        //Test d'INT pour savoir si l'action réussit.
        testCaracteristique(perso, 'INT', [], testINT, 0, evt,
          function(reussite, rtext) {
            var jet = "Jet d'INT : " + rtext;
            if (reussite === undefined) { //échec critique
              jet += " Échec critique !";
              addLineToFramedDisplay(display, jet);
              addLineToFramedDisplay(display, name + " s'empoisonne.");
              sendChat('', "[[" + forcePoison + "]]", function(res) {
                var rolls = res[0];
                var dmgRoll = rolls.inlinerolls[0];
                var r = {
                  total: dmgRoll.results.total,
                  type: 'poison',
                  display: buildinline(dmgRoll, 'poison')
                };
                var ps = {
                  partialSave: {
                    carac: 'CON',
                    seuil: savePoison
                  }
                };
                var explications = [];
                dealDamage(perso, r, [], evt, 1, ps, explications,
                  function(dmgDisplay, dmg) {
                    explications.forEach(function(e) {
                      addLineToFramedDisplay(display, e);
                    });
                    addLineToFramedDisplay(name + " subit " + dmgDisplay + " DM");
                    addEvent(evt);
                    sendChat("", endFramedDisplay(display));
                  }); //fin de dmg dus à l'échec critique
              }); //fin du jet de dmg
              return;
            } else if (reussite) {
              jet += " &ge; " + testINT;
              addLineToFramedDisplay(display, jet);
              setTokenAttr(perso, attribut, forcePoison, evt, undefined, savePoison);
              addLineToFramedDisplay(display, att.weaponName + " est maintenant enduit de poison");
              addEvent(evt);
              sendChat("", endFramedDisplay(display));
              return;
            } else { //echec normal au jet d'INT
              jet += " < " + testINT + " : échec";
              addLineToFramedDisplay(display, jet);
              addEvent(evt);
              sendChat("", endFramedDisplay(display));
              return;
            }
          }); //fin du test de carac
      }); //fin de iterSelected
    }); //fin de getSelected
  }

  function listeConsommables(msg) {
    getSelected(msg, function(selected) {
      iterSelected(selected, function(perso) {
        if (perso.token.get('bar1_link') === '') {
          error("La liste de consommables n'est pas au point pour les tokens non liés", perso);
          return;
        }
        var display = startFramedDisplay(msg.playerid, "Liste des consommables", perso);
        var attributes = findObjs({
          _type: 'attribute',
          _characterid: perso.charId
        });
        attributes.forEach(function(attr) {
          var attrName = attr.get('name');
          if (!(attrName.startsWith('dose_') || attrName.startsWith('consommable_'))) return;
          var consName = attrName.substring(attrName.indexOf('_') + 1);
          consName = consName.replace(/_/g, ' ');
          var quantite = parseInt(attr.get('current'));
          if (isNaN(quantite) || quantite < 1) {
            addLineToFramedDisplay(display, "0 " + consName);
            return;
          }
          var action = attr.get('max');
          var ligne = quantite + ' ';
          if (action !== '') {
            if (action.startsWith('!')) {
              action += " --decrAttribute " + attr.id + " --contactDuToken " + perso.token.id;
            } else {
              action = "!cof-utilise-consommable " + perso.token.id + " " + attr.id + " --message " + action;
            }
            action = action.replace(/%/g, '&#37;').replace(/\)/g, '&#41;').replace(/\?/g, '&#63;').replace(/@/g, '&#64;').replace(/\[/g, '&#91;').replace(/]/g, '&#93;');
            action = action.replace(/\'/g, '&apos;'); // escape quotes
            ligne += "<a href='" + action + "'>";
          }
          ligne += consName;
          if (action !== '') ligne += "</a>";
          addLineToFramedDisplay(display, ligne);
        }); //fin de la boucle sur les attributs
        sendChat('', endFramedDisplay(display));
      });
    }); //fin du getSelected
  }

  // Le premier argument est l'id du token, le deuxième est l'id de l'attribut,
  // le reste est le message à afficher
  function utiliseConsommable(msg) {
    var cmd = msg.content.split(' ');
    if (cmd.length < 3) {
      error("Erreur interne de consommables", cmd);
      return;
    }
    var perso = tokenOfId(cmd[1]);
    if (perso === undefined) {
      log("Propriétaire perdu");
      sendChat('COF', "Plus possible d'utiliser cette action. Réafficher les consommables.");
      return;
    }
    // Vérifie les droits d'utiliser le consommable
    if (msg.selected && msg.selected.length == 1) {
      var utilisateur = tokenOfId(msg.selected[0]._id);
      if (utilisateur === undefined) {
        sendChat('COF', "Le token sélectionné n'est pas valide");
        return;
      }
      var d = distanceCombat(perso.token, utilisateur.token);
      if (d > 0) {
        sendChar(utilisateur.charId, "est trop loin de " + perso.token.get('name') + " pour utiliser ses objets");
        return;
      }
      perso = utilisateur;
    } else { //On regarde si le joueur contrôle le token
      if (!msg.who.endsWith("(GM)")) {
        var character = getObj('character', perso.charId);
        if (character === undefined) {
          sendChat('COF', "Le token sélectionné n'est pas valide");
          return;
        }
        var ctrl = character.get('controlledby').split(',');
        var ctrlOk = ctrl.findIndex(function(ct) {
          if (ct == 'all') return true;
          if (ct == msg.playerid) return true;
          return false;
        });
        if (ctrlOk < 0) {
          sendChat('COF', "Pas les droits pour ça");
          return;
        }
      }
    }
    var attr = getObj('attribute', cmd[2]);
    if (attr === undefined) {
      log("Attribut à changer perdu");
      log(cmd);
      sendChat('COF', "Plus possible d'utiliser cette action. Réafficher les consommables.");
      return;
    }
    var oldval = parseInt(attr.get('current'));
    if (isNaN(oldval) || oldval < 1) {
      sendChat('COF', "Plus a déjà été utilisé");
      return;
    }
    var evt = {
      type: "Utilisation de consommable",
      attributes: []
    };
    evt.attributes.push({
      attribute: attr,
      current: oldval,
      max: attr.get('max')
    });
    attr.set('current', oldval - 1);
    var start = msg.content.indexOf(' --message ') + 10;
    sendChar(perso.charId, msg.content.substring(start));
    addEvent(evt);
  }

  //asynchrone
  //callback(resultat, crit):
  // resultat peut être 0, 1 ou 2 : 0 = match null, 1 le perso 1 gagne, 2 le perso 2 gagne.
  // crit peut être 1 si un des deux perso a fait une réussite critique et pas l'autre, -1 si un des personnage a fait un échec critique et pas l'autre, et 0 sinon
  function testOppose(perso1, carac1, perso2, carac2, explications, evt, callback) {
    if (carac2 === undefined) carac2 = carac1;
    var nom1 = perso1.token.get('name');
    var nom2 = perso2.token.get('name');
    jetCaracteristique(perso1, carac1, function(rt1, tot1, d20_1) {
      jetCaracteristique(perso2, carac2, function(rt2, tot2, d20_2) {
        explications.push("Jet de " + carac1 + " de " + nom1 + " :" + rt1);
        explications.push("Jet de " + carac2 + " de " + nom2 + " :" + rt2);
        var reussite;
        var crit = 0;
        if (tot1 > tot2) reussite = 1;
        else if (tot2 > tot1) reussite = 2;
        else reussite = 0;
        if (d20_1 == 1) {
          if (d20_2 > 1) {
            reussite = 2;
            crit = -1;
          }
        } else if (d20_2 == 1) {
          reussite = 1;
          crit = -1;
        } else if (d20_1 == 20) {
          if (d20_2 < 20) {
            reussite = 1;
            crit = 1;
          }
        } else if (d20_2 == 20) {
          reussite = 2;
          crit = 1;
        }
        switch (reussite) {
          case 1:
            diminueMalediction(perso2, evt);
            break;
          case 2:
            diminueMalediction(perso1, evt);
            break;
        }
        callback(reussite, crit);
      }); //Fin du jet du deuxième perso
    }); //Fin du jet du premier perso
  }

  function provocation(msg) {
    var args = msg.content.split(' --');
    var cmd = args[0].split(' ');
    if (cmd.length < 3) {
      error("La commande !cof-provocation requiert 2 arguments", cmd);
      return;
    }
    var voleur = tokenOfId(cmd[1]);
    if (voleur === undefined) {
      error("Le premier argument de !cof-provocation n'est pas un token valide");
      return;
    }
    var cible = tokenOfId(cmd[2]);
    if (cible === undefined) {
      error("Le deuxième argument de !cof-provocation n'est pas un token valide");
      return;
    }
    var nomVoleur = voleur.token.get('name');
    var nomCible = cible.token.get('name');
    var display =
      startFramedDisplay(msg.playerid, 'Provocation', voleur, cible);
    var evt = {
      type: 'Provocation'
    };
    var jets = [];
    testOppose(voleur, 'CHA', cible, 'INT', jets, evt, function(res, crit) {
      jets.forEach(function(l) {
        addLineToFramedDisplay(display, l);
      });
      var reussite;
      switch (res) {
        case 0: //en cas d'égalité, on considère que la provocation est réussie
          diminueMalediction(cible, evt);
          switch (crit) {
            case -1:
              reussite = "Sur un malentendu, la provocation réussit...";
              break;
            case 0:
            case 1:
              reussite = "La provocation réussit tout juste.";
          }
          break;
        case 1:
          switch (crit) {
            case -1:
              reussite = nomCible + " marche complètement, il attaque " + nomVoleur;
              break;
            case 0:
              reussite = "La provocation réussit.";
              break;
            case 1:
              reussite = "La provocation est une réussite critique !";
          }
          break;
        case 2:
          switch (crit) {
            case -1:
              reussite = "Échec critique de la provocation !";
              break;
            case 0:
              reussite = "La provocation échoue";
              break;
            case 1:
              reussite = nomCible + " voit clair dans le jeu de " + nomCible + ". La provocation échoue.";
          }
      }
      addLineToFramedDisplay(display, reussite);
      addEvent(evt);
      sendChat('', endFramedDisplay(display));
    }); //Fin du test opposé
  }

  function enSelle(msg) {
    var cmd = msg.content.split(' ');
    if (cmd.length < 3) {
      error("Il faut 2 arguments pour !cof-en-selle", cmd);
      return;
    }
    var cavalier = tokenOfId(cmd[1]);
    if (cavalier === undefined) {
      error("Premier argument de !cof-en-selle incorrect", cmd);
      return;
    }
    if (attributeAsBool(cavalier, 'monteSur')) {
      sendChar(cavalier.charId, " est déjà en selle");
      return;
    }
    var tokenC = cavalier.token;
    var pageId = tokenC.get('pageid');
    var monture = tokenOfId(cmd[2], cmd[2], pageId);
    if (monture === undefined || !charAttributeAsBool(monture, 'monture')) {
      sendChar(cavalier.charId, " ne peut pas monter là-dessus");
      log(cmd);
      return;
    }
    var tokenM = monture.token;
    var nomMonture = tokenM.get('name');
    if (attributeAsBool(monture, 'estMontePar')) {
      sendChar(cavalier.charId, " ne peut monter sur " + nomMonture + " car elle a déjà un cavalier");
      return;
    }
    if (distanceCombat(tokenC, tokenM, pageId) > 0) {
      sendChar(cavalier.charId, " est trop loin de " + nomMonture);
      return;
    }
    var evt = {
      type: 'En selle'
    };
    setTokenAttr(cavalier, 'monteSur', tokenM.id, evt, " monte sur " + nomMonture, nomMonture);
    setTokenAttr(monture, 'estMontePar', tokenC.id, evt, undefined, tokenC.get('name'));
    setTokenAttr(monture, 'positionSurMonture', tokenC.get('left') - tokenM.get('left'), evt, undefined, tokenC.get('top') - tokenM.get('top'));
    setTokenAttr(monture, 'directionSurMonture', tokenC.get('rotation') - tokenM.get('rotation'), evt);
    addEvent(evt);
  }

  function apiCommand(msg) {
    msg.content = msg.content.replace(/\s+/g, ' '); //remove duplicate whites
    var command = msg.content.split(" ", 1);
    // First replace inline rolls by their values
    if (command[0] != "!cof-aoe") replaceInline(msg);
    var evt;
    switch (command[0]) {
      case "!cof-jet":
        jet(msg);
        return;
      case "!cof-resultat-jet":
        resultatJet(msg);
        return;
      case "!cof-attack":
        parseAttack(msg);
        return;
      case "!cof-undo":
        undoEvent();
        return;
      case "!cof-hors-combat":
        sortirDuCombat();
        return;
      case "!cof-nuit":
        nuit(msg);
        return;
      case "!cof-jour":
        evt = {
          type: "Nouveau jour"
        };
        jour(evt);
        addEvent(evt);
        return;
      case "!cof-recuperation":
        recuperer(msg);
        return;
      case "!cof-recharger":
        recharger(msg);
        return;
      case "!cof-chance":
        chance(msg);
        return;
      case "!cof-surprise":
        surprise(msg);
        return;
      case "!cof-init":
        if (!_.has(msg, 'selected')) {
          error("Dans !cof-init : rien à faire, pas de token selectionné", msg);
          return;
        }
        evt = {
          type: "initiative"
        };
        initiative(msg.selected, evt);
        addEvent(evt);
        return;
      case "!cof-attendre":
        attendreInit(msg);
        return;
      case "!cof-statut":
        statut(msg);
        return;
      case "!cof-armure-magique":
        armureMagique(msg);
        return;
      case "!cof-buf-def":
        bufDef(msg);
        return;
      case "!cof-remove-buf-def":
        removeBufDef(msg);
        return;
      case "!cof-aoe":
        aoe(msg);
        return;
      case "!cof-set-state":
        interfaceSetState(msg);
        return;
      case "!cof-degainer":
        degainer(msg);
        return;
      case "!cof-echange-init":
        echangeInit(msg);
        return;
      case "!cof-a-couvert":
        aCouvert(msg);
        return;
      case "!cof-effet-temp":
        effetTemporaire(msg);
        return;
      case "!cof-effet-combat":
        effetCombat(msg);
        return;
      case "!cof-effet":
        effetIndetermine(msg);
        return;
      case "!cof-attaque-magique":
        attaqueMagique(msg);
        return;
      case "!cof-sommeil":
        sommeil(msg);
        return;
      case "!cof-transe-guerison":
        transeGuerison(msg);
        return;
      case "!cof-soin":
        soigner(msg);
        return;
      case "!cof-aoe-soin": //Deprecated
        aoeSoin(msg);
        return;
      case "!cof-nature-nourriciere":
        natureNourriciere(msg);
        return;
      case "!cof-ignorer-la-douleur":
        ignorerLaDouleur(msg);
        return;
      case "!cof-fortifiant":
        fortifiant(msg);
        return;
      case "!cof-intercepter":
        intercepter(msg);
        return;
      case "!cof-exemplaire":
        exemplaire(msg);
        return;
      case "!cof-lancer-sort":
        lancerSort(msg);
        return;
      case "!cof-peur":
        peur(msg);
        return;
      case "!cof-distribuer-baies":
        distribuerBaies(msg);
        return;
      case "!cof-consommer-baie":
        consommerBaie(msg);
        return;
      case "!cof-proteger-un-allie":
        protegerUnAllie(msg);
        return;
      case "!cof-action-defensive":
        actionDefensive(msg);
        return;
      case "!cof-strangulation":
        strangulation(msg);
        return;
      case "!cof-ombre-mortelle":
        ombreMortelle(msg);
        return;
      case "!cof-escalier":
        escalier(msg);
        return;
      case "!cof-defaut-dans-la-cuirasse":
        defautDansLaCuirasse(msg);
        return;
      case "!cof-posture-de-combat":
        postureDeCombat(msg);
        return;
      case "!cof-mur-de-force":
        murDeForce(msg);
        return;
      case "!cof-capitaine":
        devientCapitaine(msg);
        return;
      case "!cof-tueur-fantasmagorique":
        tueurFantasmagorique(msg);
        return;
      case "!cof-tour-de-force":
        tourDeForce(msg);
        return;
      case "!cof-encaisser-un-coup":
        encaisserUnCoup(msg);
        return;
      case "!cof-absorber-au-bouclier":
        absorberAuBouclier(msg);
        return;
      case "!cof-demarrer-statistiques":
        if (state.COFantasy.statistiquesEnPause) {
          state.COFantasy.statistiques = state.COFantasy.statistiquesEnPause;
          state.COFantasy.statistiquesEnPause = undefined;
        } else {
          state.COFantasy.statistiques = {}; //remet aussi les statistiques à 0
        }
        return;
      case "!cof-arreter-statistiques":
        state.COFantasy.statistiques = undefined;
        return;
      case "!cof-pause-statistiques":
        if (state.COFantasy.statistiques) {
          state.COFantasy.statistiquesEnPause = state.COFantasy.statistiques;
          state.COFantasy.statistiques = undefined;
        } // sinon, ne pas écraser les statistiques déjà en pause
        return;
      case "!cof-statistiques":
        displayStatistics(msg);
        return;
      case "!cof-destruction-des-morts-vivants":
        destructionDesMortsVivants(msg);
        return;
      case "!cof-enduire-poison":
        enduireDePoison(msg);
        return;
      case "!cof-consommables":
        listeConsommables(msg);
        return;
      case "!cof-utilise-consommable": //Usage interne seulement
        utiliseConsommable(msg);
        return;
      case "!cof-provocation":
        provocation(msg);
        return;
      case "!cof-en-selle":
        enSelle(msg);
        return;
      default:
        return;
    }
  }

  var messageEffetTemp = {
    sous_tension: {
      activation: "se charge d'énergie électrique",
      actif: "est chargé d'énergie électrique",
      fin: "n'est plus chargé d'énergie électrique"
    },
    a_couvert: {
      activation: "reste à couvert",
      actif: "est à couvert",
      fin: "n'est plas à couvert"
    },
    image_decalee: {
      activation: "décale légèrement son image",
      actif: "a décalé son image",
      fin: "apparaît à nouveau là où il se trouve"
    },
    chant_des_heros: {
      activation: "écoute le chant du barde",
      actif: "est inspiré par le Chant des Héros",
      fin: "n'est plus inspiré par le Chant des Héros"
    },
    benediction: {
      activation: "est touché par la bénédiction",
      actif: "est béni",
      fin: "l'effet de la bénédiction s'estompe"
    },
    peau_d_ecorce: {
      activation: "donne à sa peau la consistance de l'écorce",
      actif: "a la peau dure comme l'écorce",
      fin: "retrouve une peau normale"
    },
    rayon_affaiblissant: {
      activation: "est touché par un rayon affaiblissant",
      actif: "est sous l'effet d'un rayon affaiblissant",
      fin: "n'est plus affaibli"
    },
    peur: {
      activation: "prend peur",
      actif: "est dominé par sa peur",
      fin: "retrouve du courage"
    },
    peurEtourdi: {
      activation: "prend peur: il peut fuir ou rester recroquevillé",
      actif: "est paralysé par la peur",
      fin: "retrouve du courage et peut à nouveau agir"
    },
    aveugleTemp: {
      activation: "n'y voit plus rien !",
      actif: "", //Déjà affiché avec l'état aveugle
      fin: "retrouve la vue"
    },
    ralentiTemp: {
      activation: "est ralenti : une seule action, pas d'action limitée",
      actif: "", //Déjà affiché avec l'état ralenti
      fin: "n'est plus ralenti"
    },
    epeeDansante: {
      activation: "fait apparaître une lame d'énergie lumineuse",
      actif: "contrôle une lame d'énergie lumineuse",
      fin: "La lame d'énergie lumineuse disparaît"
    },
    putrefaction: {
      activation: "vient de contracter une sorte de lèpre fulgurante",
      actif: "est en pleine putréfaction",
      fin: "La putréfaction s'arrête."
    },
    forgeron: {
      activation: "enflamme son arme",
      actif: "a une arme en feu",
      fin: "L'arme n'est plus enflammée."
    },
    dmgArme1d6: {
      activation: "enduit son arme d'une huile magique",
      actif: "a une arme plus puissante",
      fin: "L'arme retrouve sa puissance normale"
    },
    agrandissement: {
      activation: "se met à grandir",
      actif: "est vraiment très grand",
      fin: "retrouve sa taille normale"
    },
    formeGazeuse: {
      activation: "semble perdre de la consistance",
      actif: "est en forme gazeuse",
      fin: "retrouve sa consistance normale"
    },
    intangible: {
      activation: "devient translucide",
      actif: "est intangible",
      fin: "redevient solide"
    },
    strangulation: {
      activation: "commence à étouffer",
      actif: "est étranglé",
      fin: "respire enfin"
    },
    ombreMortelle: {
      activation: "voit son ombre s'animer et l'attaquer !",
      actif: "est une ombre animée",
      fin: "retrouve une ombre normale"
    },
    dedoublement: {
      activation: "voit un double translucide sortir de lui",
      actif: "est un double translucide",
      fin: "le double disparaît"
    },
    zoneDeSilence: {
      activation: "n'entend plus rien",
      actif: "est totalement sourd",
      fin: "peut à nouveau entendre"
    },
    danseIrresistible: {
      activation: "se met à danser",
      actif: "danse malgré lui",
      fin: "s'arrête de danser"
    },
    confusion: {
      activation: "ne sait plus très bien ce qu'il fait là",
      actif: "est en pleine confusion",
      fin: "retrouve ses esprits"
    },
    murDeForce: {
      activation: "fait apparaître un mur de force",
      actif: "en entouré d'un mur de force",
      fin: "voit son mur de force disparaître"
    },
    asphyxie: {
      activation: "commence à manquer d'air",
      actif: "étouffe",
      fin: "peut à nouveau respirer"
    },
    forceDeGeant: {
      activation: "devient plus fort",
      actif: "a une force de géant",
      fin: "retrouve sa force normale"
    },
    saignementsSang: {
      activation: "commence à saigner du nez, des oreilles et des yeux",
      actif: "saigne de tous les orifices du visage",
      fin: "ne saigne plus"
    },
    encaisserUnCoup: {
      activation: "se place de façon à dévier un coup sur son armure",
      actif: "est placé de façon à dévier un coup",
      fin: "n'est plus en position pour encaisser un coup"
    },
    absorberUnCoup: {
      activation: "se prépare à absorber un coup avec son bouclier",
      actif: "est prêt à absorber un coup avec son bouclier",
      fin: "n'est plus en position de prendre le prochain coup sur son bouclier"
    },
    absorberUnSort: {
      activation: "se prépare à absorber un sort avec son bouclier",
      actif: "est prêt à absorber un sort avec son bouclier",
      fin: "n'est plus en position de se protéger d'un sort avec son bouclier"
    },
    nueeDInsectes: {
      activation: "est attaqué par une nuée d'insectes",
      actif: "est entouré d'une nuée d'insectes",
      fin: "est enfin débarassé des insectes"
    },
    prisonVegetale: {
      activation: "voit des plantes pousser et s'enrouler autour de ses jambes",
      actif: "est bloqué par des plantes",
      fin: "se libère des plantes"
    },
    protectionContreLesElements: {
      activation: "lance un sort de protection contre les éléments",
      actif: "est protégé contre les éléments",
      fin: "n'est plus protégé contre les éléments"
    },
    masqueMortuaire: {
      activation: "prend l'apparence de la mort",
      actif: "semble mort et animé",
      fin: "retrouve une apparence de vivant"
    }
  };

  var patternEffetsTemp =
    new RegExp(_.reduce(messageEffetTemp, function(reg, msg, effet) {
      var res = reg;
      if (res !== "(") res += "|";
      res += "^" + effet + "($|_)";
      return res;
    }, "(") + ")");

  function estEffetTemp(name) {
    return (patternEffetsTemp.test(name));
  }

  function effetTempOfAttribute(attr) {
    var ef = attr.get('name');
    if (ef === undefined || messageEffetTemp[ef]) return ef;
    for (var effet in messageEffetTemp) {
      if (ef.startsWith(effet + "_")) return effet;
    }
    error("Impossible de déterminer l'effet correspondant à " + ef, attr);
    return undefined;
  }

  var messageEffetCombat = {
    armureMagique: {
      activation: "est entouré d'un halo magique",
      actif: "est protégé par une armure magique",
      fin: "n'est plus entouré d'un halo magique"
    },
    criDeGuerre: {
      activation: "pousse son cri de guerre",
      actif: "a effrayé ses adversaires",
      fin: "n'effraie plus ses adversaires"
    },
    armureDuMage: {
      activation: "fait apparaître un nuage magique argenté qui le protège",
      actif: "est entouré d'une armure du mage",
      fin: "n'a plus son armure du mage"
    },
    armeDArgent: {
      activation: "crée une arme d'argent et de lumière",
      actif: "possède une arme d'argent et de lumière",
      fin: "ne possède plus d'arme d'argent et de lumière"
    },
    protectionContreLeMal: {
      activation: "reçoit une bénédiction de protection contre le mal",
      actif: "est protégé contre le mal",
      fin: "n'est plus protégé contre le mal"
    }
  };

  var patternEffetsCombat =
    new RegExp(_.reduce(messageEffetCombat, function(reg, msg, effet) {
      var res = reg;
      if (res !== "(") res += "|";
      res += "^" + effet + "($|_)";
      return res;
    }, "(") + ")");

  function estEffetCombat(name) {
    return (patternEffetsCombat.test(name));
  }

  function effetCombatOfAttribute(attr) {
    var ef = attr.get('name');
    if (ef === undefined || messageEffetCombat[ef]) return ef;
    for (var effet in messageEffetCombat) {
      if (ef.startsWith(effet + "_")) return effet;
    }
    error("Impossible de déterminer l'effet correspondant à " + ef, attr);
    return undefined;
  }

  var messageEffetIndetermine = {
    aCheval: { //deprecated, mieux vaut utiliser la commande !cof-en-selle
      activation: "monte sur sa monture",
      actif: "est sur sa monture",
      fin: "descend de sa monture"
    },
    marcheSylvestre: {
      activation: "se deplace maintenant en terrain difficile",
      actif: "profite du terrain difficile",
      fin: "est maintenant en terrain normal"
    }
  };

  var patternEffetsIndetermine =
    new RegExp(_.reduce(messageEffetIndetermine, function(reg, msg, effet) {
      var res = reg;
      if (res !== "(") res += "|";
      res += "^" + effet + "($|_)";
      return res;
    }, "(") + ")");

  function estEffetIndetermine(name) {
    return (patternEffetsIndetermine.test(name));
  }

  function effetIndetermineOfAttribute(attr) {
    var ef = attr.get('name');
    if (ef === undefined || messageEffetIndetermine[ef]) return ef;
    for (var effet in messageEffetIndetermine) {
      if (ef.startsWith(effet + "_")) return effet;
    }
    error("Impossible de déterminer l'effet correspondant à " + ef, attr);
    return undefined;
  }

  // Fait foo sur tous les tokens représentant charId, ayant l'effet donné, et correspondant au nom d'attribut. Pour le cas où le token doit être lié au personnage, on ne prend qu'un seul token, sauf si filterUnique est défini, auquel cas on  fait l'appel sur tous les tokens qui passent filterUnique
  function iterTokensOfEffet(charId, effet, attrName, foo, filterUnique) {
    var total = 1; //Nombre de tokens affectés, pour gérer l'asynchronie si besoin
    if (attrName == effet) { //token lié au character
      var tokens =
        findObjs({
          _type: 'graphic',
          _subtype: 'token',
          represents: charId
        });
      tokens = tokens.filter(function(tok) {
        return (tok.get('bar1_link') !== '');
      });
      if (tokens.length === 0) {
        log("Pas de token pour un personnage");
        log(charId);
        log(attrName);
        return;
      }
      if (filterUnique) {
        total = tokens.length;
        tokens.forEach(function(tok) {
          if (filterUnique(tok)) foo(tok, total);
        });
      } else foo(tokens[0], 1);
    } else { //token non lié au character
      var tokenName = attrName.substring(attrName.indexOf('_') + 1);
      var tNames =
        findObjs({
          _type: 'graphic',
          _subtype: 'token',
          represents: charId,
          name: tokenName,
          bar1_link: ''
        });
      total = tNames.length;
      if (total > 1) {
        var character = getObj('character', charId);
        var charName = "d'id " + charId;
        if (character) charName = character.get('name');
        error("Attention, il y a plusieurs tokens nommés " + tokenName + ", instances du personnage " + charName, total);
      }
      tNames.forEach(function(tok) {
        foo(tok, total);
      });
    }
  }

  function finDEffet(attr, effet, attrName, charId, evt, attrSave) { //L'effet arrive en fin de vie, doit être supprimé
    //Si on a un attrSave, alors on a déjà imprimé le message de fin d'effet
    if (attrSave) { //on a un attribut associé à supprimer)
      evt.deletedAttributes.push(attrSave);
      attrSave.remove();
    } else { //On cherche si il y en a un
      sendChar(charId, messageEffetTemp[effet].fin);
      var nameWithSave = effet + "SaveParTour" + attrName.substr(effet.length);
      findObjs({
        _type: 'attribute',
        _characterid: charId,
        name: nameWithSave
      }).
      forEach(function(attrS) {
        evt.deletedAttributes.push(attrS);
        attrS.remove();
      });
    }
    switch (effet) {
      case 'agrandissement': //redonner sa taille normale
        evt.affectes = evt.affectes || [];
        getObj('character', charId).get('defaulttoken', function(normalToken) {
          normalToken = JSON.parse(normalToken);
          var largeWidth = normalToken.width + normalToken.width / 2;
          var largeHeight = normalToken.height + normalToken.height / 2;
          iterTokensOfEffet(charId, effet, attrName, function(token) {
              var width = token.get('width');
              var height = token.get('height');
              evt.affectes.push({
                affecte: token,
                prev: {
                  width: width,
                  height: height
                }
              });
              token.set('width', normalToken.width);
              token.set('height', normalToken.height);
            },
            function(token) {
              if (token.get('width') == largeWidth) return true;
              if (token.get('height') == largeHeight) return true;
              return false;
            }
          );
        });
        break;
      case 'aveugleTemp':
        iterTokensOfEffet(charId, effet, attrName, function(token) {
          setState({
            token: token,
            charId: charId
          }, 'aveugle', false, evt);
        }, function(token) {
          return true;
        });
        break;
      case 'ralentiTemp':
        iterTokensOfEffet(charId, effet, attrName, function(token) {
          setState({
            token: token,
            charId: charId
          }, 'ralenti', false, evt);
        }, function(token) {
          return true;
        });
        break;
      case 'peur':
      case 'peurEtourdi':
        iterTokensOfEffet(charId, effet, attrName, function(token) {
          setState({
            token: token,
            charId: charId
          }, 'peur', false, evt);
        }, function(token) {
          return true;
        });
        break;
      case 'ombreMortelle':
      case 'dedoublement':
        iterTokensOfEffet(charId, effet, attrName, function(token) {
          token.remove();
        });
        break;
      case 'murDeForce':
        iterTokensOfEffet(charId, effet, attrName, function(token) {
          var attr = tokenAttribute({
            charId: charId,
            token: token
          }, 'murDeForceId');
          if (attr.length === 0) return;
          var imageMur = getObj('graphic', attr[0].get('current'));
          if (imageMur) {
            imageMur.remove();
          }
          attr[0].remove();
        });
        break;
      default:
    }
    evt.deletedAttributes.push(attr);
    attr.remove();
  }

  //asynchrone
  function degatsParTour(charId, effet, attrName, dmg, type, msg, evt, options, callback) {
    options = options || {};
    msg = msg || '';
    var count = -1;
    iterTokensOfEffet(charId, effet, attrName, function(token, total) {
      if (count < 0) count = total;
      sendChat('', "[[" + dmg + "]]", function(res) {
        var rolls = res[0];
        var dmgRoll = rolls.inlinerolls[0];
        var r = {
          total: dmgRoll.results.total,
          type: type,
          display: buildinline(dmgRoll, type)
        };
        var perso = {
          token: token,
          charId: charId
        };
        dealDamage(perso, r, [], evt, 1, options, undefined,
          function(dmgDisplay, dmg) {
            sendChar(charId, msg + ". " + onGenre(charId, 'Il', 'Elle') +
              " subit " + dmgDisplay + " DM");
            count--;
            if (count === 0) callback();
          });
      }); //fin sendChat du jet de dé
    }); //fin iterTokensOfEffet
  }

  function nextTurn(cmp) {
    if (!cmp.get('initiativepage')) return;
    var turnOrder = cmp.get('turnorder');
    var pageId = state.COFantasy.combat_pageid;
    if (pageId === undefined) pageId = cmp.get('playerpageid');
    if (turnOrder === "") return; // nothing in the turn order
    turnOrder = JSON.parse(turnOrder);
    if (turnOrder.length < 1) return;
    var evt = {
      type: 'personnage suivant',
      attributes: [],
      deletedAttributes: []
    };
    var active = turnOrder[0];
    var lastHead = turnOrder.pop();
    turnOrder.unshift(lastHead);
    evt.turnorder = JSON.stringify(turnOrder);
    var attrs = findObjs({
      _type: 'attribute'
    });
    // Si on a changé d'initiative, alors diminue les effets temporaires
    var init = parseInt(active.pr);
    if (active.id == "-1" && active.custom == "Tour") init = 0;
    var count = 0; // pour l'aspect asynchrone des effets temporaires
    if (state.COFantasy.init > init) {
      var attrsTemp = attrs.filter(function(obj) {
        if (!estEffetTemp(obj.get('name'))) return false;
        var obji = obj.get('max');
        return (init < obji && obji <= state.COFantasy.init);
      });
      state.COFantasy.init = init;
      // Boucle sur les effets temps peut être asynchrone à cause des DM
      count = attrsTemp.length;
      attrsTemp.forEach(function(attr) {
        var charId = attr.get('characterid');
        var effet = effetTempOfAttribute(attr);
        if (effet === undefined) {
          //erreur, on stoppe tout
          log(attr);
          count--;
          return;
        }
        var attrName = attr.get('name');
        var v = attr.get('current');
        if (v > 0) { // Effet encore actif
          attr.set('current', v - 1);
          evt.attributes.push({
            attribute: attr,
            current: v
          });
          switch (effet) { //rien après le switch, donc on sort par un return
            case 'putrefaction': //prend 1d6 DM
              degatsParTour(charId, effet, attrName, "1d6", 'maladie',
                "pourrit", evt, {
                  magique: true
                },
                function() {
                  count--;
                  if (count === 0) nextTurnOfActive(active, attrs, evt, pageId);
                });
              return;
            case 'asphyxie': //prend 1d6 DM
              degatsParTour(charId, effet, attrName, "1d6", 'normal',
                "ne peut plus respirer", evt, {
                  asphyxie: true
                },
                function() {
                  count--;
                  if (count === 0) nextTurnOfActive(active, attrs, evt, pageId);
                });
              return;
            case 'saignementsSang': //prend 1d6 DM
              degatsParTour(charId, effet, attrName, "1d6", 'normal',
                "saigne par tous les orifices du visage", evt, {
                  magique: true
                },
                function() {
                  count--;
                  if (count === 0) nextTurnOfActive(active, attrs, evt, pageId);
                });
              return;
            case 'nueeDInsectes': //prend 1 DM
              degatsParTour(charId, effet, attrName, "1", 'normal',
                "est piqué par les insectes", evt, {},
                function() {
                  count--;
                  if (count === 0) nextTurnOfActive(active, attrs, evt, pageId);
                });
              return;
            case 'strangulation':
              var nameDureeStrang = 'dureeStrangulation';
              if (effet != attrName) { //concerne un token non lié
                nameDureeStrang += attrName.substring(attrName.indexOf('_'));
              }
              var dureeStrang = findObjs({
                _type: 'attribute',
                _characterid: charId,
                name: nameDureeStrang
              });
              if (dureeStrang.length === 0) {
                var attrDuree = createObj('attribute', {
                  characterid: charId,
                  name: nameDureeStrang,
                  current: 0,
                  max: false
                });
                evt.attributes.push({
                  attribute: attrDuree,
                  current: null
                });
              } else {
                var strangUpdate = dureeStrang[0].get('max');
                if (strangUpdate) { //a été mis à jour il y a au plus 1 tour
                  evt.attributes.push({
                    attribute: dureeStrang[0],
                    current: dureeStrang[0].get('current'),
                    max: strangUpdate
                  });
                  dureeStrang[0].set('max', false);
                } else { //Ça fait trop longtemps, on arrête tout
                  sendChar(charId, messageEffetTemp[effet].fin);
                  attr.set('current', v);
                  evt.attributes.pop(); //On enlève des attributs modifiés pour mettre dans les attribute supprimés.
                  evt.deletedAttributes.push(attr);
                  attr.remove();
                  evt.deletedAttributes.push(dureeStrang[0]);
                  dureeStrang[0].remove();
                }
              }
              count--;
              return;
            default:
              count--;
              return;
          }
        } else { //L'effet arrive en fin de vie, doit être supprimé
          finDEffet(attr, effet, attrName, charId, evt);
          count--;
        }
      }); //fin de la boucle sur tous les attributs d'effets
    }
    if (count === 0) nextTurnOfActive(active, attrs, evt, pageId);
  }

  function nextTurnOfActive(active, attrs, evt, pageId) {
    if (active.id == "-1" && active.custom == "Tour") {
      var tour = parseInt(active.pr);
      if (isNaN(tour)) {
        error("Tour invalide", active);
        return;
      }
      evt.tour = tour - 1;
      evt.updateNextInitSet = updateNextInitSet;
      active.pr = tour - 1; // préparation au calcul de l'undo
      sendChat("GM", "Début du tour " + tour);
      state.COFantasy.tour = tour;
      state.COFantasy.init = 1000;
      // Enlever les bonus d'un tour
      attrs = removeAllAttributes('actionConcertee', evt, attrs);
      attrs = removeAllAttributes('intercepter', evt, attrs);
      attrs = removeAllAttributes('exemplaire', evt, attrs);
      // Pour défaut dans la cuirasse, on diminue si la valeur est 2, et on supprime si c'est 1
      var defautsDansLaCuirasse = allAttributesNamed(attrs, 'defautDansLaCuirasse');
      defautsDansLaCuirasse.forEach(function(attr) {
        if (attr.get('current') < 2) {
          if (evt.deletedAttributes) evt.deletedAttributes.push(attr);
          else evt.deletedAttributes = [attr];
          attr.remove();
        } else {
          var prevAttr = {
            attribute: attr,
            current: 2
          };
          if (evt.attributes) evt.attributes.push(prevAttr);
          else evt.attributes = [prevAttr];
          attr.set('current', 1);
        }
      });
      // nouveau tour : enlever le statut surpris
      // et faire les actions de début de tour
      var selected = [];
      updateNextInitSet.forEach(function(id) {
        selected.push({
          _id: id
        });
      });
      findObjs({
        _type: 'graphic',
        _subtype: 'token',
        _pageid: pageId
      }).forEach(function(tok) {
        var charId = tok.get('represents');
        if (charId === '') return;
        var perso = {
          token: tok,
          charId: charId
        };
        if (getState(perso, 'surpris')) { //surprise
          setState(perso, 'surpris', false, {});
          selected.push({
            _id: tok.id
          });
        }
        var enflammeAttr = tokenAttribute(perso, 'enflamme');
        if (enflammeAttr.length > 0) {
          var enflamme = parseInt(enflammeAttr[0].get('current'));
          // Pour ne pas faire les dégâts plusieurs fois (plusieurs tokens pour un même personnage), on utilise la valeur max de l'attribut
          var dernierTourEnflamme = parseInt(enflammeAttr[0].get('max'));
          if ((isNaN(dernierTourEnflamme) || dernierTourEnflamme < tour) &&
            !isNaN(enflamme) && enflamme > 0) {
            var d6Enflamme = randomInteger(6);
            var feu = d6Enflamme + enflamme - 1;
            var dmg = {
              type: 'feu',
              total: feu,
              display: feu
            };
            feu = dealDamage(perso, dmg, [], evt, 1);
            sendChar(charId, " est en flamme ! " +
              onGenre(charId, 'Il', 'Elle') + " subit " + feu + " DM");
            if (d6Enflamme < 3) {
              sendChar(charId, " les flammes s'éteignent");
              removeTokenAttr(perso, 'enflamme', evt);
            } else {
              enflammeAttr[0].set('max', tour);
            }
          }
        }
      });
      initiative(selected, evt); // met Tour à la fin et retrie
      updateNextInitSet = new Set();
      // Saves à faire à la fin de chaque tour
      var attrsSave = attrs.filter(function(attr) {
        var attrName = attr.get('name');
        var indexSave = attrName.indexOf('SaveParTour');
        if (indexSave < 0) return false;
        return estEffetTemp(attrName.substring(0, indexSave));
      });
      //Les saves sont asynchrones
      var count = attrsSave.length;
      attrsSave.forEach(function(attr) {
        var attrName = attr.get('name');
        var carac = attr.get('current');
        if (isNotCarac(carac)) {
          error("Save par tour " + attrName + " mal formé", carac);
          count--;
          if (count === 0) addEvent(evt);
          return;
        }
        var seuil = parseInt(attr.get('max'));
        if (isNaN(seuil)) {
          error("Save par tour " + attrName + " mal formé", seuil);
          count--;
          if (count === 0) addEvent(evt);
          return;
        }
        var charId = attr.get('characterid');
        var indexSave = attrName.indexOf('SaveParTour');
        var effet = attrName.substring(0, indexSave);
        attrName = effet + attrName.substr(indexSave + 11);
        var token;
        iterTokensOfEffet(charId, effet, attrName, function(tok) {
          if (token === undefined) token = tok;
        });
        if (token === undefined) {
          log("Pas de token pour le save " + attrName);
          count--;
          if (count === 0) addEvent(evt);
          return;
        }
        var attrEffet = findObjs({
          _type: 'attribute',
          _characterid: charId,
          name: attrName
        });
        if (attrEffet === undefined || attrEffet.length === 0) {
          error("Save sans effet temporaire " + attrName, attr);
          attr.remove();
          count--;
          if (count === 0) addEvent(evt);
          return;
        }
        attrEffet = attrEffet[0];
        var expliquer = function(msg) {
          sendChar(charId, msg);
        };
        var msgPour = " pour ne plus être sous l'effet de " + effet;
        var sujet = onGenre(charId, 'il', 'elle');
        var msgReussite = ", " + sujet + " " + messageEffetTemp[effet].fin;
        var msgRate = ", " + sujet + " " + messageEffetTemp[effet].actif;
        var saveOpts = {
          msgPour: msgPour,
          msgReussite: msgReussite,
          msgRate: msgRate
        };
        save({
            carac: carac,
            seuil: seuil
          }, {
            charId: charId,
            token: token
          }, expliquer, saveOpts, evt,
          function(reussite) { //asynchrone
            if (reussite) {
              finDEffet(attrEffet, effet, attrName, charId, evt, attr);
            }
            count--;
            if (count === 0) addEvent(evt);
          });
      }); //fin boucle attrSave
    } else { // change the active token
      setActiveToken(active.id, evt);
    }
    addEvent(evt);
  }

  function destroyToken(token) { //to remove unused local attributes
    var charId = token.get('represeernts');
    if (charId === "") return;
    if (token.get('bar1_link') !== "") return;
    var endName = "_" + token.get('name');
    var tokAttr = findObjs({
      _type: 'attribute',
      _characterid: charId
    });
    tokAttr = tokAttr.filter(function(obj) {
      return obj.get('name').endsWith(endName);
    });
    if (tokAttr.length > 0) {
      log("Removing token local attributes");
      log(tokAttr);
      tokAttr.forEach(function(attr) {
        attr.remove();
      });
    }
  }

  function estSurMonture(perso, pageId) {
    var attr = tokenAttribute(perso, 'monteSur');
    if (attr.length === 0) return false;
    if (pageId === undefined) pageId = perso.token.get('pageid');
    var monture = tokenOfId(attr[0].get('current'), attr[0].get('max'), pageId);
    attr[0].remove();
    if (monture === undefined) {
      sendChar(perso.charId, "descend de sa monture");
      return true;
    }
    sendChar(perso.charId, "descend de " + monture.token.get('name'));
    removeTokenAttr(monture, 'estMontePar');
    removeTokenAttr(monture, 'positionSurMonture');
    return true;
  }

  function moveToken(token) {
    var charId = token.get('represents');
    if (charId === '') return;
    var monture = {
      token: token,
      charId: charId
    };
    var pageId = token.get('pageid');
    if (estSurMonture(monture, pageId)) return;
    var attr = tokenAttribute(monture, 'estMontePar');
    if (attr.length === 0) return;
    var cavalier = tokenOfId(attr[0].get('current'), attr[0].get('max'), pageId);
    if (cavalier === undefined) {
      attr[0].remove();
      return;
    }
    var x = token.get('left');
    var y = token.get('top');
    var position = tokenAttribute(monture, 'positionSurMonture');
    if (position.length > 0) {
      var dx = parseInt(position[0].get('current'));
      var dy = parseInt(position[0].get('max'));
      if (!(isNaN(dx) || isNaN(dy))) {
        x += dx;
        y += dy;
      }
    }
    cavalier.token.set('left', x);
    cavalier.token.set('top', y);
    cavalier.token.set('rotation', monture.token.get('rotation') + attributeAsInt(monture, 'directionSurMonture', 0));
  }

  return {
    apiCommand: apiCommand,
    nextTurn: nextTurn,
    destroyToken: destroyToken,
    moveToken: moveToken,
  };

}();

on("ready", function() {
  COF_loaded = true;
  state.COFantasy = state.COFantasy || {
    combat: false,
    tour: 0,
    init: 1000,
    eventId: 0,
    version: '0.3',
  };
  if (state.COFantasy.version === undefined) {
    state.COFantasy.eventId = 0;
    state.COFantasy.version = '0.3';
  }
  log("COFantasy 0.3 loaded");
});

on("chat:message", function(msg) {
  "use strict";
  if (!COF_loaded || msg.type != "api") return;
  COFantasy.apiCommand(msg);
});

on("change:campaign:turnorder", COFantasy.nextTurn);

on("destroy:token", COFantasy.destroyToken);

on("change:token:left", COFantasy.moveToken);
on("change:token:top", COFantasy.moveToken);
on("change:token:rotation", COFantasy.moveToken);
