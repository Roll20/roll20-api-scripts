character_name:${pcstring('NAME')}
<@loop from=0 to=pcvar('COUNT[CLASSES]-1') ; class , class_has_next>
class-${class}-name:${pcstring('CLASS.${class}')}
class-${class}-level:${pcstring('CLASS.${class}.LEVEL')}
<#if (class == 0)>
class-${class}-Fort:${pcvar('CHECK.FORTITUDE.TOTAL.NOSTAT.NORACE.NOMAGIC.NOFEATS.NOEPIC')}
class-${class}-Ref:${pcvar('CHECK.REFLEX.TOTAL.NOSTAT.NORACE.NOMAGIC.NOFEATS.NOEPIC')}
class-${class}-Will:${pcvar('CHECK.WILL.TOTAL.NOSTAT.NORACE.NOMAGIC.NOFEATS.NOEPIC')}
Fort-misc:${pcvar('CHECK.FORTITUDE.TOTAL.NOSTAT-CHECK.FORTITUDE.TOTAL.NOSTAT.NORACE.NOMAGIC.NOFEATS.NOEPIC')}
Ref-misc:${pcvar('CHECK.REFLEX.TOTAL.NOSTAT-CHECK.REFLEX.TOTAL.NOSTAT.NORACE.NOMAGIC.NOFEATS.NOEPIC')}
Will-misc:${pcvar('CHECK.WILL.TOTAL.NOSTAT-CHECK.WILL.TOTAL.NOSTAT.NORACE.NOMAGIC.NOFEATS.NOEPIC')}
   <#assign hp = 0>
   <#assign hpstat = 0>
   <@loop from=1 to=pcvar('ECL') ; roll , roll_has_next>
   <#assign hp = hp + pcvar('HPROLL.${roll}')>
   <#assign hpstat = hpstat + pcvar('HPROLL.${roll}.STAT')>
   </@loop>
