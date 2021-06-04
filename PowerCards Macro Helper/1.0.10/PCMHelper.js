// PCMHelper - A utility script for PowerCards creates attributes to facilitate PowerCard template and 
//             replacements style cards. .2Will monitor creation of objects and changes to characters to
//             try to keep the attributes updated so there is no additional work involved on the DMs
//             part to set up new creatures or character abilities.
//
//             The following attributes are created on characters (PCs and/or NPCs) as appropriate:
//               attacklist = list of PC Attacks (center of the character sheet). ONLY those marked as attacks.
//               npcactionlist = list of repeating_npcaction entries (under the "Actions" heading on the sheet)
//               npclegendaryactions = list of repeating_npcaction-l entries
//               cantriplist = list of known cantrips
//               l1_spell_list thru l9_spell_list = list of known spells.
//
// Supported Commands:
//   !pcm           Runs the attribute evaluation for any selected tokens.
//   !pcmeverybody  Runs the attribute evaluation for ALL characters in the game. Good for adding the system
//                  to an existing game without needing to select each character. Might take a while to run
//                  on large campaigns (and might even fail).
//   !pcmqueue      Processes the current queue (if any) - should never be needed.
//   !pcmsetup      Create (or recreate) the Replacements, Templates, and Macros used by PCMHelper
//

