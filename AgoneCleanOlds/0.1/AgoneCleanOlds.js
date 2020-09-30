var AgoneCleanOlds = AgoneCleanOlds || (function () {
    'use strict';
    var version = '0.1',
    lastUpdate = 1586205665,

    checkInstall = function() {
        log('### AgoneClearOlds v'+version+' ### ['+(new Date(lastUpdate*1000))+']');
    },

    handleInput = function(msg_orig) {
        let msg = _.clone(msg_orig);

        if (msg.type != 'api' && !playerIsGM(msg.playerid)) {
            return;
        }

        let oldAttributes = ['advocatus-diaboli', 'age', 'agilite', 'agilite-experience', 'aiglon', 'alteration-des-sens', 'ame', 'ame-experience', 'ame-noire', 'apparence-demoniaque', 'arme-att-totale', 'arme-competence-1', 'arme-competence-10', 'arme-competence-2', 'arme-competence-3', 'arme-competence-4', 'arme-competence-5', 'arme-competence-6', 'arme-competence-7', 'arme-competence-8', 'arme-competence-9', 'arme-def-totale', 'arme-description', 'arme-dombd', 'arme-ini-totale', 'arme-nom', 'arme-style', 'arme-tai', 'arme-type-degats', 'armes-competence', 'armes-competence-1', 'armes-competence-10', 'armes-competence-2', 'armes-competence-3', 'armes-competence-4', 'armes-competence-5', 'armes-competence-6', 'armes-competence-7', 'armes-competence-8', 'armes-competence-9', 'armure', 'art', 'art-selection', 'att', 'avantage', 'avantage-cout', 'bd', 'bienfait', 'blessures-graves', 'bonus-d-ame', 'bonus-d-esprit', 'bonus-de-corps', 'bribe', 'cauchemars', 'character_name', 'charge-max', 'charge-quotidienne', 'charisme', 'charisme-experience', 'comp', 'compagnon-age', 'compagnon-agi', 'compagnon-arme-competence-1', 'compagnon-arme-competence-10', 'compagnon-arme-competence-2', 'compagnon-arme-competence-3', 'compagnon-arme-competence-4', 'compagnon-arme-competence-5', 'compagnon-arme-competence-6', 'compagnon-arme-competence-7', 'compagnon-arme-competence-8', 'compagnon-arme-competence-9', 'compagnon-armes-competence', 'compagnon-armes-competence-1', 'compagnon-armes-competence-10', 'compagnon-armes-competence-2', 'compagnon-armes-competence-3', 'compagnon-armes-competence-4', 'compagnon-armes-competence-5', 'compagnon-armes-competence-6', 'compagnon-armes-competence-7', 'compagnon-armes-competence-8', 'compagnon-armes-competence-9', 'compagnon-bd', 'compagnon-cha', 'compagnon-charge-art', 'compagnon-charge-demi-charge', 'compagnon-charge-emp', 'compagnon-charge-max', 'compagnon-charge-quotidienne', 'compagnon-competences', 'compagnon-competences-selection', 'compagnon-cre', 'compagnon-defense-naturelle', 'compagnon-description', 'compagnon-esquive', 'compagnon-for', 'compagnon-int', 'compagnon-masse', 'compagnon-mel', 'compagnon-mv', 'compagnon-pdv', 'compagnon-per', 'compagnon-poids', 'compagnon-res', 'compagnon-sbc', 'compagnon-sbg', 'compagnon-tai', 'compagnon-taille', 'compagnon-tir', 'compagnon-vol', 'competence', 'competences-selection', 'connivence', 'corps', 'corps-experience', 'corps-noir', 'creativite', 'creativite-experience', 'cristal', 'danseur', 'danseur-bonus-emprise', 'danseur-empathie', 'danseur-experience', 'dechu', 'def', 'defaut', 'defaut-cout', 'defense-naturelle', 'demi-charge', 'demon-age', 'demon-agi', 'demon-armes-competence', 'demon-armes-competence-1', 'demon-armes-competence-2', 'demon-armes-competence-3', 'demon-armes-competence-4', 'demon-armes-competence-5', 'demon-armes-competence-6', 'demon-bd', 'demon-cha', 'demon-charge-max', 'demon-charge-quotidienne', 'demon-cre', 'demon-demi-charge', 'demon-densite', 'demon-densite-totale', 'demon-dif', 'demon-esquive-distance', 'demon-facetieux', 'demon-for', 'demon-int', 'demon-masse', 'demon-mel', 'demon-mv-vol', 'demon-opacite', 'demon-per', 'demon-sbc', 'demon-sbg', 'demon-sexe', 'demon-tai', 'demon-taille', 'demon-tir', 'demon-vol', 'description', 'deviance-sexuelle', 'diablotin-farceur', 'dirhem', 'domaine', 'dombd', 'emprise', 'emprise-selection', 'encre-i', 'encre-ii', 'encre-iii', 'encre-iv', 'encre-v', 'esprit', 'esprit-experience', 'esprit-noir', 'esquive', 'experience', 'experience-totale', 'flamme', 'flamme-noire', 'force', 'force-experience', 'heroisme', 'ini', 'insomniaque', 'intelligence', 'intelligence-experience', 'jumeau-demoniaque', 'magie-danseur', 'magie-duree', 'magie-ini', 'magie-nom', 'magie-portee', 'magie-seuil', 'magie-temps', 'magie-type', 'malus', 'malus-blessures-graves', 'manoeuvre', 'marque-des-hauts-diables', 'masse', 'melee', 'mepris', 'mv', 'noirceur', 'nom', 'npc-age', 'npc-agilite', 'npc-ame', 'npc-ame-noire', 'npc-armes-competence', 'npc-armes-competence-1', 'npc-armes-competence-2', 'npc-armes-competence-3', 'npc-armes-competence-4', 'npc-armes-competence-5', 'npc-armes-competence-6', 'npc-armure', 'npc-art', 'npc-bd', 'npc-bonus-d-ame', 'npc-bonus-d-esprit', 'npc-bonus-de-corps', 'npc-charge-max', 'npc-charge-quotidienne', 'npc-charisme', 'npc-competences', 'npc-competences-selection', 'npc-corps', 'npc-corps-noir', 'npc-creativite', 'npc-demi-charge', 'npc-description', 'npc-emprise', 'npc-equipement', 'npc-esprit', 'npc-esprit-noir', 'npc-esquive-distance', 'npc-flamme', 'npc-flamme-noire', 'npc-force', 'npc-heroisme', 'npc-intelligence', 'npc-malus-armure', 'npc-masse', 'npc-melee', 'npc-mv', 'npc-noirceur', 'npc-pdv', 'npc-perception', 'npc-perfidie', 'npc-poids', 'npc-potentiel-impro-art', 'npc-resistance', 'npc-sbc', 'npc-sbg', 'npc-sorts', 'npc-tai', 'npc-taille', 'npc-tenebre', 'npc-tir', 'npc-total-esquive', 'npc-volonte', 'objet', 'objet-masse', 'objet-quantite', 'obsession-de-l-ombre', 'occupation', 'ombre-de-la-perfidie', 'ombre-vivante', 'origine', 'parrain', 'pdv', 'peine', 'perception', 'perception-experience', 'perfidie', 'perle', 'peuple', 'pieces-d-or', 'pistole', 'poids', 'portail-interieur', 'potentiel-art', 'potentiel-conjuration', 'potentiel-emprise', 'potentiel-impro-art', 'potentiel-impro-emprise', 'pouvoir', 'presence-oppressante', 'protection', 'resistance', 'resistance-experience', 'sastre', 'sbc', 'sbg', 'scarifications-lunaires', 'sexe', 'siamois-de-tenebre', 'somnambule', 'sort-description', 'sou', 'specialite', 'tai', 'taille', 'tenebre', 'tir', 'total-esquive', 'volonte', 'volonte-experience'];
        let oldRepeatings = [/^repeating_competences/, /^repeating_perks/, /^repeating_defects/, /^repeating_benefaction/, /^repeating_grief/, /^repeating_powers/, /^repeating_stuff/, /^repeating_maneuvers/, /^repeating_weapons/, /^repeating_emprise/, /^repeating_art/, /^repeating_spells/, /^repeating_conjuration/, /^repeating_advocatus-diaboli/, /^repeating_compagnon-competences/, /^repeating_compagnon-weapons/, /^repeating_demon-competences/, /^repeating_npc-competences/];
        let characters = findObjs({ type: 'character' });
        
        _.each(characters, function(c) {
            let attribute = findObjs({ type: 'attribute', characterid: c.id });
            _.each(attribute, function(a) {
                if (oldAttributes.includes(a.get('name'))) {
                    log(a.get('name')+' : '+a.get('current')+' was removed!');
                    a.remove();
                }
                _.each(oldRepeatings, function(m) {
                    if (a.get('name').match(m)) {
                        log(a.get('name')+' : '+a.get('current')+' was removed!');
                        a.remove();
                    }
                });
                if (a.get('name').match(/^repeating_demon-weapons/g) && !a.get('name').match(/demonWeapon/g)) {
                    log(a.get('name')+' : '+a.get('current')+' was removed!');
                    a.remove();
                }
                if (a.get('name').match(/^repeating_npc-weapons/g) && !a.get('name').match(/npcWeapon/g)) {
                    log(a.get('name')+' : '+a.get('current')+' was removed!');
                    a.remove();
                }
            });
        });

        log("done");
        sendChat(msg.who, "/w gm Old attributes have been removed!");

    },

    registerEventHandlers = function() {
        on('chat:message', handleInput);
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };

}());

on('ready', function() {
    'use strict';
    AgoneCleanOlds.CheckInstall();
    AgoneCleanOlds.RegisterEventHandlers();
});