class-${class}-hp:${hp}
class-${class}-fchp:${pcstring('HP.INTVAL-${hp}-${hpstat}')}
NPC-HP:${pcstring('HP.INTVAL')}
HP:${pcstring('HP.INTVAL')}
class-${class}-bab:${pcvar('ATTACK.MELEE.BASE.SHORT')}
<#else>
class-${class}-Fort:0
class-${class}-Ref:0
class-${class}-Will:0
class-${class}-hp:0
class-${class}-fchp:0
class-${class}-bab:0
</#if>
</@loop>
<#assign craftCount = 0>
<#assign performCount = 0>
<#assign professionCount = 0>
<@loop from=0 to=pcvar('COUNT[SKILLS]-1') ; skill , skill_has_next>
<#assign skillName = pcstring('SKILL.${skill}')>
<#if pcstring('SKILL.${skill}')?starts_with('Craft')>
Craft${craftCount?replace("0","")}-name:${pcstring('SKILL.${skill}')?replace("Craft (","")?replace(")","")}
<#assign skillName = "Craft"+craftCount?replace("0","")>
<#assign craftCount = craftCount+1>
</#if>
<#if pcstring('SKILL.${skill}')?starts_with('Perform')>
Perform${performCount?replace("0","")}-name:${pcstring('SKILL.${skill}')?replace("Perform (","")?replace(")","")}
<#assign skillName = "Perform"+performCount?replace("0","")>
<#assign performCount = performCount+1>
</#if>
<#if pcstring('SKILL.${skill}')?starts_with('Profession')>
Profession${professionCount?replace("0","")}-name:${pcstring('SKILL.${skill}')?replace("Profession (","")?replace(")","")}
<#assign skillName = "Profession"+professionCount?replace("0","")>
<#assign professionCount = professionCount+1>
</#if>
<#if pcstring('SKILL.${skill}')?starts_with('Knowledge')>
<#assign skillName = pcstring('SKILL.${skill}')?replace("(","")?replace(")","")?replace(" ","-")>
</#if>
${skillName}-ranks:${pcstring('SKILL.${skill}.RANK.INTVAL')}
<#if pcstring('SKILL.${skill}.CLASSES') != ''>
${skillName}-cs:((((3 * @{${skillName}-ranks}) + 3) - abs((3 * @{${skillName}-ranks}) - 3)) / 2)
</#if>
</@loop>
<@loop from=0 to=pcvar('COUNT[STATS]-1') ; stat , stat_has_next>
${pcstring('STAT.${stat}.NAME')}-base:${pcstring('STAT.${stat}.NOTEMP.NOEQUIP')}
${pcstring('STAT.${stat}.NAME')}-enhance:${pcstring('VAR.STAT.$stat.INTVAL-VAR.STAT.$stat.NOTEMP.NOEQUIP.INTVAL')}
</@loop>
<@loop from=0 to=pcvar('COUNT[EQTYPE.SHIELD]-1') ; shieldNum , shieldNum_has_next>
shield:${pcstring('ARMOR.SHIELD.ALL.${shieldNum}.NAME')}
shield-spell-fail:${pcstring('ARMOR.SHIELD.ALL.${shieldNum}.SPELLFAIL')}
shield-weight:${pcstring('ARMOR.SHIELD.ALL.${shieldNum}.WT')}
shield-max-dex:${pcstring('VAR.ARMOR.SHIELD.ALL.${shieldNum}.MAXDEX.INTVAL')}
shield-acp:${pcstring('VAR.ARMOR.SHIELD.ALL.${shieldNum}.ACCHECK.INTVAL')}
shield-acbonus:${pcstring('VAR.ARMOR.SHIELD.ALL.${shieldNum}.ACBONUS.INTVAL')}
</@loop>
<@loop from=0 to=pcvar('COUNT[EQTYPE.ARMOR]-1') ; armorNum , armorNum_has_next>
armor:${pcstring('ARMOR.ARMOR.ALL.${armorNum}.NAME')}
armor-max-dex:${pcstring('VAR.ARMOR.ARMOR.ALL.${armorNum}.MAXDEX.INTVAL')}
armor-weight:${pcstring('ARMOR.ARMOR.ALL.${armorNum}.WT')}
armor-type:${pcstring('ARMOR.ARMOR.ALL.${armorNum}.TYPE')}
armor-acp:${pcstring('VAR.ARMOR.ARMOR.ALL.${armorNum}.ACCHECK.INTVAL')}
armor-acbonus:${pcstring('VAR.ARMOR.ARMOR.ALL.${armorNum}.ACBONUS.INTVAL')}
armor-spell-fail:${pcstring('ARMOR.ARMOR.ALL.${armorNum}.SPELLFAIL')}
</@loop>
<@loop from=0 to=pcvar('COUNT[EQTYPE.WEAPON]-1') ; weap , weap_has_next>
repeating_weapon_${weap}_name:${pcstring('WEAPON.${weap}.NAME.NOSTAR')}
repeating_weapon_${weap}_crit-multiplier:${pcstring('WEAPON.${weap}.MULT')}
repeating_weapon_${weap}_crit-target:${pcstring('TEXT.REPLACEFIRST{-.*,}.WEAPON.${weap}.CRIT')}
repeating_weapon_${weap}_damage-dice-num:${pcstring('TEXT.REPLACEFIRST{d.*,}.WEAPON.${weap}.BASEDAMAGE*1.INTVAL')}
repeating_weapon_${weap}_damage-die:${pcstring('TEXT.REPLACEFIRST{.*d,}.WEAPON.${weap}.BASEDAMAGE*1.INTVAL')}
repeating_weapon_${weap}_damage:${pcstring('VAR.WEAPON.${weap}.BONUSDAMAGE.INTVAL-VAR.WEAPON.${weap}.MAGICDAMAGE.INTVAL')}
repeating_weapon_${weap}_attack:${pcstring('VAR.WEAPON.${weap}.MISC.INTVAL')}
<#if (pcstring('VAR.WEAPON.${weap}.MAGICHIT.INTVAL') != '0')>
repeating_weapon_${weap}_masterwork:1
<#else>
repeating_weapon_${weap}_masterwork:0
</#if>
repeating_weapon_${weap}_type:${pcstring('WEAPON.${weap}.TYPE')}
repeating_weapon_${weap}_enhance:${pcstring('VAR.WEAPON.${weap}.MAGICDAMAGE.INTVAL')}
repeating_weapon_${weap}_range:${pcstring('WEAPON.${weap}.RANGE.NOUNITS')}
<#if (pcvar('WEAPON.${weap}.RANGE.NOUNITS') = 0)>
repeating_weapon_${weap}_attack-type:@{attk-melee}
<#else>
repeating_weapon_${weap}_attack-type:@{attk-ranged}
</#if>
repeating_weapon_${weap}_proficiency:Yes
</@loop>
<#assign spellClass = 0>
<@loop from=0 to=0 ; spellbook , spellbook_has_next>
   <@loop from=pcvar('COUNT[SPELLRACE]') to=pcvar('COUNT[SPELLRACE]+COUNT[CLASSES]-1') ; class , class_has_next>
      <#if (pcstring("SPELLLISTCLASS.${class}") != '') >
         <#assign spellClass = spellClass + 1>