var PCMHelper = PCMHelper || (function() {

	var PCMHelper_Author = "Kurt Jaegers";
	var PCMHelper_Version = "1.0.10";
	var PCMHelper_LastUpdated = "2020-09-28";

	var pc_replacements = `Advantage:{{query=1}} {{normal=1}} {{r2=[[0d20|1d20;{{query=1}} {{advantage=1}} {{r2=[[1d20|2d20kh1;{{query=1}} {{disadvantage=1}} {{r2=[[1d20|2d20kl1`;

var pc_templates = `Basics: --tokenid|~0! --target_list|~1! --['~6!' -ne '/w gm ']emote|~S-CN$ ~2! against ~T-CN$ --format|~S-CN$ --name|~3! --leftsub|~4! --rightsub|~5!<br>
PCAttack: --['~1!' -eq '/w gm ']whisper|gm --['~2!' -eq '']Attack *1|[#[ [$Atk] ~0! + ~PCA-ATKBONUS$ [Attack Bonus] ]#] vs **AC** [#[~T-AC$]#] --['~2!' -ne '']Attack *2|[#[ [$Atk] ~0! + ~PCA-ATKBONUS$ [Attack Bonus] + ~2! [Bless] ]#] vs **AC** [#[~T-AC$]#] --?? $Atk.base == 1 ?? Fumble|The attack went horribly wrong! --?? $Atk.base <> 1 AND $Atk.base <> 20 AND $Atk.total < ~T-AC$ ?? Miss *1|~S-CN$ missed. --["~PCA-DMG2DICE$" -eq "none" -and "~3!" -eq "0"]?? $Atk.base <> 20 AND $Atk.total >= ~T-AC$ ?? Hit|~S-CN$ hits ~T-CN$ for [#[ [$Dmg] ~PCA-DMG1DICE$ ]] ~PCA-DMG1TYPE$ damage --["~PCA-DMG2DICE$" -ne "none" -and "~3!" -eq "0"]?? $Atk.base <> 20 AND $Atk.total >= ~T-AC$ ?? Hit|~S-CN$ hits ~T-CN$ for [#[ [$Dmg] ~PCA-DMG1DICE$ ]] ~PCA-DMG1TYPE$ damage and [[ [$Dmg2] ~PCA-DMG2DICE$ ]] ~PCA-DMG2TYPE$ damage --["~PCA-DMG2DICE$" -eq "none" -and "~3!" -ne "0"]?? $Atk.base <> 20 AND $Atk.total >= ~T-AC$ ?? Hit|~S-CN$ hits ~T-CN$ for [#[ [$Dmg] ~PCA-DMG1DICE$ ]] ~PCA-DMG1TYPE$ damage and [[ [$GDmg] ~3! ]] ~4! damage --["~PCA-DMG2DICE$" -ne "none" -and "~3!" -ne "0"]?? $Atk.base <> 20 AND $Atk.total >= ~T-AC$ ?? Hit|~S-CN$ hits ~T-CN$ for [#[ [$Dmg] ~PCA-DMG1DICE$ ]] ~PCA-DMG1TYPE$ damage, [[ [$GDmg] ~3! ]] ~4! damage and [[ [$Dmg2] ~PCA-DMG2DICE$ ]] ~PCA-DMG2TYPE$ damage --["~PCA-DMG2DICE$" -eq "none" -and "~3!" -eq "0"]?? $Atk.base == 20 AND $Atk.total >= ~T-AC$ ?? Critical Hit|~S-CN$ hits ~T-CN$ for [#[ [$Dmg] ~PCA-DMG1CRIT$ ]] ~PCA-DMG1TYPE$ damage --["~PCA-DMG2DICE$" -ne "none" -and "~3!" -eq "0"]?? $Atk.base == 20 AND $Atk.total >= ~T-AC$ ?? Critical Hit|~S-CN$ hits ~T-CN$ for [#[ [$Dmg] ~PCA-DMG1CRIT$ ]] ~PCA-DMG1TYPE$ damage and [[ [$Dmg2] ~PCA-DMG2CRIT$ ]] ~PCA-DMG2TYPE$ damage --["~PCA-DMG2DICE$" -eq "none" -and "~3!" -ne "0"]?? $Atk.base == 20 AND $Atk.total >= ~T-AC$ ?? Critical Hit|~S-CN$ hits ~T-CN$ for [#[ [$Dmg] ~PCA-DMG1CRIT$ ]] ~PCA-DMG1TYPE$ damage and [[ [$GDmg] ~5! ]] ~4! damage --["~PCA-DMG2DICE$" -ne "none" -and "~3!" -ne "0"]?? $Atk.base == 20 AND $Atk.total >= ~T-AC$ ?? Critical Hit|~S-CN$ hits ~T-CN$ for [#[ [$Dmg] ~PCA-DMG1CRIT$ ]] ~PCA-DMG1TYPE$ damage [[ [$GDmg] ~5! ]] ~4! damage  and [[ [$Dmg2] ~PCA-DMG2CRIT$ ]] ~PCA-DMG2TYPE$ damage --["~PCA-SAVE$" -eq "true"]?? $Atk.base == 20 OR $Atk.total >= ~T-AC$ ?? Save|~T-CN$ can attempt a **DC ~PCA-SAVEDC$** ~PCA-SAVEATTR$ saving throw for ~PCA-SAVEEFFECT$ --["~PCA-SAVE$" -eq "true"]?? $Atk.base == 20 OR $Atk.total >= ~T-AC$ ?? Save|~T-CN$ can attempt a **DC ~PCA-SAVEDC$** ~PCA-SAVEATTR$ saving throw for ~PCA-SAVEEFFECT$ --["~PCA-DESC$" -ne "none"]Description|~PCA-DESC$<br>
NPCBasics: --tokenid|~0! --target_list|~1! --emote|~S-CN$ ~2! against ~T-CN$ --format|badguys --name|~3! --['~NPCA-TYPE$' -eq 'ATTACK']leftsub|~4! --['~NPCA-RANGE$' -eq 'ATTACK']rightsub|~5!<br>
NPCAttack:  --["~NPCA-TYPE$" -eq "ATTACK"]Attack:|[#[ [$Atk] ~0! + ~NPCA-TOHIT$ [Attack Bonus] ]#] vs **AC** [#[~T-AC$]#] --["~NPCA-TYPE$" -eq "ATTACK"]?? $Atk < ~T-AC$ ?? !Missed|**The ~NPCA-NAME$ attack missed!** --["~NPCA-TYPE$" -eq "ATTACK" -and "~NPCA-DAMAGETYPE2$" -eq ""]?? $Atk >= ~T-AC$ AND $Atk.base <> 20 ?? Hit:|[#[ [$Dmg] ~NPCA-DAMAGE$ ]#] ~NPCA-DAMAGETYPE$ damage --["~NPCA-TYPE$" -eq "ATTACK" -and "~NPCA-DAMAGETYPE2$" -ne ""]?? $Atk >= ~T-AC$ AND $Atk.base <> 20 ?? Hit:|[#[ [$Dmg] ~NPCA-DAMAGE$ ]#] ~NPCA-DAMAGETYPE$ damage and [#[ [$Dmg2] ~NPCA-DAMAGE2$ ]#] ~NPCA-DAMAGETYPE2$ damage --["~NPCA-TYPE$" -eq "ATTACK" -and "~NPCA-DAMAGETYPE2$" -eq ""]?? $Atk.base == 20 ?? Hit:|[#[ [$Dmg] ~NPCA-CRIT$ ]#] ~NPCA-DAMAGETYPE$ damage --["~NPCA-TYPE$" -eq "ATTACK" -and "~NPCA-DAMAGETYPE2$" -ne ""]?? $Atk.base == 20 ?? Hit:|[#[ [$Dmg] ~NPCA-CRIT$ ]#] ~NPCA-DAMAGETYPE$ damage and [#[ [$Dmg2] ~NPCA-CRIT2$ ]#] ~NPCA-DAMAGETYPE2$ damage --["~NPCA-TYPE$" -eq "ATTACK"]?? $Atk.base == 1 ?? Fumble|The attack goes horribly wrong! --["~NPCA-DESCRIPTION$" -ne "" ]Description|~NPCA-DESCRIPTION$<br>
CantripAttack: --["~1!" -eq "/w gm"]whisper|gm --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq '' -and '~2!' -eq '']Attack: *1|[#[ [$Atk] ~0! + ~S-SAB$ [Spell Attack] ]#] vs **AC** [#[~T-AC$]#] --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq '' -and '~2!' -ne '']Attack: *2|[#[ [$Atk] ~0! + ~S-SAB$ [Spell Attack] ~2! [Bless] ]#] vs **AC** [#[~T-AC$]#] --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq '']?? $Atk < ~T-AC$ ?? !Missed|**You missed!** --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq '' -and "~3!" -eq "0" -and ~SP-MORECANTRIPDAMAGE$ -eq 0]?? $Atk >= ~T-AC$ AND $Atk.base <> 20 ?? Hit:|[#[ [$Dmg] (~SP-DAMAGE$) [Base] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] ]#] ~SP-DAMAGETYPE$ damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq '' -and "~3!" -eq "0" -and ~S-L$ -lt 4 -and ~SP-MORECANTRIPDAMAGE$ -eq 1]?? $Atk >= ~T-AC$ AND $Atk.base <> 20 ?? Hit:|[#[ [$Dmg] (~SP-DAMAGE$) [Base] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] ]#] ~SP-DAMAGETYPE$ damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq '' -and "~3!" -eq "0" -and ~SP-MORECANTRIPDAMAGE$ -eq 1 -and ~S-L$ -gt 4 -and ~S-L$ -lt 12]?? $Atk >= ~T-AC$ AND $Atk.base <> 20 ?? Hit:|[#[ [$Dmg] (~SP-DAMAGE$) + (~SP-DAMAGE$) [Base] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] ]#] ~SP-DAMAGETYPE$ damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq '' -and "~3!" -eq "0" -and ~SP-MORECANTRIPDAMAGE$ -eq 1 -and ~S-L$ -gt 11 -and ~S-L$ -lt 17]?? $Atk >= ~T-AC$ AND $Atk.base <> 20 ?? Hit:|[#[ [$Dmg] (~SP-DAMAGE$) + (~SP-DAMAGE$) + (~SP-DAMAGE$) [Base] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] ]#] ~SP-DAMAGETYPE$ damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq '' -and "~3!" -eq "0" -and ~SP-MORECANTRIPDAMAGE$ -eq 1 -and ~S-L$ -gt 16 ]?? $Atk -ge ~T-AC$ AND $Atk.base <> 20 ?? Hit:|[#[ [$Dmg] (~SP-DAMAGE$) + (~SP-DAMAGE$) + (~SP-DAMAGE$) + (~SP-DAMAGE$) [Base] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] ~SP-DAMAGETYPE$ ]#] damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq '' -and "~3!" -eq "0" -and ~SP-MORECANTRIPDAMAGE$ -eq 0]?? $Atk.base == 20 ?? Critical Hit:|[#[ [$CritDmg] (~SP-DAMAGE$) [Base] + (~SP-DAMAGE$) [Crit] ]#] ~SP-DAMAGETYPE$ Damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq '' -and "~3!" -eq "0" -and ~S-L$ -lt 4 -and ~SP-MORECANTRIPDAMAGE$ -eq 1]?? $Atk.base == 20 ?? Critical Hit:|[#[ [$CritDmg] (~SP-DAMAGE$) [Base] + (~SP-DAMAGE$) [Crit] ]#] ~SP-DAMAGETYPE$ Damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq '' -and "~3!" -eq "0" -and ~SP-MORECANTRIPDAMAGE$ -eq 1 -and ~S-L$ -gt 4 -and ~S-L$ -lt 12]?? $Atk.base == 20 ?? Critical Hit:|[#[ [$CritDmg] (~SP-DAMAGE$) + (~SP-DAMAGE$) [Base] + (~SP-DAMAGE$) + (~SP-DAMAGE$) [Crit] ]#] ~SP-DAMAGETYPE$ Damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq '' -and "~3!" -eq "0" -and ~SP-MORECANTRIPDAMAGE$ -eq 1 -and ~S-L$ -gt 11 -and ~S-L$ -lt 17]?? $Atk.base == 20 ?? Critical Hit:|[#[ [$CritDmg] (~SP-DAMAGE$) + (~SP-DAMAGE$) + (~SP-DAMAGE$) [Base] + (~SP-DAMAGE$) + (~SP-DAMAGE$) + (~SP-DAMAGE$) [Crit] ]#] ~SP-DAMAGETYPE$ Damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq '' -and "~3!" -eq "0" -and ~SP-MORECANTRIPDAMAGE$ -eq 1 -and ~S-L$ -gt 16 ]?? $Atk.base == 20 ?? Critical Hit:|[#[ [$CritDmg] (~SP-DAMAGE$) + (~SP-DAMAGE$) + (~SP-DAMAGE$) + (~SP-DAMAGE$) [Base] + (~SP-DAMAGE$) + (~SP-DAMAGE$) + (~SP-DAMAGE$) + (~SP-DAMAGE$) [Crit] ]#] ~SP-DAMAGETYPE$ Damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq '' -and "~3!" -ne "0" -and ~SP-MORECANTRIPDAMAGE$ -eq 0]?? $Atk >= ~T-AC$ AND $Atk.base <> 20 ?? Hit:|[#[ [$Dmg] (~SP-DAMAGE$) [Base] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] ]#] ~SP-DAMAGETYPE$ damage and [[ [$GDmg] ~3! ]] ~4! damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq '' -and "~3!" -ne "0" -and ~S-L$ -lt 4 -and ~SP-MORECANTRIPDAMAGE$ -eq 1]?? $Atk >= ~T-AC$ AND $Atk.base <> 20 ?? Hit:|[#[ [$Dmg] (~SP-DAMAGE$) [Base] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] ]#] ~SP-DAMAGETYPE$ damage and [[ [$GDmg] ~3! ]] ~4! damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq '' -and "~3!" -ne "0" -and ~SP-MORECANTRIPDAMAGE$ -eq 1 -and ~S-L$ -gt 4 -and ~S-L$ -lt 12]?? $Atk >= ~T-AC$ AND $Atk.base <> 20 ?? Hit:|[#[ [$Dmg] (~SP-DAMAGE$) + (~SP-DAMAGE$) [Base] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] ]#] ~SP-DAMAGETYPE$ damage and [[ [$GDmg] ~3! ]] ~4! damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq '' -and "~3!" -ne "0" -and ~SP-MORECANTRIPDAMAGE$ -eq 1 -and ~S-L$ -gt 11 -and ~S-L$ -lt 17]?? $Atk >= ~T-AC$ AND $Atk.base <> 20 ?? Hit:|[#[ [$Dmg] (~SP-DAMAGE$) + (~SP-DAMAGE$) + (~SP-DAMAGE$) [Base] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] ]#] ~SP-DAMAGETYPE$ damage and [[ [$GDmg] ~3! ]] ~4! damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq '' -and "~3!" -ne "0" -and ~SP-MORECANTRIPDAMAGE$ -eq 1 -and ~S-L$ -gt 16 ]?? $Atk -ge ~T-AC$ AND $Atk.base <> 20 ?? Hit:|[#[ [$Dmg] (~SP-DAMAGE$) + (~SP-DAMAGE$) + (~SP-DAMAGE$) + (~SP-DAMAGE$) [Base] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] ~SP-DAMAGETYPE$ ]#] damage and [[ [$GDmg] ~3! ]] ~4! damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq '' -and "~3!" -ne "0" -and ~SP-MORECANTRIPDAMAGE$ -eq 0]?? $Atk.base == 20 ?? Critical Hit:|[#[ [$CritDmg] (~SP-DAMAGE$) [Base] + (~SP-DAMAGE$) [Crit] ]#] ~SP-DAMAGETYPE$ Damage and [[ [$GDmg] ~5! ]] ~4! damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq '' -and "~3!" -ne "0" -and ~S-L$ -lt 4 -and ~SP-MORECANTRIPDAMAGE$ -eq 1]?? $Atk.base == 20 ?? Critical Hit:|[#[ [$CritDmg] (~SP-DAMAGE$) [Base] + (~SP-DAMAGE$) [Crit] ]#] ~SP-DAMAGETYPE$ Damage and [[ [$GDmg] ~5! ]] ~4! damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq '' -and "~3!" -ne "0" -and ~SP-MORECANTRIPDAMAGE$ -eq 1 -and ~S-L$ -gt 4 -and ~S-L$ -lt 12]?? $Atk.base == 20 ?? Critical Hit:|[#[ [$CritDmg] (~SP-DAMAGE$) + (~SP-DAMAGE$) [Base] + (~SP-DAMAGE$) + (~SP-DAMAGE$) [Crit] ]#] ~SP-DAMAGETYPE$ Damage and [[ [$GDmg] ~5! ]] ~4! damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq '' -and "~3!" -ne "0" -and ~SP-MORECANTRIPDAMAGE$ -eq 1 -and ~S-L$ -gt 11 -and ~S-L$ -lt 17]?? $Atk.base == 20 ?? Critical Hit:|[#[ [$CritDmg] (~SP-DAMAGE$) + (~SP-DAMAGE$) + (~SP-DAMAGE$) [Base] + (~SP-DAMAGE$) + (~SP-DAMAGE$) + (~SP-DAMAGE$) [Crit] ]#] ~SP-DAMAGETYPE$ Damage and [[ [$GDmg] ~5! ]] ~4! damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq '' -and "~3!" -ne "0" -and ~SP-MORECANTRIPDAMAGE$ -eq 1 -and ~S-L$ -gt 16 ]?? $Atk.base == 20 ?? Critical Hit:|[#[ [$CritDmg] (~SP-DAMAGE$) + (~SP-DAMAGE$) + (~SP-DAMAGE$) + (~SP-DAMAGE$) [Base] + (~SP-DAMAGE$) + (~SP-DAMAGE$) + (~SP-DAMAGE$) + (~SP-DAMAGE$) [Crit] ]#] ~SP-DAMAGETYPE$ Damage and [[ [$GDmg] ~5! ]] ~4! damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq '']?? $Atk.base == 1 ?? !|**Fumble:** Spell goes horribly wrong! --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq 'Strength']Save|~T-CN$ rolls [[ [$Save] 1d20 + ~T-SBSTR$ ]] on a ~SP-SAVE$ save vs **DC ~S-SSDC$** --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq 'Dexterity']Save|~T-CN$ rolls [[ [$Save] 1d20 + ~T-SBDEX$ ]] on a ~SP-SAVE$ save vs **DC ~S-SSDC$** --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq 'Constitution']Save|~T-CN$ rolls [[ [$Save] 1d20 + ~T-SBCON$ ]] on a ~SP-SAVE$ save vs **DC ~S-SSDC$** --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq 'Intelligence']Save|~T-CN$ rolls [[ [$Save] 1d20 + ~T-SBINT$ ]] on a ~SP-SAVE$ save vs **DC ~S-SSDC$** --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq 'Wisdom']Save|~T-CN$ rolls [[ [$Save] 1d20 + ~T-SBWIS$ ]] on a ~SP-SAVE$ save vs **DC ~S-SSDC$** --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq 'Charisma']Save|~T-CN$ rolls [[ [$Save] 1d20 + ~T-SBCHA$ ]] on a ~SP-SAVE$ save vs **DC ~S-SSDC$** --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -ne '' -and "~3!" -eq "0" -and ~S-L$ -lt 4 -and ~SP-MORECANTRIPDAMAGE$ -ne 0]?? $Save < ~S-SSDC$ ?? Save Failed|~T-CN$ takes [#[ [$Dmg] (~SP-DAMAGE$) [Base] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] ]#] ~SP-DAMAGETYPE$ damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -ne '' -and "~3!" -eq "0" -and ~SP-MORECANTRIPDAMAGE$ -eq 0]?? $Save < ~S-SSDC$ ?? Save Failed|~T-CN$ takes [#[ [$Dmg] (~SP-DAMAGE$) [Base] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] ]#] ~SP-DAMAGETYPE$ damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -ne '' -and "~3!" -eq "0" -and ~SP-MORECANTRIPDAMAGE$ -eq 1 -and ~S-L$ -gt 4 -and ~S-L$ -lt 12]?? $Save < ~S-SSDC$ ?? Save Failed:|~T-CN$ takes [#[ [$Dmg] (~SP-DAMAGE$) + (~SP-DAMAGE$) [Base] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] ]#] ~SP-DAMAGETYPE$ damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -ne '' -and "~3!" -eq "0" -and ~SP-MORECANTRIPDAMAGE$ -eq 1 -and ~S-L$ -gt 11 -and ~S-L$ -lt 17]?? $Save < ~S-SSDC$ ?? Save Failed:|~T-CN$ takes [#[ [$Dmg] (~SP-DAMAGE$) + (~SP-DAMAGE$) + (~SP-DAMAGE$) [Base] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] ]#] ~SP-DAMAGETYPE$ damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -ne '' -and "~3!" -eq "0" -and ~SP-MORECANTRIPDAMAGE$ -eq 1 -and ~S-L$ -gt 16 ]?? $Save < ~S-SSDC$ ?? Save Failed:|~T-CN$ takes [#[ [$Dmg] (~SP-DAMAGE$) + (~SP-DAMAGE$) + (~SP-DAMAGE$) + (~SP-DAMAGE$) [Base] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] ]#] ~SP-DAMAGETYPE$ damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -ne '' -and "~3!" -ne "0" -and ~S-L$ -lt 4 -and ~SP-MORECANTRIPDAMAGE$ -ne 0]?? $Save < ~S-SSDC$ ?? Save Failed|~T-CN$ takes [#[ [$Dmg] (~SP-DAMAGE$) [Base] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] ]#] ~SP-DAMAGETYPE$ damage and [[ [$GDmg] ~3! ]] ~4! damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -ne '' -and "~3!" -ne "0" -and ~SP-MORECANTRIPDAMAGE$ -eq 0]?? $Save < ~S-SSDC$ ?? Save Failed|~T-CN$ takes [#[ [$Dmg] (~SP-DAMAGE$) [Base] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] ]#] ~SP-DAMAGETYPE$ damage and [[ [$GDmg] ~3! ]] ~4! damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -ne '' -and "~3!" -ne "0" -and ~SP-MORECANTRIPDAMAGE$ -eq 1 -and ~S-L$ -gt 4 -and ~S-L$ -lt 12]?? $Save < ~S-SSDC$ ?? Save Failed:|~T-CN$ takes [#[ [$Dmg] (~SP-DAMAGE$) + (~SP-DAMAGE$) [Base] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] ]#] ~SP-DAMAGETYPE$ damage and [[ [$GDmg] ~3! ]] ~4! damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -ne '' -and "~3!" -ne "0" -and ~SP-MORECANTRIPDAMAGE$ -eq 1 -and ~S-L$ -gt 11 -and ~S-L$ -lt 17]?? $Save < ~S-SSDC$ ?? Save Failed:|~T-CN$ takes [#[ [$Dmg] (~SP-DAMAGE$) + (~SP-DAMAGE$) + (~SP-DAMAGE$) [Base] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] ]#] ~SP-DAMAGETYPE$ damage and [[ [$GDmg] ~3! ]] ~4! damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -ne '' -and "~3!" -ne "0" -and ~SP-MORECANTRIPDAMAGE$ -eq 1 -and ~S-L$ -gt 16 ]?? $Save < ~S-SSDC$ ?? Save Failed:|~T-CN$ takes [#[ [$Dmg] (~SP-DAMAGE$) + (~SP-DAMAGE$) + (~SP-DAMAGE$) + (~SP-DAMAGE$) [Base] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] ]#] ~SP-DAMAGETYPE$ damage and [[ [$GDmg] ~3! ]] ~4! damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -ne '']?? $Save >= ~S-SSDC$ ?? Save Succeded|~T-CN$ avoids the effect of the ~SP-NAME$ --Description|~SP-DESCRIPTION$<br>
SpellCast:  --["~1!" -eq "/w gm"]whisper|gm --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-ATTACK$' -ne 'None' -and '~SP-DAMAGE$' -ne '' -and '~2!' -eq '']Attack: *1|[#[ [$Atk] ~0! + ~S-SAB$ [Spell Attack] ]#] vs **AC** [#[~T-AC$]#] --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-ATTACK$' -ne 'None' -and '~SP-DAMAGE$' -ne '' -and '~2!' -ne '']Attack: *2|[#[ [$Atk] ~0! + ~S-SAB$ [Spell Attack] + ~2! [Bless] ]#] vs **AC** [#[~T-AC$]#] --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-ATTACK$' -eq 'None' -and '~SP-DAMAGE$' -ne '']hroll|[#[ [$Atk] 1d10 + 500 ]#] vs **AC** [#[~T-AC$]#] --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-DAMAGE$' -ne '']?? $Atk < ~T-AC$ ?? !Missed|**You missed!** --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-DAMAGE2$' -eq '' -and '~SP-DAMAGE$' -ne '' -and "~3!" -eq "0"]?? $Atk >= ~T-AC$ AND $Atk.base <> 20 ?? Hit: *1|[#[ [$Dmg] (~SP-DAMAGE$) [Base] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] + (~SP-HLDICE$*~SSL$)~SP-HLDIETYPE$~SP-HLBONUS$ [HigherLevel] ]#] ~SP-DAMAGETYPE$ damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-DAMAGE2$' -eq '' -and '~SP-DAMAGE$' -ne '' -and "~3!" -eq "0"]?? $Atk.base == 20 ?? Critical Hit: *1|[#[ [$Dmg] (~SP-DAMAGE$) [Base] + (~SP-DAMAGE$) [Crit] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] + (~SP-HLDICE$*~SSL$)~SP-HLDIETYPE$~SP-HLBONUS$ [HigherLevel] + (~SP-HLDICE$*~SSL$)~SP-HLDIETYPE$~SP-HLBONUS$ [HLCrit] ]#] ~SP-DAMAGETYPE$ Damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-DAMAGE2$' -ne '' -and '~SP-DAMAGE$' -ne '' -and "~3!" -eq "0"]?? $Atk >= ~T-AC$ AND $Atk.base <> 20 ?? Hit: *2|[#[ [$Dmg] (~SP-DAMAGE$) [Base] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] + (~SP-HLDICE$*~SSL$)~SP-HLDIETYPE$~SP-HLBONUS$ [HigherLevel] ]#] ~SP-DAMAGETYPE$ damage and [#[ [$Dmg2] (~SP-DAMAGE2$) [Base] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] ]#] ~SP-DAMAGETYPE2$ damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-DAMAGE2$' -ne '' -and '~SP-DAMAGE$' -ne '' -and "~3!" -eq "0"]?? $Atk.base == 20 ?? Critical Hit: *2|[#[ [$Dmg] (~SP-DAMAGE$) [Base] + (~SP-DAMAGE$) [Crit] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] + (~SP-HLDICE$*~SSL$)~SP-HLDIETYPE$~SP-HLBONUS$ [HigherLevel] + (~SP-HLDICE$*~SSL$)~SP-HLDIETYPE$~SP-HLBONUS$ [HLCrit] ]#] ~SP-DAMAGETYPE$ Damage and [#[ [$Dmg2] (~SP-DAMAGE2$) [Base] (~SP-DAMAGE2$) [Crit] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] ]#] ~SP-DAMAGETYPE2$ damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-DAMAGE2$' -eq '' -and '~SP-DAMAGE$' -ne '' -and "~3!" -ne "0"]?? $Atk >= ~T-AC$ AND $Atk.base <> 20 ?? Hit: *3|[#[ [$Dmg] (~SP-DAMAGE$) [Base] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] + (~SP-HLDICE$*~SSL$)~SP-HLDIETYPE$~SP-HLBONUS$ [HigherLevel] ]#] ~SP-DAMAGETYPE$ damage and [[ [$GDmg] ~3! ]] ~4! damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-DAMAGE2$' -eq '' -and '~SP-DAMAGE$' -ne '' -and "~3!" -ne "0"]?? $Atk.base == 20 ?? Critical Hit: *3|[#[ [$Dmg] (~SP-DAMAGE$) [Base] + (~SP-DAMAGE$) [Crit] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] + (~SP-HLDICE$*~SSL$)~SP-HLDIETYPE$~SP-HLBONUS$ [HigherLevel] + (~SP-HLDICE$*~SSL$)~SP-HLDIETYPE$~SP-HLBONUS$ [HLCrit] ]#] ~SP-DAMAGETYPE$ Damage and [[ [$GDmg] ~5! ]] ~4! damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-DAMAGE2$' -ne '' -and '~SP-DAMAGE$' -ne '' -and "~3!" -ne "0"]?? $Atk >= ~T-AC$ AND $Atk.base <> 20 ?? Hit: *4|[#[ [$Dmg] (~SP-DAMAGE$) [Base] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] + (~SP-HLDICE$*~SSL$)~SP-HLDIETYPE$~SP-HLBONUS$ [HigherLevel] ]#] ~SP-DAMAGETYPE$ damage, [[ [$GDmg] ~3! ]] ~4! damage and [#[ [$Dmg2] (~SP-DAMAGE2$) [Base] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] ]#] ~SP-DAMAGETYPE2$ damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-DAMAGE2$' -ne '' -and '~SP-DAMAGE$' -ne '' -and "~3!" -ne "0"]?? $Atk.base == 20 ?? Critical Hit: *4|[#[ [$Dmg] (~SP-DAMAGE$) [Base] + (~SP-DAMAGE$) [Crit] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] + (~SP-HLDICE$*~SSL$)~SP-HLDIETYPE$~SP-HLBONUS$ [HigherLevel] + (~SP-HLDICE$*~SSL$)~SP-HLDIETYPE$~SP-HLBONUS$ [HLCrit] ]#] ~SP-DAMAGETYPE$ Damage, [[ [$GDmg] ~5! ]] ~4! damage and [#[ [$Dmg2] (~SP-DAMAGE2$) [Base] (~SP-DAMAGE2$) [Crit] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] ]#] ~SP-DAMAGETYPE2$ damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq 'Strength' -and '~SP-DAMAGE$' -ne '']Save|~T-CN$ rolls [[ [$Save] 1d20 + ~T-SBSTR$ ]] on a ~SP-SAVE$ save vs **DC ~S-SSDC$** --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq 'Dexterity' -and '~SP-DAMAGE$' -ne '']Save|~T-CN$ rolls [[ [$Save] 1d20 + ~T-SBDEX$ ]] on a ~SP-SAVE$ save vs **DC ~S-SSDC$** --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq 'Constitution' -and '~SP-DAMAGE$' -ne '']Save|~T-CN$ rolls [[ [$Save] 1d20 + ~T-SBCON$ ]] on a ~SP-SAVE$ save vs **DC ~S-SSDC$** --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq 'Intelligence' -and '~SP-DAMAGE$' -ne '']Save|~T-CN$ rolls [[ [$Save] 1d20 + ~T-SBINT$ ]] on a ~SP-SAVE$ save vs **DC ~S-SSDC$** --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq 'Wisdom' -and '~SP-DAMAGE$' -ne '']Save|~T-CN$ rolls [[ [$Save] 1d20 + ~T-SBWIS$ ]] on a ~SP-SAVE$ save vs **DC ~S-SSDC$** --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -eq 'Charisma' -and '~SP-DAMAGE$' -ne '']Save|~T-CN$ rolls [[ [$Save] 1d20 + ~T-SBCHA$ ]] on a ~SP-SAVE$ save vs **DC ~S-SSDC$** --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -ne '' -and '~SP-DAMAGE$' -ne '' -and "~3!" -eq "0"]?? Save < ~S-SSDC$ ?? Save Failed *1|~T-CN$ takes [#[ [$Dmg] (~SP-DAMAGE$) [Base] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] ]#] ~SP-DAMAGETYPE$ damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -ne '' -and '~SP-DAMAGE$' -ne '' -and "~3!" -ne "0"]?? Save < ~S-SSDC$ ?? Save Failed *2|~T-CN$ takes [#[ [$Dmg] (~SP-DAMAGE$) [Base] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] ]#] ~SP-DAMAGETYPE$ damage and [[ [$GDmg] ~3! ]] ~4! damage --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-SAVE$' -ne '' -and '~SP-DAMAGE$' -ne '']?? $Save >= ~S-SSDC$ ?? Save Succeded|~T-CN$ saves for ~SP-SAVESUCCESS$ --['~SP-OUTPUT$' -eq 'ATTACK' -and '~SP-HEALING$' -ne '']Healing:|[#[ [$Heal] (~SP-HEALING$) [Base] + (~S-SAM$ * ~SP-ADDABILITY$) [Ability] + (~SP-HLDICE$*~SSL$)~SP-HLDIETYPE$~SP-HLBONUS$ [HigherLevel] ]#] --Description|~SP-DESCRIPTION$<br>
`;
	

    var pc_npcaction = `!power {{ 
--replacenpcaction|@{selected|character_id}|?{Select action to use|@{selected|npcactionlist}} 
--replacement|Advantage 
--replaceattrs|S-|@{selected|character_id} 
--replaceattrs|T-|@{target|character_id} 
--template|NPCBasics|@{selected|token_id};@{target|token_id};uses ~NPCA-NAME$;~NPCA-NAME$;~NPCA-ATYPE$;~NPCA-RANGE$ 
--template|NPCAttack|~@{selected|rtype}$ 
}}`;
	
var pc_pcattack = `!power {{ 
  --replacepcattack|@{selected|character_id}|?{Select attack to use|@{selected|attacklist}} 
  --replacement|Advantage 
  --replaceattrs|S-|@{selected|character_id} 
  --replaceattrs|T-|@{target|character_id} 
  --template|Basics|@{selected|token_id};@{target|token_id};uses ~PCA-NAME$;~PCA-NAME$;~PCA-ATYPE$;~PCA-RANGE$;@{selected|whispertoggle}
  --template|PCAttack|~@{selected|rtype}$;@{selected|whispertoggle};@{selected|global_attack_mod};@{selected|global_damage_mod_roll};@{selected|global_damage_mod_type};@{selected|global_damage_mod_crit}
}}`;

var pc_legendary = `!power {{ 
--replacenpcaction|@{selected|character_id}|?{Select action to use|@{selected|legendaryactionlist}} 
--replacement|Advantage 
--replaceattrs|S-|@{selected|character_id} 
--replaceattrs|T-|@{target|character_id} 
--template|NPCBasics|@{selected|token_id};@{target|token_id};uses ~NPCA-NAME$;~NPCA-NAME$;~NPCA-ATYPE$;~NPCA-RANGE$ 
--template|NPCAttack|~@{selected|rtype}$ 
}}`;

var pc_cantrip = `!power {{
  --replacespell|@{selected|character_id}|?{Cantrip to cast|@{selected|cantrip_list}}
  --replaceattrs|S-|@{selected|character_id} 
  --replaceattrs|T-|@{target|character_id} 
  --replacement|Advantage
  --template|Basics|@{selected|token_id};@{target|token_id};casts ~SP-NAME$;~SP-NAME$;Cantrip;~SP-RANGE$;@{selected|whispertoggle}
  --template|CantripAttack|~@{selected|rtype}$;@{selected|whispertoggle};@{selected|global_attack_mod};@{selected|global_damage_mod_roll};@{selected|global_damage_mod_type};@{selected|global_damage_mod_crit}
}}`;	  


    var pc_level1 = `!power {{
		--replacespell|@{selected|character_id}|?{Spell to Cast|@{selected|l1_spell_list}}
		--inlinereplace|SSL|?{Spell Slot Level?|1,0|2,1|3,2|4,3|5,4|6,5|7,6|8,7|9,8}
		--replaceattrs|S-|@{selected|character_id} --replaceattrs|T-|@{target|character_id} --replacement|Advantage
	    --template|Basics|@{selected|token_id};@{target|token_id};casts ~SP-NAME$;~SP-NAME$;Save DC ~S-SSDC$;~SP-RANGE$;@{selected|whispertoggle}
		--template|SpellCast|~@{selected|rtype}$;@{selected|whispertoggle}
	  }}`;
	  
	var pc_level2 = `!power {{
		--replacespell|@{selected|character_id}|?{Spell to Cast|@{selected|l2_spell_list}}
		--inlinereplace|SSL|?{Spell Slot Level?|2,0|3,1|4,2|5,3|6,4|7,5|8,6|9,7}
		--replaceattrs|S-|@{selected|character_id} --replaceattrs|T-|@{target|character_id} --replacement|Advantage
	    --template|Basics|@{selected|token_id};@{target|token_id};casts ~SP-NAME$;~SP-NAME$;Save DC ~S-SSDC$;~SP-RANGE$;@{selected|whispertoggle}
		--template|SpellCast|~@{selected|rtype}$;@{selected|whispertoggle}
	  }}`;

	  var pc_level3 = `!power {{
		--replacespell|@{selected|character_id}|?{Spell to Cast|@{selected|l3_spell_list}}
		--inlinereplace|SSL|?{Spell Slot Level?|3,0|4,1|5,2|6,3|7,4|8,5|9,6}
		--replaceattrs|S-|@{selected|character_id} --replaceattrs|T-|@{target|character_id} --replacement|Advantage
	    --template|Basics|@{selected|token_id};@{target|token_id};casts ~SP-NAME$;~SP-NAME$;Save DC ~S-SSDC$;~SP-RANGE$;@{selected|whispertoggle}
		--template|SpellCast|~@{selected|rtype}$;@{selected|whispertoggle}
	  }}`;

	  var pc_level4 = `!power {{
		--replacespell|@{selected|character_id}|?{Spell to Cast|@{selected|l4_spell_list}}
		--inlinereplace|SSL|?{Spell Slot Level?|4,0|5,1|6,2|7,3|8,4|9,5}
		--replaceattrs|S-|@{selected|character_id} --replaceattrs|T-|@{target|character_id} --replacement|Advantage
	    --template|Basics|@{selected|token_id};@{target|token_id};casts ~SP-NAME$;~SP-NAME$;Save DC ~S-SSDC$;~SP-RANGE$;@{selected|whispertoggle}
		--template|SpellCast|~@{selected|rtype}$;@{selected|whispertoggle}
	  }}`;

	  var pc_level5 = `!power {{
		--replacespell|@{selected|character_id}|?{Spell to Cast|@{selected|l5_spell_list}}
		--inlinereplace|SSL|?{Spell Slot Level?|5,0|6,1|7,2|8,3|9,4}
		--replaceattrs|S-|@{selected|character_id} --replaceattrs|T-|@{target|character_id} --replacement|Advantage
	    --template|Basics|@{selected|token_id};@{target|token_id};casts ~SP-NAME$;~SP-NAME$;Save DC ~S-SSDC$;~SP-RANGE$;@{selected|whispertoggle}
		--template|SpellCast|~@{selected|rtype}$;@{selected|whispertoggle}
	  }}`;

	  var pc_level6 = `!power {{
		--replacespell|@{selected|character_id}|?{Spell to Cast|@{selected|l6_spell_list}}
		--inlinereplace|SSL|?{Spell Slot Level?|6,0|7,1|8,2|9,3}
		--replaceattrs|S-|@{selected|character_id} --replaceattrs|T-|@{target|character_id} --replacement|Advantage
	    --template|Basics|@{selected|token_id};@{target|token_id};casts ~SP-NAME$;~SP-NAME$;Save DC ~S-SSDC$;~SP-RANGE$;@{selected|whispertoggle}
		--template|SpellCast|~@{selected|rtype}$;@{selected|whispertoggle}
	  }}`;

	  var pc_level7 = `!power {{
		--replacespell|@{selected|character_id}|?{Spell to Cast|@{selected|l7_spell_list}}
		--inlinereplace|SSL|?{Spell Slot Level?|7,0|8,1|9,2}
		--replaceattrs|S-|@{selected|character_id} --replaceattrs|T-|@{target|character_id} --replacement|Advantage
	    --template|Basics|@{selected|token_id};@{target|token_id};casts ~SP-NAME$;~SP-NAME$;Save DC ~S-SSDC$;~SP-RANGE$;@{selected|whispertoggle}
		--template|SpellCast|~@{selected|rtype}$;@{selected|whispertoggle}
	  }}`;

	  var pc_level8 = `!power {{
		--replacespell|@{selected|character_id}|?{Spell to Cast|@{selected|l8_spell_list}}
		--inlinereplace|SSL|?{Spell Slot Level?|8,0|9,1}
		--replaceattrs|S-|@{selected|character_id} --replaceattrs|T-|@{target|character_id} --replacement|Advantage
	    --template|Basics|@{selected|token_id};@{target|token_id};casts ~SP-NAME$;~SP-NAME$;Save DC ~S-SSDC$;~SP-RANGE$;@{selected|whispertoggle}
		--template|SpellCast|~@{selected|rtype}$;@{selected|whispertoggle}
	  }}`;

	  var pc_level9 = `!power {{
		--replacespell|@{selected|character_id}|?{Spell to Cast|@{selected|l9_spell_list}}
		--inlinereplace|SSL|0
		--replaceattrs|S-|@{selected|character_id} --replaceattrs|T-|@{target|character_id} --replacement|Advantage
	    --template|Basics|@{selected|token_id};@{target|token_id};casts ~SP-NAME$;~SP-NAME$;Save DC ~S-SSDC$;~SP-RANGE$;@{selected|whispertoggle}
		--template|SpellCast|~@{selected|rtype}$;@{selected|whispertoggle}
	  }}`;

	// API COMMAND HANDLER
	on("chat:message", function(msg) {
		if (msg.type !== "api") { 
			return;
		}

		switch (msg.content.split(" ", 1)[0].toLowerCase()) {
			case "!PCMHelper":
			case "!pcmhelper":
			case "!PCMHELPER":
			case "!PCM":
			case "!pcm":
				var player_obj = getObj("player", msg.playerid);
				msg.who = msg.who.replace(" (GM)", "");
				msg.content = msg.content.replace(/<br\/>\n/g, ' ').replace(/({{)(.*)((\}\}))/, " $2 ").replace(/\[#\[/g,"[[").replace(/\]#\]/g,"]]");
				getAttackInfo(msg, player_obj);
				getNPCActionInfo(msg, player_obj);
				getSpellInfo(msg, player_obj);
				break;
			case "!pcmsetup":
				log("Running PCMSetup - installing macros for version " + PCMHelper_Version);
				createHandouts();
				createPCMacros(getObj("player", msg.playerid));
				state.PCMHelper.currentVersion = PCMHelper_Version;
				break;
			case "!pcmqueue":
				break;
			case "!pcmoldversion":
				state.PCMHelper.currentVersion = "1.0.1"
				break;				
			case "!pcmshowqueue":
			    log(state.PCMHelper.Queue);
			    break;
			case "!pcmeverybody":
				var chars = findObjs({ _type: "character"});
				_.each(chars, function(obj) {
				    AddQueueItem(obj.id);
				});
				log(`Queue length is ${state.PCMHelper.Queue.length}`);
				break;
			case "!pcm_version":
				sendChat("", "/w " + msg.who + " You are using version " + PCMHelper_Version + " of PCMHelper, authored by " + PCMHelper_Author + ", which was last updated on: " + PCMHelper_LastUpdated + ".");
				break;
		}
	});
	
	function handleQueue() {
        queueProcessor = setInterval(function(){
		    processQueue();
		},5000);
	}
	
	function processQueue() {
		if (state.PCMHelper.Queue !== undefined && state.PCMHelper.Queue.length > 0 ) {
            var procLength = (20 >= state.PCMHelper.Queue.Length ? state.PCMHelper.Queue.Length : 20)
			for (var x=0; x<procLength; x++) {
		        if (state.PCMHelper.Queue.length > 0){
			        var thisChar = findObjs({type:"character", id:state.PCMHelper.Queue[0]})[0];
			        log(`Processing character ${state.PCMHelper.Queue[0]} for ${thisChar.get("name")};`);
			        processCharacter(state.PCMHelper.Queue[0]);
			        processNPC(state.PCMHelper.Queue[0]);
			        processSpells(state.PCMHelper.Queue[0]);
    			    state.PCMHelper.Queue.shift();
			    }
			}
			log(`PCMHelper : Queue Length is now ${state.PCMHelper.Queue.length}`);
		}
	}
	
	function AddQueueItem(charID) {
	    if (!state.PCMHelper.Queue.includes(charID)) {
	        state.PCMHelper.Queue.push(charID);
	    }
	}
	
	function IsInQueue(charID) {
	    var found = false;
		if (state.PCMHelper.Queue == undefined) { 
		    state.PCMHelper.Queue = ""; 
		    found = false;
		}
		if (state.PCMHelper.Queue.indexOf(charID) !== -1) {
		    found = true;
		}
		return found;
	}
	
	on("change:attribute", function(obj) {
		if (obj.get("name").endsWith("_rollbase")) {
			AddQueueItem(obj.get("_characterid"));				
		}
		if (obj.get("name").endsWith("_hasattack")) {
			AddQueueItem(obj.get("_characterid"));				
		}
		if (obj.get("name").endsWith("_spellname")) {
			AddQueueItem(obj.get("_characterid"));				
		}
	});
	
	on("destroy:attribute", function(obj) {
	   if(obj.get("name").endsWith("_spellname")) {
	       AddQueueItem(obj.get("_characterid"));
	   }
	});
	
	on("ready", function() {
		if (!state.PCMHelper) state.PCMHelper = { currentVersion:"Unknown", Queue:[] } ;
		state.PCMHelper.Queue = [];
		var existingMacroVersion = state.PCMHelper.currentVersion;
		if (existingMacroVersion !== PCMHelper_Version) {
		  var html = "<table border=2 width=100%><tr><td bgcolor=red colspan=2 align=center><font color=yellow>PCMHelper</font></td></tr>";
		  html += "<tr><td colspan=2>Your PCMHelper macros are outdated</td></tr>";
		  html += "<tr><td>Installed Ver</td><td>" + existingMacroVersion + "</td></tr>";
		  html += "<tr><td>Available Ver</td><td>" + PCMHelper_Version + "</td></tr>";
		  html += "<tr><td colspan=2>Please consider running <strong>!pcmsetup</strong> to install the latest version of the macros</tr></tr></table>"

		  sendChat("PCMHelper:",html);
		}
		log("-=> PCMHelper v" + PCMHelper_Version + " <=-  [" + PCMHelper_LastUpdated + "]");
		handleQueue();
	});

	function processCharacter(charID)
	{
		// Only run on tokens that represent characters (PCs or NPCs)
		var atklist = "";
		var attrCount = 0;
		var attrs = getRepeatingSectionAttrs(charID, "repeating_attack");
		var attrLen = 0;
		if (attrs !== undefined) { 
			attrLen = attrs[0].length;
		}
		if (attrLen > 0) {
			do {
				var key="repeating_attack_$" + attrCount + "_atkname";
				thisAttr = getAttrByName(charID, "repeating_attack_$" + attrCount + "_atkname");
				var isAttack = getAttrByName(charID, "repeating_attack_$" + attrCount + "_atkflag");
				if (isAttack !== "0") {
					if (thisAttr !== "") {
						atklist += thisAttr + "|";
					}
				}
				attrCount += 1;
			} while (thisAttr !== "" && attrCount < attrLen);
		}
		oldAttrs = findObjs({ _type:"attribute", _characterid:charID, name: "attacklist"});
		if (oldAttrs.length > 0) {
			oldAttrs.forEach(function(element) { element.remove(); });
		}
		if (atklist !== "") {
			atklist = atklist.slice(0,-1);
			createObj("attribute", { _characterid: charID, name: "attacklist", current: atklist });
		}
	}
	
	function getAttackInfo(msg, player_obj) {
		// Run through all selected tokens
		msg.selected.forEach(function(selected){
			var tokenID;
			var graphicObj;
			var charObj;
			var charID;

			// Retrieve information about what this token represents
			tokenID = selected._id;
			if (tokenID !== undefined) {
				graphicObj = getObj("graphic", tokenID);
			}
			if (graphicObj !== undefined) {
				charObj = getObj("character", graphicObj.get("represents"));
			}
			if (charObj !== undefined) {
				charID = charObj.get("_id");
			}
			if (charID !== undefined) {
				processCharacter(charID);
			}

		});
	}
	
	function processNPC(charID)
	{
		// Only run on tokens that represent characters (PCs or NPCs)
		var attrCount = 0;
		var actionList = "";
		var legendaryList = "";
		var attrs = getRepeatingSectionAttrs(charID, "repeating_npcaction");
		var lattrs = getRepeatingSectionAttrs(charID, "repeating_npcaction-l");
		var attrLen = 0;
		var lattrLen = 0;
		if (attrs !== undefined) { 
			attrLen = attrs[0].length;
		}
		if (lattrs !== undefined) { 
			lattrLen = lattrs[0].length;
		}
		if (attrLen > 0) {
			do {
				var key="repeating_npcaction_$" + attrCount + "_atkname";
				thisAttr = getAttrByName(charID, "repeating_npcaction_$" + attrCount + "_name");
				if (thisAttr !== "") {
					actionList += thisAttr + "|";
				}
				attrCount += 1;
			} while (thisAttr !== "" && attrCount < attrLen);
		}
		var attrCount = 0;
		if (lattrLen > 0) {
			do {
				var key="repeating_npcaction-l_$" + attrCount + "_atkname";
				thisAttr = getAttrByName(charID, "repeating_npcaction-l_$" + attrCount + "_name");
				if (thisAttr !== "") {
					legendaryList += thisAttr + "|";
				}
				attrCount += 1;
			} while (thisAttr !== "" && attrCount < lattrLen);
		}
		oldAttrs = findObjs({ _type:"attribute", _characterid:charID, name: "npcactionlist"});
		if (oldAttrs.length > 0) {
			oldAttrs.forEach(function(element) { element.remove(); });
		}
		oldAttrs = findObjs({ _type:"attribute", _characterid:charID, name: "legendaryactionlist"});
		if (oldAttrs.length > 0) {
			oldAttrs.forEach(function(element) { element.remove(); });
		}
		if (actionList !== "") {
			actionList = actionList.slice(0,-1);
			createObj("attribute", { _characterid: charID, name: "npcactionlist", current: actionList });
		}
		
		if (legendaryList !== "") {
			legendaryList = legendaryList.slice(0,-1);
			createObj("attribute", { _characterid: charID, name: "legendaryactionlist", current: legendaryList });
		}
	}
	
	function processSpells(charID) {
	    try {
        var spell_list = filterObjs(function(z) { return (z.get("characterid") == charID && z.get("name").endsWith("spellname")); });
		var cantrips = sortByKey(spell_list.filter(s => s.get("name").startsWith("repeating_spell-cantrip")), "current");
		var L1Spells = sortByKey(spell_list.filter(s => s.get("name").startsWith("repeating_spell-1")), "current");
		var L2Spells = sortByKey(spell_list.filter(s => s.get("name").startsWith("repeating_spell-2")), "current");
		var L3Spells = sortByKey(spell_list.filter(s => s.get("name").startsWith("repeating_spell-3")), "current");
		var L4Spells = sortByKey(spell_list.filter(s => s.get("name").startsWith("repeating_spell-4")), "current");
		var L5Spells = sortByKey(spell_list.filter(s => s.get("name").startsWith("repeating_spell-5")), "current");
		var L6Spells = sortByKey(spell_list.filter(s => s.get("name").startsWith("repeating_spell-6")), "current");
		var L7Spells = sortByKey(spell_list.filter(s => s.get("name").startsWith("repeating_spell-7")), "current");
		var L8Spells = sortByKey(spell_list.filter(s => s.get("name").startsWith("repeating_spell-8")), "current");
		var L9Spells = sortByKey(spell_list.filter(s => s.get("name").startsWith("repeating_spell-9")), "current");
			
		nameList = "cantrip_list|l1_spell_list|l2_spell_list|l3_spell_list|l4_spell_list|l5_spell_list|l6_spell_list|l7_spell_list|l8_spell_list|l9_spell_list";
		var attrNames = nameList.split("|");

		attrNames.forEach(function(attrName) {
		oldAttrs = findObjs({ _type:"attribute", _characterid:charID, name: attrName} );
			if (oldAttrs.length > 0)
			{
				oldAttrs.forEach(function(element) { element.remove(); });
			}
		});
					
		var attrText = "";
		if (cantrips.length > 0) {
			cantrips.forEach(function(s) { attrText += s.get("current") + "|" });
			attrText = attrText.slice(0,-1);
			createObj("attribute", { _characterid: charID, name: "cantrip_list", current: attrText });
		}
					
		attrText = "";
		if (L1Spells.length > 0) {
			L1Spells.forEach(function(s) { attrText += s.get("current") + "|" });
			attrText = attrText.slice(0,-1);
			createObj("attribute", { _characterid: charID, name: "l1_spell_list", current: attrText });
		}
					
		attrText = "";
		if (L2Spells.length > 0) {
			L2Spells.forEach(function(s) { attrText += s.get("current") + "|" });
			attrText = attrText.slice(0,-1);
			createObj("attribute", { _characterid: charID, name: "l2_spell_list", current: attrText });
		}					
				
		attrText = "";
		if (L3Spells.length > 0) {
			L3Spells.forEach(function(s) { attrText += s.get("current") + "|" });
			attrText = attrText.slice(0,-1);
			createObj("attribute", { _characterid: charID, name: "l3_spell_list", current: attrText });
		}										

		attrText = "";
		if (L4Spells.length > 0) {
			L4Spells.forEach(function(s) { attrText += s.get("current") + "|" });
			attrText = attrText.slice(0,-1);
			createObj("attribute", { _characterid: charID, name: "l4_spell_list", current: attrText });
		}

		attrText = "";
		if (L5Spells.length > 0) {
			L5Spells.forEach(function(s) { attrText += s.get("current") + "|" });
			attrText = attrText.slice(0,-1);
			createObj("attribute", { _characterid: charID, name: "l5_spell_list", current: attrText });
		}

		attrText = "";
		if (L6Spells.length > 0) {
			L6Spells.forEach(function(s) { attrText += s.get("current") + "|" });
			attrText = attrText.slice(0,-1);
			createObj("attribute", { _characterid: charID, name: "l6_spell_list", current: attrText });
		}

		attrText = "";
		if (L7Spells.length > 0) {
			L7Spells.forEach(function(s) { attrText += s.get("current") + "|" });
			attrText = attrText.slice(0,-1);
			createObj("attribute", { _characterid: charID, name: "l7_spell_list", current: attrText });
		}

		attrText = "";
		if (L8Spells.length > 0) {
			L8Spells.forEach(function(s) { attrText += s.get("current") + "|" });
			attrText = attrText.slice(0,-1);
			createObj("attribute", { _characterid: charID, name: "l8_spell_list", current: attrText });
		}

		attrText = "";
		if (L9Spells.length > 0) {
			L9Spells.forEach(function(s) { attrText += s.get("current") + "|" });
			attrText = attrText.slice(0,-1);
			createObj("attribute", { _characterid: charID, name: "l9_spell_list", current: attrText });
		}
	    } catch { }
	}
	
	function getNPCActionInfo(msg, player_obj) {
		// Run through all selected tokens
		msg.selected.forEach(function(selected){
			var tokenID;
			var graphicObj;
			var charObj;
			var charID;
			// Retrieve information about what this token represents
			tokenID = selected._id;
			if (tokenID !== undefined) {
				graphicObj = getObj("graphic", tokenID);
			}
			if (graphicObj !== undefined) {
				charObj = getObj("character", graphicObj.get("represents"));
			}
			if (charObj !== undefined) {
				charID = charObj.get("_id");
			}
			if (charID !== undefined) {
				processNPC(charID);
			}
		});
	}
	
	function getSpellInfo(msg, player_obj) {
		msg.selected.forEach(function(selected){
			var tokenID;
			var graphicObj;
			var charObj;
			var charID;
			tokenID = selected._id;
			if (tokenID !== undefined) {
				graphicObj = getObj("graphic", tokenID);
			}
			if (graphicObj !== undefined) {
				charObj = getObj("character", graphicObj.get("represents"));
			}
			if (charObj !== undefined) {
				charID = charObj.get("_id");
			}
			if (charID !== undefined) {
				processSpells(charID);
			}
		});
	}
	
	function sortByKey(array, key) {
		return array.sort(function(a, b) {
			var x = a.get(key);
			var y = b.get(key);
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		});
	}
	
	const getRepeatingSectionAttrs = function (charid, prefix) {
		// Input
		//  charid: character id
		//  prefix: repeating section name, e.g. 'repeating_weapons'
		// Output
		//  repRowIds: array containing all repeating section IDs for the given prefix, ordered in the same way that the rows appear on the sheet
		//  repeatingAttrs: object containing all repeating attributes that exist for this section, indexed by their name
		const repeatingAttrs = {},
			regExp = new RegExp(`^${prefix}_(-[-A-Za-z0-9]+?|\\d+)_`);
		let repOrder;
		// Get attributes
		findObjs({
			_type: 'attribute',
			_characterid: charid
		}).forEach(o => {
			const attrName = o.get('name');
			if (attrName.search(regExp) === 0) repeatingAttrs[attrName] = o;
			else if (attrName === `_reporder_${prefix}`) repOrder = o.get('current').split(',');
		});
		if (!repOrder) repOrder = [];
		// Get list of repeating row ids by prefix from repeatingAttrs
		const unorderedIds = [...new Set(Object.keys(repeatingAttrs)
			.map(n => n.match(regExp))
			.filter(x => !!x)
			.map(a => a[1]))];
		const repRowIds = [...new Set(repOrder.filter(x => unorderedIds.includes(x)).concat(unorderedIds))];
		return [repRowIds, repeatingAttrs];
	}
	
	function createHandouts() {
		
		// Start by removing existing handouts if they are in the game
		var Handouts = findObjs({
			_type : "handout",
		});
		
		Handouts.forEach(function (handout) {
			if (handout.get("name").startsWith("PowerCard Replacements PCMHelper")) {
				handout.remove();
			};
			if (handout.get("name").startsWith("PowerCard Templates PCMHelper")) {
				handout.remove();
			};
		});

		// Create the handouts. Note the because of an API bug, the Notes cannot be set
		// during creation and if an attempt is made to do that, they are bugged and can't
		// be set after creation either, so create them empty.
		createObj("handout", { name:"PowerCard Replacements PCMHelper"});
		createObj("handout", { name:"PowerCard Templates PCMHelper"});
		
		// Now loop through the handouts again and set the notes for them.
		Handouts = findObjs({
			_type : "handout",
		});
		
		Handouts.forEach(function (handout) {
			if (handout.get("name").startsWith("PowerCard Replacements PCMHelper")) {
				handout.set("notes", pc_replacements);
			};
			if (handout.get("name").startsWith("PowerCard Templates PCMHelper")) {
				handout.set("notes", pc_templates);
			};
		});
	}
	
	function createPCMacros(player) {
		var pid = player.get("id");
		
		var Macros = findObjs({
			_type : "macro",
		});
		
		Macros.forEach(function (macro) {
			if (macro.get("name") === "NPC-Action") {
				macro.remove();
			}
			if (macro.get("name") === "NPC-Legendary") {
				macro.remove();
			}
			if (macro.get("name") === "PC-Attack") {
				macro.remove();
			}			
			if (macro.get("name") === "Cast-Cantrip") {
				macro.remove();
			}			
			if (macro.get("name") === "Cast-L1") {
				macro.remove();
			}			
			if (macro.get("name") === "Cast-L2") {
				macro.remove();
			}			
			if (macro.get("name") === "Cast-L3") {
				macro.remove();
			}			
			if (macro.get("name") === "Cast-L4") {
				macro.remove();
			}			
			if (macro.get("name") === "Cast-L5") {
				macro.remove();
			}			
			if (macro.get("name") === "Cast-L6") {
				macro.remove();
			}			
			if (macro.get("name") === "Cast-L7") {
				macro.remove();
			}			
			if (macro.get("name") === "Cast-L8") {
				macro.remove();
			}			
			if (macro.get("name") === "Cast-L9") {
				macro.remove();
			}			
		});
		
		createObj("macro", { name:"NPC-Action", playerid:pid });
		createObj("macro", { name:"NPC-Legendary", playerid:pid });
		createObj("macro", { name:"PC-Attack", playerid:pid, visibleto:"all", istokenaction:true  });
		createObj("macro", { name:"Cast-Cantrip", playerid:pid, visibleto:"all", istokenaction:true  });
		createObj("macro", { name:"Cast-L1", playerid:pid, visibleto:"all", istokenaction:true  });
		createObj("macro", { name:"Cast-L2", playerid:pid, visibleto:"all", istokenaction:true  });
		createObj("macro", { name:"Cast-L3", playerid:pid, visibleto:"all", istokenaction:true  });
		createObj("macro", { name:"Cast-L4", playerid:pid, visibleto:"all", istokenaction:true  });
		createObj("macro", { name:"Cast-L5", playerid:pid, visibleto:"all", istokenaction:true  });
		createObj("macro", { name:"Cast-L6", playerid:pid, visibleto:"all", istokenaction:true  });
		createObj("macro", { name:"Cast-L7", playerid:pid, visibleto:"all", istokenaction:true  });
		createObj("macro", { name:"Cast-L8", playerid:pid, visibleto:"all", istokenaction:true  });
		createObj("macro", { name:"Cast-L9", playerid:pid, visibleto:"all", istokenaction:true  });
		
		var Macros = findObjs({
			_type : "macro",
		});
		
		Macros.forEach(function (macro) {
			if (macro.get("name") === "NPC-Action") {
				macro.set("action", pc_npcaction);
			}
			if (macro.get("name") === "NPC-Legendary") {
				macro.set("action", pc_legendary);
			}
			if (macro.get("name") === "PC-Attack") {
				macro.set("action", pc_pcattack);
			}			
			if (macro.get("name") === "Cast-Cantrip") {
				macro.set("action", pc_cantrip);
			}			
			if (macro.get("name") === "Cast-L1") {
				macro.set("action", pc_level1);
			}			
			if (macro.get("name") === "Cast-L2") {
				macro.set("action", pc_level2);
			}			
			if (macro.get("name") === "Cast-L3") {
				macro.set("action", pc_level3);
			}			
			if (macro.get("name") === "Cast-L4") {
				macro.set("action", pc_level4);
			}			
			if (macro.get("name") === "Cast-L5") {
				macro.set("action", pc_level5);
			}			
			if (macro.get("name") === "Cast-L6") {
				macro.set("action", pc_level6);
			}			
			if (macro.get("name") === "Cast-L7") {
				macro.set("action", pc_level7);
			}			
			if (macro.get("name") === "Cast-L8") {
				macro.set("action", pc_level8);
			}			
			if (macro.get("name") === "Cast-L9") {
				macro.set("action", pc_level9);
			}			
		});

	}
})();