spellclass-${spellClass}-name:${pcstring('SPELLLISTCLASS.${class}')}
spellclass-${spellClass}-level:${pcstring('SPELLLISTCLASS.${class}.CASTERLEVEL')}
         <@loop from=0 to=pcvar('MAXSPELLLEVEL.${class}') ; level , level_has_next>
spellclass-${spellClass}-level-${level}-spells-known:${pcstring('SPELLLISTKNOWN.${class}.${level}')}
spellclass-${spellClass}-level-${level}-spells-class:${pcstring('SPELLLISTCAST.${class}.${level}')}
            <@loop from=pcvar('COUNT[SPELLSINBOOK.${class}.${spellbook}.${level}]') to=pcvar('COUNT[SPELLSINBOOK.${class}.${spellbook}.${level}]') ; spellcount , spellcount_has_next>
               <#if (spellcount = 0)>
               <#else>
                  <#assign spellNumber =0>
                  <@loop from=0 to=pcvar('COUNT[SPELLSINBOOK.${class}.${spellbook}.${level}]-1') ; spell , spell_has_next>
repeating_lvl-${level}-spells_${spellNumber}_name:${pcstring('SPELLMEM.${class}.${spellbook}.${level}.${spell}.NAME')}
repeating_lvl-${level}-spells_${spellNumber}_range:${pcstring('SPELLMEM.${class}.${spellbook}.${level}.${spell}.RANGE')}
repeating_lvl-${level}-spells_${spellNumber}_spellclass:${class}
repeating_lvl-${level}-spells_${spellNumber}_cast-time:${pcstring('SPELLMEM.${class}.${spellbook}.${level}.${spell}.CASTINGTIME')}
repeating_lvl-${level}-spells_${spellNumber}_DC-mod:${pcstring('SPELLMEM.${class}.${spellbook}.${level}.${spell}.DC')}
repeating_lvl-${level}-spells_${spellNumber}_components:${pcstring('SPELLMEM.${class}.${spellbook}.${level}.${spell}.COMPONENTS')}
repeating_lvl-${level}-spells_${spellNumber}_targets:${pcstring('SPELLMEM.${class}.${spellbook}.${level}.${spell}.TARGET')}
repeating_lvl-${level}-spells_${spellNumber}_duration:${pcstring('SPELLMEM.${class}.${spellbook}.${level}.${spell}.DURATION')}
repeating_lvl-${level}-spells_${spellNumber}_save:${pcstring('SPELLMEM.${class}.${spellbook}.${level}.${spell}.SAVEINFO')}
repeating_lvl-${level}-spells_${spellNumber}_sr:${pcstring('SPELLMEM.${class}.${spellbook}.${level}.${spell}.SR')}
repeating_lvl-${level}-spells_${spellNumber}_description:${pcstring('SPELLMEM.${class}.${spellbook}.${level}.${spell}.DESCRIPTION')}
                     <#assign spellNumber = spellNumber+1>
                  </@loop>
               </#if>
            </@loop>
         </@loop>
      </#if>
   </@loop>
</@loop>
<#if (pcstring('SIZELONG') = 'Fine')>
size:8
</#if>
<#if (pcstring('SIZELONG') = 'Diminutive')>
size:4
</#if>
<#if (pcstring('SIZELONG') = 'Tiny')>
size:2
</#if>
<#if (pcstring('SIZELONG') = 'Small')>
size:1
</#if>
<#if (pcstring('SIZELONG') = 'Medium')>
size:0
</#if>
<#if (pcstring('SIZELONG') = 'Large')>
size:-1
</#if>
<#if (pcstring('SIZELONG') = 'Huge')>
size:-2
</#if>
<#if (pcstring('SIZELONG') = 'Gargantuan')>
size:-4
</#if>
<#if (pcstring('SIZELONG') = 'Colossal')>
size:-8
</#if>
hero-points:${pcstring('VAR.HEROPOINTS.INTVAL')}
skin:${pcstring('COLOR.SKIN')}
deity:${pcstring('DEITY')}
alignment:${pcstring('ALIGNMENT.SHORT')}
AC-dodge:${pcstring('AC.Dodge')}
languages:${pcstring('LANGUAGES')}
homeland:${pcstring('BIRTHPLACE')}
gender:${pcstring('GENDER.SHORT')}
race:${pcstring('RACE')}
weight:${pcstring('WEIGHT')}
hair:${pcstring('COLOR.HAIR')}
player-name:${pcstring('PLAYERNAME')}
space:${pcstring('FACE.SHORT')}
speed-base:${pcstring('MOVE.0.SQUARES*5')}
npc-cr:${pcstring('CR')}
experience:${pcstring('EXP.CURRENT')}:${pcstring('EXP.NEXT')}
npc-type:${pcstring('RACETYPE')}
height:${pcstring('HEIGHT')}
NPC-HD-misc:${pcstring('HP.INTVAL')}
AC-deflect:${pcstring('AC.Deflection')}
AC-natural:${pcstring('AC.NaturalArmor')}
eyes:${pcstring('COLOR.EYE')}
DR:${pcstring('DR')}
AC-misc:${pcstring('AC.Misc')}
reach:${pcstring('REACH')}
age:${pcstring('AGE')}
init-misc:${pcstring('VAR.INITIATIVEMISC.INTVAL')}
max-dex-source:@{armor-max-dex}
<@loop from=0 to=pcvar('COUNT[FEATS.VISIBLE]-1') ; feat , feat_has_next>
repeating_feat_${feat}_name:${pcstring('FEAT.VISIBLE.${feat}')}
repeating_feat_${feat}_short-description:${pcstring('FEAT.VISIBLE.${feat}.DESC')}
repeating_feat_${feat}_description:${pcstring('FEAT.VISIBLE.${feat}.BENEFIT')}
</@loop>
<@loop from=0 to=pcvar('COUNT[FEATSAUTO.VISIBLE]-1') ; feat , feat_has_next>
repeating_feat_${pcvar('COUNT[FEATS.VISIBLE]')+feat}_name:${pcstring('FEATAUTO.VISIBLE.${feat}')}
repeating_feat_${pcvar('COUNT[FEATS.VISIBLE]')+feat}_short-description:${pcstring('FEATAUTO.VISIBLE.${feat}.DESC')}
repeating_feat_${pcvar('COUNT[FEATS.VISIBLE]')+feat}_description:${pcstring('FEATAUTO.VISIBLE.${feat}.BENEFIT')}
</@loop>
<@loop from=0 to=pcvar('COUNT[VFEATS.VISIBLE]-1') ; feat , feat_has_next>
repeating_feat_${pcvar('COUNT[FEATS.VISIBLE]')+pcvar('COUNT[FEATSAUTO.VISIBLE]')+feat}_name:${pcstring('VFEAT.VISIBLE.${feat}')}
repeating_feat_${pcvar('COUNT[FEATS.VISIBLE]')+pcvar('COUNT[FEATSAUTO.VISIBLE]')+feat}_short-description:${pcstring('VFEAT.VISIBLE.${feat}.DESC')}
repeating_feat_${pcvar('COUNT[FEATS.VISIBLE]')+pcvar('COUNT[FEATSAUTO.VISIBLE]')+feat}_description:${pcstring('VFEAT.VISIBLE.${feat}.BENEFIT')}
</@loop>
<@loop from=0 to=pcvar('countdistinct("ABILITIES","CATEGORY=Special Ability","TYPE=RACIALTRAITS")-1') ; ability , ability_has_next>
repeating_racial-trait_${ability}_name:${pcstring('ABILITYALL.Special Ability.${ability}.TYPE=RACIALTRAITS')}
repeating_racial-trait_${ability}_short-description:${pcstring('ABILITYALL.Special Ability.${ability}.TYPE=RACIALTRAITS.DESC')}
repeating_racial-trait_${ability}_description:${pcstring('ABILITYALL.Special Ability.${ability}.TYPE=RACIALTRAITS.DESC')}
</@loop>
<#assign classAbilityCount = 0>
<#-- <@loop from=0 to=pcvar('COUNT[CLASSES]-1') ; class , class_has_next>
<#assign className = pcstring('TEXT.UPPER.CLASS.${class}')>
<#if className = "KINETICIST">
<#assign className = "PSION">
</#if>
<@loop from=0 to=pcvar('countdistinct("ABILITIES","CATEGORY=Special Ability","VISIBILITY=DEFAULT[or]VISIBILITY=OUTPUT_ONLY","TYPE=${className}CLASSFEATURES")-1') ; ability , ability_has_next>
repeating_class-ability_${ability}_class-number:@{class-${class}-name}
repeating_class-ability_${ability}_name:${pcstring('ABILITYALL.Special Ability.VISIBLE.${ability}.TYPE=${className}CLASSFEATURES')}
repeating_class-ability_${ability}_short-description:${pcstring('ABILITYALL.Special Ability.VISIBLE.${ability}.TYPE=${className}CLASSFEATURES.DESC')}
repeating_class-ability_${ability}_description:${pcstring('ABILITYALL.Special Ability.VISIBLE.${ability}.TYPE=${className}CLASSFEATURES.DESC')}
<#assign classAbilityCount = classAbilityCount+1>
</@loop> 
</@loop>
<@loop from=0 to=pcvar('countdistinct("ABILITIES","CATEGORY=Special Ability","TYPE=ROGUETALENT","VISIBILITY=DEFAULT[or]VISIBILITY=OUTPUT_ONLY")-1') ; rogueTalent , rogueTalent_has_next>
repeating_class-ability_${classAbilityCount+rogueTalent}_class-number:0
<#if (pcstring("VABILITY.Special Ability.VISIBLE.${rogueTalent}.TYPE=ROGUETALENT") != "")>
repeating_class-ability_${classAbilityCount+rogueTalent}_name:${pcstring('VABILITY.Special Ability.VISIBLE.${rogueTalent}.TYPE=ROGUETALENT')}
<#else>
repeating_class-ability_${classAbilityCount+rogueTalent}_name:${pcstring('ABILITYALL.Special Ability.VISIBLE.${rogueTalent}.TYPE=ROGUETALENT')}
</#if>
repeating_class-ability_${classAbilityCount+rogueTalent}_description:${pcstring('ABILITYALL.Special Ability.VISIBLE.${rogueTalent}.TYPE=ROGUETALENT.DESC')}
</@loop>-->
<@loop from=0 to=pcvar('countdistinct("ABILITIES","CATEGORY=Special Ability","VISIBILITY=DEFAULT[or]VISIBILITY=OUTPUT_ONLY","TYPE=SPECIALQUALITY[or]TYPE=SPECIALATTACK")-1') ; ability , ability_has_next>
<#if pcstring('ABILITYALL.Special Ability.VISIBLE.${ability}.TYPE=SPECIALQUALITY.TYPE=SPECIALATTACK.TYPE')?contains("RACIALTRAITS")>
<#else>
<#--<#list pcstring('ABILITYALL.Special Ability.VISIBLE.${ability}.TYPE=SPECIALQUALITY.TYPE=SPECIALATTACK.TYPE')?split(".") as x>
<#if x?contains("CLASSFEATURES")>
repeating_class-ability_${classAbilityCount}_class-number:${x?replace("CLASSFEATURES","")}
</#if>
</#list>-->
repeating_class-ability_${classAbilityCount}_class-number:@{class-0-name}
repeating_class-ability_${classAbilityCount}_name:${pcstring('ABILITYALL.Special Ability.VISIBLE.${ability}.TYPE=SPECIALQUALITY.TYPE=SPECIALATTACK')}
repeating_class-ability_${classAbilityCount}_short-description:${pcstring('ABILITYALL.Special Ability.VISIBLE.${ability}.TYPE=SPECIALQUALITY.TYPE=SPECIALATTACK.DESC')}
repeating_class-ability_${classAbilityCount}_description:${pcstring('ABILITYALL.Special Ability.VISIBLE.${ability}.TYPE=SPECIALQUALITY.TYPE=SPECIALATTACK.DESC')}
<#assign classAbilityCount = classAbilityCount+1>
</#if>
</@loop>
<@loop from=0 to=pcvar('COUNT[EQUIPMENT.MERGELOC]-1') ; equip , equip_has_next>
repeating_item_${equip}_name:${pcstring('EQ.MERGELOC.${equip}.LONGNAME')}
repeating_item_${equip}_short-description:${pcstring('EQ.MERGELOC.${equip}.DESC')}
repeating_item_${equip}_qty:${pcstring('EQ.MERGELOC.${equip}.QTY')}:${pcstring('EQ.MERGELOC.${equip}.MAXCHARGES')}
repeating_item_${equip}_weight:${pcstring('EQ.MERGELOC.${equip}.WT')}
</@loop>
<@loop from=0 to=pcvar('countdistinct("ABILITIES","CATEGORY=Special Ability","TYPE=Trait","VISIBILITY=DEFAULT[or]VISIBILITY=OUTPUT_ONLY")-1') ; trait , trait_has_next>
<#if (pcstring("VABILITY.Special Ability.VISIBLE.${trait}.TYPE=Trait") != "")>
repeating_trait_${trait}_name:${pcstring('VABILITY.Special Ability.VISIBLE.${trait}.TYPE=Trait')}
<#else>
repeating_trait_${trait}_name:${pcstring('ABILITYALL.Special Ability.VISIBLE.${trait}.TYPE=Trait')}
</#if>
repeating_trait_${trait}_description:${pcstring('ABILITYALL.Special Ability.VISIBLE.${trait}.TYPE=Trait.DESC')}
</@loop>
<#assign specialAttackString = "">
<@loop from=0 to=pcvar('countdistinct("ABILITIES","CATEGORY=Special Ability","TYPE=SPECIALATTACK","VISIBILITY=DEFAULT[or]VISIBILITY=OUTPUT_ONLY")-1') ; specialAttack , specialAttack_has_next>
<#if (pcstring("VABILITY.Special Ability.VISIBLE.${specialAttack}.TYPE=SPECIALATTACK") != "")>
<#assign specialAttackString = specialAttackString+specialAttack+". "+pcstring('VABILITY.Special Ability.VISIBLE.${specialAttack}.TYPE=SPECIALATTACK')>
repeating_racial-trait_${pcvar('countdistinct("ABILITIES","CATEGORY=Special Ability","TYPE=RACIALTRAITS")')+specialAttack}_name:${pcstring('VABILITY.Special Ability.VISIBLE.${specialAttack}.TYPE=SPECIALATTACK')}
<#else>
<#assign specialAttackString = specialAttackString+specialAttack+". "+pcstring('ABILITYALL.Special Ability.VISIBLE.${specialAttack}.TYPE=SPECIALATTACK')>
repeating_racial-trait_${pcvar('countdistinct("ABILITIES","CATEGORY=Special Ability","TYPE=RACIALTRAITS")')+specialAttack}_name:${pcstring('ABILITYALL.Special Ability.VISIBLE.${specialAttack}.TYPE=SPECIALATTACK')}
</#if>
repeating_racial-trait_${pcvar('countdistinct("ABILITIES","CATEGORY=Special Ability","TYPE=RACIALTRAITS")')+specialAttack}_description:${pcstring('ABILITYALL.Special Ability.VISIBLE.${specialAttack}.TYPE=SPECIALATTACK.DESC')?replace(":",";")}
<#assign specialAttackString = specialAttackString+"- "+pcstring('ABILITYALL.Special Ability.VISIBLE.${specialAttack}.TYPE=SPECIALATTACK.DESC')>
<#assign specialAttackString = specialAttackString+"      ">
</@loop>
npc-special-attacks:${specialAttackString?replace(":",";")}