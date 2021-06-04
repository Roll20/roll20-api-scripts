/**
 * @typedef {Object} Roll20Object
 * @typedef {{field: string, name: string, type: number}} Field
 * @typedef {{name: string, cat: string, value: number, tags: string[], targets: string[]}} Modifier
 */

class Pathfinder2Utils {

    /**
     * Send a message to public chat with the script's name.
     * @param {String} msg The message to send
     */
    send(msg) {
        sendChat("PF2", msg);
    }

    /**
     * Applies a function to a value if it's not nullish, else returns the same nullish.
     * @param value
     * @param func
     * @returns {null|undefined|*}
     */
    nino(value, func) {
        if (value === null) return null;
        if (value === undefined) return undefined;
        return func(value);
    }

    ninos(value, funcs) {
        let v = value;
        for (let func of funcs) {
            v = this.nino(v, func);
        }
        return v;
    }

    /**
     * Checks if a string parameter is effectively absent via being null or blank.
     * @param str
     * @returns {boolean} True if the string is effectively null.
     */
    isAbsentString(str) {
        if (str === null) return true;
        if (str === undefined) return true;
        if (str === "") return true;
        return false;
    }

    /**
     * Return an ordinal number for the Pathfinder 2 skill proficiency letter specified.
     * @param {!String} letter The skill letter.
     * @returns {!number} An ordinal rank for the skill proficiency, with unknown valued defaulted to untrained.
     */

    skillOrdinal(letter) {
        switch(letter) {
            case "": return 0;
            case "U": return 0;
            case "T": return 1;
            case "E": return 2;
            case "M": return 3;
            case "L": return 4;
            default: return 0;
        }
    }

    /**
     * Standardise a skill proficiency letter read from a character sheet.
     * @param {!string} letter
     * @returns {!string}
     */
    standardiseSkillLetter(letter) {
        switch(letter) {
            case "": return "U";
            case "U": case "T": case "E": case "M": case "L":
                return letter;
            case "u": case "t": case "e": case "m": case "l":
                return letter.toUpperCase();
            default: return "U";
        }
        return "U";
    }

    /**
     * Get all tokens listed as selected on an input message.
     * @param selected The selected component of the input message.
     * @returns {Roll20Object[]} The list of selected tokens.
     */
    selectedTokens(selected) {
        if (selected === undefined) return [];
        let realObjs = selected.map((x) => getObj(x._type, x._id));
        let tokens = realObjs.filter((x) => (x.get("_subtype") === "token"));
        return tokens;
    }

    /**
     * Canonize a name by removing spaces and converting to lower case.
     * @param {!string} name The input name.
     * @returns {!string} The standardised name.
     */
    abbreviate(name) {
        return name.replace(/ /g, "").toLowerCase();
    }

    /**
     * Convert a dictionary to a string that produces a roll20 standard template showing members of that dict.
     * @param {string} title
     * @param {Object.<string,(string|number)>} dict The data to be included in the template.
     * @returns {string} The template string.
     */
    dictToTemplate(title, dict) {
        let out = "&{template:default} {{name=" + title + "}} ";
        for (let key in dict) {
            if (dict.hasOwnProperty(key)) {
                out = out + "{{" + key + "=" + dict[key] + "}} ";
            }
        }
        return out;
    }

    /**
     * Get the character a particular token represents.
     * @param {!Roll20Object} token The token.
     * @returns {?Roll20Object} The represented character, or null if no character represented.
     */
    getCharForToken(token) {
        if (token.get("represents") === "") {
            return null;
        }
        let charId = token.get("represents");
        let char = getObj("character", charId);
        return char;
    }


    /**
     * Get the name for a token, from its character or itself, or else an unknown placeholder.
     * @param {!Roll20Object} token The token.
     * @returns {!string} The name for the token.
     */
    getTokenName(token) {
        let char = this.getCharForToken(token);
        if (char !== null) {
            let charName = char.get("name");
            if (!this.isAbsentString(charName)) return charName;
        }
        if (!this.isAbsentString(token.get("name"))) return token.get("name");
        return "(Unknown)";
    }

    /**
     * Get all tokens on the active player page.
     * @returns {!Roll20Object[]} The list of all tokens.
     */
    getPageTokens() {
        let curPage = Campaign().get("playerpageid");
        let tokens = filterObjs(x => ((x.get("_subtype") === "token") && (x.get("_pageid") === curPage)));
        return tokens;
    }

    /**
     * Returns true if the token is controlled by someone other than the GM.
     * @param {!Roll20Object} token The token
     * @returns {!boolean} True the token represents a character controlled by a non-GM.
     */
    tokenIsPC(token) {
        let char = this.getCharForToken(token);
        if (char === null) return false;
        return (_.some(char.get("controlledby"), (x => !playerIsGM(x))));
    }


    /**
     * Find the tokens referred to by a fragment of a target specifier.
     * @param {!String} specifier The specifier
     * @returns {!Roll20Object[]} The tokens it likely refers to.
     */
    findTargetToken(specifier) {
        let canonSpec = this.abbreviate(specifier);
        let tokens = this.getPageTokens();
        let matches = [];
        for (let token of tokens) {
            if (canonSpec === "pcs") {
                if (this.tokenIsPC(token)) matches.push(token);
            } else if (canonSpec === "npcs") {
                if ((this.getCharForToken(token) !== null) && (!this.tokenIsPC(token))) matches.push(token);
            } else if (canonSpec === "all") {
                if (this.getCharForToken(token) !== null) matches.push(token);
            } else {
                if (this.abbreviate(this.getTokenName(token)).startsWith(canonSpec)) matches.push(token);
            }
        }
        return matches;
    }

    /**
     * Reads the turn order.
     * @returns {!*[]}
     */

    getTurnOrder() {
        let strOrder = Campaign().get("turnorder");
        if (strOrder === "") {
            return [];
        } else {
            return JSON.parse(strOrder);
        }
    }

    /**
     * Updates a token's value in the turn order; adding if it is not there, replacing it if it is
     * already present; and placing it so that the list remains in descending roll order.
     * @param {!Roll20Object} token The token object to update.
     * @param {!number} newOrder The new turn order value.
     */

    updateTurnOrder(token, newOrder) {
        let order = this.getTurnOrder();
        order = _.reject(order, x => x.id === token.get("_id"));
        let pos=0;
        for (pos=0; pos<order.length; pos++) {
            if (parseInt(order[pos].pr) < newOrder) break;
        }
        order.splice(pos, 0, {"id": token.get("_id"), "pr": newOrder, "custom": ""});
        Campaign().set("turnorder", JSON.stringify(order));
    }

    /**
     * Rolls a d20 using the approved RNG.
     * @returns {!Number} A random number from 1-20.
     */
    d20() {
        return randomInteger(20);
    }

    /**
     * Get the named attribute value of the character represented by given token.
     * @param {!Roll20Object} token The token.
     * @param {!string} property The name of the property.
     * @returns {null|string|number} The property value or null if it's missing.
     */
    getTokenAttr(token, property) {
        let char = this.getCharForToken(token);
        if (char === null) {
            return null;
        }
        let result = getAttrByName(char.id, property);
        return result;
    }

    /**
     * Get the description for the named field from the field database.
     * @param {!string} strname
     * @returns {?Field} The data stored about the field.
     */

    getNamedField(strname) {
        let shoname = this.abbreviate(strname);
        return this.fields.find(x => x.name.startsWith(shoname));
    }

    /**
     * Get the Roll20 attribute name from an internal field name.
     * @param {!string} strname The internal field name.
     * @returns {?string} The Roll20 attribute name.
     */
    namedFieldToAttrName(strname) {
        let field = this.getNamedField(strname);
        return field.field;
    }

    /**
     * Takes a string representing a sum as written arithmetic and adds another number to it.
     * @param sum The string sum.
     * @param number The number to add.
     * @returns {string} The new string sum.
     */

    appendNumToSum(sum, number) {
        if (number === 0) return sum;
        if (number > 0) return sum + " + " + number;
        return sum + " - " + (-number);
    }


    /**
     * Roll a dice and add a given number of rolls and given set of modifiers.
     * @param target
     * @param attributes
     * @param modifiers
     * @returns {{roll: number, text: string}} The roll result.
     */
    rollAttribute(target, attributes, modifiers, tags) {
        let char = this.getCharForToken(target);
        let impliedtags = [];
        let modString = "";
        let ok = false;
        let modtotal = 0;

        /* Calculate list of implied rolltags to add to specified tags. */
        for (let attr of attributes) {
            /* Always include the name of each rolled attribute as an implied tag. */
            impliedtags.push(attr.name);
            /* If it has a governing stat, add that stat too. */
            if (attr.stat) {
                let tagName = this.st_names[attr.stat];
                if (!impliedtags.includes(tagName)) impliedtags.push(tagName);
            }
        }

        /* Calculate the total modifier for all tags and add that to specified modules. */
        let fulltags = tags.concat(impliedtags);
        let tagmod = this.calculateTotalMod(target, fulltags);
        modifiers.push(tagmod);

        /* Get all attributes to be rolled. */
        for (let attr of attributes) {
            let bad = false;
            let propertyValue = this.getTokenAttr(target, attr.field);
            // Property value missing? Default to 0.
            if (propertyValue == null) {
                propertyValue = 0;
                bad = true;
            }
            // Property value not a number (possibly an empty string)? Default to 0.
            let numProp = parseInt(propertyValue);
            if (isNaN(numProp)) {
                numProp = 0;
                bad = true;
            }
            // Add property to total and to output sum.
            modString = this.appendNumToSum(modString, numProp);
            modtotal += numProp;
            if (!bad) ok = true;
        }

        // Give up only if _all_ attributes were invalid or not found.
        if (!ok) {
            return { "text": "(Invalid)", "roll": 0 };
        }

        // Add all static modifiers to sum and total.
        for (let mod of modifiers) {
            modString = this.appendNumToSum(modString, mod);
            modtotal += mod;
        }

        // Roll the dice and add it to the total.
        let roll = this.d20();
        modString = roll + modString;
        let modroll = roll + modtotal;

        // Add total to output string. If dice roll was 20 or 1, add a fudge to make the total value appear
        // with critical or fumble colouring.
        modString = modString + " = [[" + modroll;
        if (roll === 20) {
            if (roll === 20) modString += "+d0cs0";
            if (roll === 1) modString += "+d0cs1cf0";
        }
        modString = modString + "]]";

        if (modroll < this.level_dcs[0]) {
            modString += " (NoLvl, ";
        } else {
            let level = 0;
            while ((modroll > this.level_dcs[level])) {
                level++;
            }
            modString += " (Lv" + level + ", ";
        }
        modString += "+" + (modroll-10) + " opposing)";
        return { "text": modString, "roll": modroll };
    }

    /**
     * Carries out the named PF2 ability. This is the "ability" command.
     * @param {string} abilityString The user specification of the ability.
     * @param {string} freeSkill The user specification of the skill to be used for free skill abilities.
     * @param {Roll20Object[]} targets The list of targets.
     */
    doAbility(abilityString, freeSkill, targets, tags) {
        // Find the ability in the ability list
        let abspec = this.abbreviate(abilityString);
        let ability = this.abilities.find(x => this.abbreviate(x.name).startsWith(abspec));
        if (ability === undefined) {
            return ("Unknown ability, " + abilityString);
        }
        // If it's a free skill ability, user must specify the skill; otherwise, use the one from the ability
        // list
        let wasFreeSkill = false;
        let skill = "";
        if (ability.skill === "") {
            if (freeSkill === undefined) {
                return (ability.name + " is a free skill ability. Please specify the skill to use.");
            }
            wasFreeSkill = true;
            skill = freeSkill;
        } else {
            skill = ability.skill;
        }
        // Check for all targets..
        let results = {};
        let skillreq = this.skillOrdinal(ability.reqprof);
        for (let target of targets) {
            let char = this.getCharForToken(target);
            let name = this.getTokenName(target);
            if (char === null) {    // Target doesn't have a character sheet
                results[name] = "(No sheet)";
                continue;
            }
            // Get skill proficiency level to check proficiency prerequisite
            let skillLevel = this.getTokenAttr(target, skill + "_proficiency_display");
            if (skillLevel === undefined) {
                results[name] = "(Not on sheet)";
                continue;
            }
            if (this.skillOrdinal(skillLevel) < skillreq) {
                results[name] = "(Not qualified - " + this.standardiseSkillLetter(skillLevel) + ")";
                continue;
            }
            // All ok, do the roll
            let roll = this.rollAttribute(target, [this.getNamedField(skill)],[], tags);
            results[name] = roll.text + " (" + this.standardiseSkillLetter(skillLevel) + ")";
        }
        let header = ability.name;
        if (wasFreeSkill) header = header + " (" + freeSkill + ")";

        let answer = "";
        if (ability.tags.includes("Secret")) {
            answer = answer + "(Rolled in secret.)";
            this.send("/w gm " + this.dictToTemplate(header, results));
        } else {
            answer = answer + this.dictToTemplate(header, results);
        }
        let infodict = {
            "Tags": ability.tags.join(", "),
            "Critical": ability.crit, "Success": ability.hit,
            "Fail": ability.miss, "Fumble": ability.fumble,
        };
        if (ability.dc) {
            infodict["DC"] = ability.dc;
        }
        if (ability.tags.includes("Incapacitation")) {
            infodict["Incapacitation"] = "Higher level targets promote their result one step.";
        }
        answer = answer + (this.dictToTemplate(header, infodict));
        return answer;
    }


    /**
     * Fetches a property value. This corresponds to the "get" command.
     * @param {string} property The user specification of the property name.
     * @param {Roll20Object[]} targets The target list.
     */
    getProperty(property, targets) {
        let results = {};
        let attr = this.getNamedField(property);
        if (attr === undefined) {
            return ("Unknown character property, " + property);
        }
        for (let target of targets) {
            let char = this.getCharForToken(target);
            let propertyValue = this.getTokenAttr(target, attr.field);
            let name = this.getTokenName(target);

            if (propertyValue == null) {
                results[name] = "(No sheet)";
            } else {
                results[name] = propertyValue;
            }
        }
        return (this.dictToTemplate("Get " + attr.name, results));
    }

    /**
     * Rolls a property value. This corresponds to the "roll" command.
     * @param {string} property The property name to roll.
     * @param {Roll20Object[]} targets The target list.
     * @param {boolean} isInit Should initiative modifier be added?
     * @param {boolean }setInit Should turn tracker be updated?
     * @param {String[]} tags List of extra rolltags.
     * @returns {string} Command response.
     */
    rollProperty(property, targets, isInit, setInit, tags) {
        let results = {};
        let attr = this.getNamedField(property);
        if (attr === undefined) {
            return ("Unknown character property, " + property);
        }
        for (let target of targets) {
            let name = this.getTokenName(target);
            if (name === undefined) continue;
            let roll;
            if (isInit) {
                roll = this.rollAttribute(target, [attr, this.getNamedField("initiative")], [], tags);
            } else {
                roll = this.rollAttribute(target, [attr], [], tags);
            }
            results[name] = roll.text;
            if (setInit) this.updateTurnOrder(target, roll.roll);
        }
        let header = "Roll " + attr.name;
        if (isInit) header += " (Initiative)";
        return (this.dictToTemplate(header, results));
    }

    /**
     * Calculates the best value of a given property in the range. This corresponds to the "best" command.
     * @param {string} property The property name.
     * @param {Roll20Object[]} targets The target list.
     * @returns {string} Command response.
     */
    bestProperty(property, targets) {
        let bestName = "";
        let bestValue = -9999;
        let attr = this.getNamedField(property);
        if (attr === undefined) {
            return ("Unknown character property, " + property);
        }
        for (let target of targets) {
            let value = this.getTokenAttr(target, attr.field);
            if (value === null) continue;
            if (value > bestValue) {
                bestValue = value;
                bestName = this.getTokenName(target);
            }
        }
        if (bestValue === -9999) {
            return ("No best " + property + " found.");
        } else {
            let results = {};
            results[bestName] = bestValue;
            return (this.dictToTemplate("Best " + attr.name, results));

        }
    }

    /**
     * Get the list of all targets given by a written target specifier.
     * @param {string} spec The target specifier, including the initial @.
     * @returns {Roll20Object[]} The list of targets found (which may be empty)
     */
    getSpecifiedTargets(spec) {
        let targets = [];
        let targetNameList = spec.slice(1).split(",");
        for (let targetName of targetNameList) {
            let thisTargets = this.findTargetToken(targetName);
            targets = targets.concat(thisTargets);
        }
        return targets;
    }

    /**
     * Get the list of targets implied by a message that didn't have a target specifier.
     * @param msg The roll20 message object.
     * @returns {Roll20Object[]|null|*[]}
     */
    getInferredTargets(msg) {
        // Were there tokens selected? If so, use those.
        let selected = this.selectedTokens(msg.selected);
        if (selected !== null) return selected;

        // If the player is the GM, don't try to do control default selection.
        if (playerIsGM(msg.playerid)) return [];

        // Default to all tokens we control.
        let allTokens = this.getPageTokens();
        let possTokens = null;
        for (let token of allTokens) {
            let char = this.getCharForToken(token);
            if (char === null) continue;
            if (_.some(char.get("controlledby"),(x => x === msg.playerid))) {
                possTokens = possTokens.push(token);
            }
        }
        return possTokens;
    }

    /**
     * Outputs the list of modifiers for given rolltags. This corresponds to the mod list command.
     * @param tags The list of tags (not used?)
     * @returns {string} Command output.
     */
    listMods(tags) {
        let out = "<table><tr><th>Name</th><th>Mod</th><th>Type</th></tr>";
        for (let mod of state.PF2.modifiers) {
            out = out + "<tr><td>" + mod.name + "</td><td>" + mod.value + "</td><td>" + mod.cat + "</td></tr>";
            out = out + "<tr><td colspan='3'>" + mod.tags.join(", ") + "</td></tr>";
            out = out + "<tr><td colspan='3'>" + mod.targets.map(x => this.getTokenName(getObj("graphic",x))).join(", ") + "</td></tr>";
        }
        out = out + "</table>";
        return out;
    }

    /**
     * Adds a given modifier for a set of rolltags. This corresponds to the mod add command.
     * @param {string} name The name for the modifier.
     * @param {string} cat The modifier category.
     * @param {number} amount The value of the modifier.
     * @param {Roll20Object[]} targets The targeted tokens.
     * @param {string[]} tags The affected rolltags.
     * @returns {string} Command output.
     */
    addMod(name, cat, amount, targets, tags) {
        if (name === undefined) return "Modifier name missing.";
        if (cat === undefined) return "Modifier category missing.";
        if (amount === undefined) return "Modifier value missing.";
        let imod = parseInt(amount);
        if (isNaN(imod)) return "Modifier value " + amount + " is not a number.";
        if (tags.length === 0) return "Modifier must have some tags.";
        if (!["c","i","s","u"].includes(cat)) {
            return "Category must be (c)ircumstance, (s)tatus, (i)tem or (u)ntyped.";
        }
        let action = "Added ";
        let existingIndex = state.PF2.modifiers.findIndex( x => x.name === name);
        if (existingIndex !== -1) {
            state.PF2.modifiers.splice(existingIndex,1);
            action = "Updated ";
        }
        state.PF2.modifiers.push( { "name": name, "cat": cat, "value": amount, "tags": tags,
            "targets": targets.map( x => x.id )} );
        return action +"modifier " + name + ":" + amount + cat + ".";
    }

    /**
     * Removes a named modifier. This corresponds to the mod del command.
     * @param {string} name The name of the modifier.
     * @returns {string} Command output.
     */
    delMod(name) {
        if (name === undefined) return "Modifier name missing.";
        let existingIndex = state.PF2.modifiers.findIndex(x => x.name === name);
        if (existingIndex === -1) {
            return "Modifier " + name + " not found.";
        } else {
            state.PF2.modifiers.splice(existingIndex,1);
            return "Modifier " + name + " deleted.";
        }
    }

    /**
     * Identifies if a given modifier applies to a given target and tag set.
     * @param {Modifier} mod The modifier.
     * @param {Roll20Object} target The target token.
     * @param {string[]} tags The list of rolltags.
     * @returns {boolean} Does the modifier apply?
     */
    modApplies(mod, target, tags) {
        if (!_.contains(mod.targets,target.id)) return false;
        return _.every(mod.tags, x => _.contains(tags,x));
    }

    /**
     * Clears all modifiers. This corresponds to the mod clear command.
     * @returns {string} Command output.
     */
    clearMods() {
        state.PF2.modifiers = [];
        return "All modifiers cleared.";
    }

    /**
     * Calculate the total modifier to apply to a given target with given rolls.
     * @param {Roll20Object} target The target token.
     * @param {string[]} tags The list of roll tags.
     * @returns {number} The modifier.
     */
    calculateTotalMod(target, tags) {
        let bests = {};
        let worsts = {};
        let total = 0;
        // Loop through all modifiers that apply.
        for (let mod of state.PF2.modifiers) {
            if (this.modApplies(mod, target, tags)) {
                // If it's not untyped
                if (mod.cat !== "u") {
                    // Check if it is either the best bonus so far in that type, or the worst penalty.
                    let imod = parseInt(mod.value);
                    if (imod >= 0) {
                        let oldBest = bests[mod.cat];
                        if ((oldBest === undefined) || (oldBest <= imod)) {
                            bests[mod.cat] = imod;
                        }
                    } else {
                        let oldWorst = worsts[mod.cat];
                        if ((oldWorst === undefined) || (oldWorst >= imod)) {
                            worsts[mod.cat] = imod;
                        }
                    }
                } else {
                    // Untyped bonuses and penalties always apply.
                    total += parseInt(mod.value);
                }
            }
        }
        // Add up the bests and worsts from each category.
        for (let cat in bests) { total += bests[cat]; }
        for (let cat in worsts) { total += worsts[cat]; }
        return total;
    }

    /**
     * Explain the modifier total for given targets and tags. This corresponds to the mod explain command and
     * could probably be better written.
     * @param {Roll20Object[]} targets The target tokens.
     * @param {String[]} tags The rolltags.
     * @returns {string} Command output.
     */
    explainMods(targets, tags) {
        let out = "";
        let bests = {};
        let worsts = {};

        for (let target of targets) {
            for (let mod of state.PF2.modifiers) {
                if (this.modApplies(mod, target, tags)) {
                    if (mod.cat !== "u") {
                        let imod = parseInt(mod.value);
                        if (imod >= 0) {
                            let oldBest = bests[mod.cat];
                            if ((oldBest === undefined) || (parseInt(oldBest.value) <= imod)) {
                                bests[mod.cat] = mod;
                            }
                        } else {
                            let oldWorst = worsts[mod.cat];
                            if ((oldWorst === undefined) || (parseInt(oldWorst.value) >= imod)) {
                                worsts[mod.cat] = mod;
                            }
                        }
                    }
                }
            }

            let total = 0;
            out = out + "<table><tr><th colspan='2'>" + this.getTokenName(target) + "</th></tr>";
            out = out + "<tr><th>Name</th><th>Mod</th></tr>";
            for (let mod of state.PF2.modifiers) {
                if (this.modApplies(mod, target, tags)) {
                    out = out + "<tr>";
                    let ok = false;
                    let imod = parseInt(mod.value);
                    if (mod.cat !== "u") {
                        if (imod >= 0) {
                            if ((mod.name !== bests[mod.cat].name)) {
                                out = out + "<td>" + mod.name + "</td><td>" + mod.value + mod.cat +
                                    "(overridden by " + bests[mod.cat].name + ")</td></tr>";
                                continue;
                            }
                        } else {
                            if ((mod.name !== worsts[mod.cat].name)) {
                                out = out + "<td>" + mod.name + "</td><td>" + mod.value + mod.cat +
                                    "(overridden by " + worsts[mod.cat].name + ")</td></tr>";
                                continue;
                            }
                        }
                    }
                    out = out + "<td>" + mod.name + "</td><td>" + mod.value + mod.cat + "</td></tr>";
                    total = total + imod;
                }
            }
            out = out + "<tr><td>Total</td><td>" + total + "</td></tr></table><br>";
        }
        return out;
    }

    /**
     * Return the parameter specification string based on a command.
     * @param cmd The command specifier.
     * @returns {string} The parameter specification string.
     */
    describeCommand(cmd) {
        let desc = "";
        if (cmd.cat) desc = desc + cmd.cat + " ";
        desc = desc + cmd.cmd;
        if (cmd.activeOption) desc = desc + "[!]";
        for (let param of cmd.params) {
            let effName = param.name;
            if (param.mustInt) effName = "#" + effName;
            if (param.default) {
                desc = desc + " &lt;" + effName + "(" + param.default + ")&gt;";
            } else if (param.optional) {
                desc = desc + " [" + effName + "]";
            } else {
                desc = desc + " &lt;" + effName + "&gt;";
            }
        }
        return desc;
    }

    /**
     * Message event handler.
     * @param msg The incoming message.
     */
    message(msg) {
        // Check it's for us.
        if (msg.type === "api") {
            if (msg.content.startsWith("!pf")) {
                // If it starts with !pfs it's secret. If it starts with something else that isn't exactly !pf,
                // eg !pffoo, it's not for us at all.
                let allParts = msg.content.split(" ");
                let secret = false;
                if (allParts[0] === "!pfs") {
                    secret = true;
                } else {
                    if (allParts[0] !== "!pf") return;
                }
                // Chop off any word that starts with # as a rolltag.
                let rollTags = allParts.filter(x => x.startsWith("#")).map(x => x.slice(1));
                let parts = _.reject(allParts, x => x.startsWith("#"));

                // Chop off any word that starts with @ as a target spec.
                let targets = [];
                let targetSpecs = parts.filter(x => x.startsWith("@"));
                parts = _.reject(parts, x => x.startsWith("@"));

                // Get targets based on all target specs.
                for (let spec of targetSpecs) {
                    targets = targets.concat(this.getSpecifiedTargets(spec));
                }
                // If we didn't get any, try inferred targets.
                if (targets === []) {
                    targets = this.getInferredTargets(msg);
                }

                // Get the first word that's left as the candidate command.
                let active = false;
                let command = parts[1];
                // If the user for some weird reason didn't bother typing a command.
                if (command === undefined) {
                    return;
                }

                // ! on the end of a command acts as the "active toggle". If it's there, note it and remove it.
                if (command.endsWith("!")) {
                    active = true;
                    command = command.slice(0, -1);
                }

                let commandDesc = command; // Command description to use if there's an error
                let firstParam = 2;
                let response;

                // Find the command template for the given command.
                let commandTpl = _.find(this.commands, x => ((x.cmd === command) && (!x.cat)));
                if (commandTpl === undefined) {
                    // Not found. Maybe it's a category, and the next word is the command.
                    let category = command;
                    command = parts[2];

                    // No next word. Was it at least a valid category?
                    if (command === undefined) {
                        let catTest = _.find(this.commands, x => ((x.cat === category)));
                        // If no, it was an invalid command.
                        if (catTest === undefined) {
                            response = "Unknown command or category, " + category + ".";
                        } else {
                            // If yes, it's a category with no subcommand.
                            response = category + " needs a subcommand.";
                        }
                    } else {
                        // Ok, the SECOND word was the command. Maybe it had the active toggle?
                        if (command.endsWith("!")) {
                            active = true;
                            command = command.slice(0, -1);
                        }
                        // Add it to the command descriptor in case of error.
                        commandDesc = commandDesc + " " + command;
                        firstParam = 3;
                        // Now, does that category actually exist?
                        let catTest = _.find(this.commands, x => ((x.cat === category)));
                        if (catTest === undefined) {
                            response = "Unknown command or category, " + category + ".";
                        } else {
                            // Yes, does the command actually exist?
                            commandTpl = _.find(this.commands, x => ((x.cmd === command) && (x.cat === category)));
                            if (commandTpl === undefined) {
                                response = "Unknown command, " + command + " in category " + category;
                            }
                        }
                    }
                }

                // By now, if commandTpl is still undefined, we should have an error response loaded.
                if (commandTpl !== undefined) {
                    // If active option was specified check it's valid on this command.
                    if (active && (!commandTpl.activeOption)) {
                        response = commandDesc + " has no active option.";
                    // If we found no targets check this command can handle having no targets.
                    } else if ((targets.length === 0) && (!commandTpl.noTarget)) {
                        response = commandDesc + " requires a target; none were found.";
                    } else {
                        // Parse parameters from firstParam on.
                        let curParam = firstParam;
                        let paramBlock = {};
                        let paramsGood = true;
                        // Match parameters in string to parameters in command template.
                        for (let param of commandTpl.params) {
                            let candidateParam = parts[curParam];
                            // If parameter in string is missing, and non optional, use default if it's available.
                            // Otherwise, give up parameter parsing.
                            if ((candidateParam === undefined) && (!param.optional)) {
                                if (param.default) {
                                    candidateParam = param.default;
                                } else {
                                    paramsGood = false;
                                    break;
                                }
                            }
                            // If parameter in template must be an int, check string can convert to an int and give
                            // up parsing if it can't.
                            if (param.mustInt) {
                                candidateParam = parseInt(candidateParam);
                                if (isNaN(candidateParam)) {
                                    paramsGood = false;
                                    break;
                                }
                            }
                            // Store parse result in parameter block for command.
                            paramBlock[param.name] = candidateParam;
                            curParam++;
                        }
                        if (!paramsGood) {
                            // Errors in parameter parsing, print out command parameter description.
                            response = "Usage: " + this.describeCommand(commandTpl);
                        } else {
                            // Actually call command's function.
                            response = commandTpl.do(paramBlock, targets, rollTags, active);
                        }

                    }
                }

                if (secret) {
                    if (playerIsGM(msg.playerid)) {
                        this.send("/w gm " + response);
                    } else {
                        this.send("/w \"" + msg.who + "\" " + response);
                        this.send("/w gm (Triggered by " + msg.who + ")");
                        this.send("/w gm " + response);
                    }
                } else {
                    this.send(response);
                }
            }
        }
    }

    constructor() {

        on("chat:message", (msg) => this.message(msg));

        if (!state.hasOwnProperty("PF2")) {
            log("Initialized state.");
            state.PF2 = {};
        }
        if (!state.PF2.hasOwnProperty("modifiers")) {
            log("Initialized modifiers.");
            state.PF2.modifiers = [];
        }

        this.ft_stat = 1;
        this.ft_calc = 2;
        this.ft_skill = 3;
        this.ft_save = 4;
        this.st_str = 1;
        this.st_dex = 2;
        this.st_con = 3;
        this.st_int = 4;
        this.st_wis = 5;
        this.st_cha = 6;
        this.st_names = ["","strength","dexterity","constitution","intelligence","wisdom","charisma"];
        this.level_dcs = [14, 15, 16, 18, 19, 20, 22, 23, 24, 26, 27, 28, 30, 31, 32, 34, 35, 36, 38, 39, 40, 42, 44, 46, 48, 50, 99999];


        this.commands = [
            {cmd: "ability", params: [{ name: "ability"}, {name: "skillchoice", optional: true}],
             do: ((p,t,r,a) => this.doAbility(p.ability, p.skillchoice, t, r))},

            {cmd: "get", params: [{ name: "property"}],
             do: ((p,t,r,a) => this.getProperty(p.property,t))},

            {cmd: "best", params: [{ name: "property"}],
             do: ((p,t,r,a) => this.bestProperty(p.property,t))},

            {cmd: "roll", params: [{ name: "property"}],
             do: ((p,t,r,a) => this.rollProperty(p.property,t,false,false, r))},

            {cmd: "rollinit", params: [{ name: "property", default: "perception"}], activeOption: true,
             do: ((p,t,r,a) => this.rollProperty(p.property,t,true,a, r))},

            {cat: "mod", cmd: "list", params: [], noTarget: true,
             do: ((p,t,r,a) => this.listMods(r))},

            {cat: "mod", cmd: "add", params: [{name: "name"},{name: "type"},{name: "value", mustInt: true}],
             do: ((p,t,r,a) => this.addMod(p.name, p.type, p.value, t, r))},

            {cat: "mod", cmd: "del", params: [{name: "name"}], noTarget: true,
             do: ((p,t,r,a) => this.delMod(p.name))},

            {cat: "mod", cmd: "clear", params: [], noTarget: true,
             do: ((p,t,r,a) => this.clearMods())},

            {cat: "mod", cmd: "explain", params: [],
             do: ((p,t,r,a) => this.explainMods(t,r))}
        ];


        this.fields = [
            { name:"strength", field: "strength_modifier", type:this.ft_stat },
            { name:"dexterity", field: "dexterity_modifier", type:this.ft_stat },
            { name:"constitution", field: "constitution_modifier", type:this.ft_stat },
            { name:"intelligence", field: "intelligence_modifier", type:this.ft_stat },
            { name:"wisdom", field: "wisdom_modifier", type:this.ft_stat },
            { name:"charisma", field: "charisma_modifier", type:this.ft_stat },
            { name:"hp", field: "hit_points", type:this.ft_calc },
            { name:"acrobatics", field: "acrobatics", type:this.ft_skill, stat:this.st_dex },
            { name:"arcana", field: "arcana", type:this.ft_skill, stat: this.st_int },
            { name:"athletics", field: "athletics", type:this.ft_skill, stat: this.st_str },
            { name:"crafting", field: "crafting", type:this.ft_skill, stat: this.st_int },
            { name:"deception", field: "deception", type:this.ft_skill, stat: this.st_cha },
            { name:"diplomacy", field: "diplomacy", type:this.ft_skill, stat: this.st_cha },
            { name:"intimidation", field: "intimidation", type:this.ft_skill, stat: this.st_cha },
            { name:"medicine", field: "medicine", type:this.ft_skill, stat: this.st_wis },
            { name:"nature", field: "nature", type:this.ft_skill, stat:this.st_wis },
            { name:"occultism", field: "occultism", type:this.ft_skill, stat: this.st_int },
            { name:"performance", field: "performance", type:this.ft_skill, stat: this.st_cha },
            { name:"religion", field: "religion", type:this.ft_skill, stat:this.st_wis },
            { name:"society", field: "society", type:this.ft_skill, stat:this.st_int },
            { name:"stealth", field: "stealth", type:this.ft_skill, stat:this.st_dex },
            { name:"survival", field: "survival", type:this.ft_skill, stat: this.st_wis },
            { name:"thievery", field: "thievery", type:this.ft_skill, stat: this.st_dex },
            { name:"fortitude", field: "saving_throws_fortitude", type:this.ft_save, stat: this.st_con },
            { name:"reflex", field: "saving_throws_reflex", type:this.ft_save, stat: this.st_dex },
            { name:"will", field: "saving_throws_will", type:this.ft_save, stat: this.st_wis },
            { name:"ac", field: "armor_class", type:this.ft_calc, stat: this.st_dex },
            { name:"perception", field: "perception", type:this.ft_skill, stat: this.st_wis },
            { name:"level", field: "level", type:this.ft_calc },
            { name:"initiative", field: "initiative_modifier", type:this.ft_calc } ];

        this.abilities = [{
            name: "Decipher Writing",
            tags: ["Concentrate","Exploration","Secret"],
            skill: "",
            reqprof: "T",
            crit: "Understand text, even if in code.",
            hit: "Understand text, only vaguely if in code.",
            miss: "-2c to any further checks to decipher this text.",
            fumble: "You think you understood the text but are wrong."
        }, {
            name: "Earn Income",
            tags: ["Downtime"],
            skill: "",
            reqprof: "T",
            dc: "Per PC's choice of task level, up to the settlement level.",
            crit: "Earn money at the task level +1.",
            hit: "Earn money at the given task level.",
            miss: "Earn the failure amount fo the task level.",
            fumble: "Earn nothing and are fired."
        }, {
            name: "Identify Magic",
            tags: ["Concentrate","Exploration","Secret"],
            skill: "",
            dc: "Per level of the effect, +2/+5/+10 for uncommon/rare/unique or cursed.",
            reqprof: "T",
            crit: "Learn all attributes of the magic.",
            hit: "Get a sense of what the magic does. No retry.",
            miss: "Can't identify the magic for 1 day.",
            fumble: "Misidentify the magic."
        }, {
            name: "Learn A Spell",
            tags: ["Concentrate","Exploration"],
            skill: "",
            reqprof: "T",
            dc: "Per level of the spell, +2/+5/+10 for uncommon/rare/unique.",
            crit: "Spend half materials, learn spell.",
            hit: "Spend materials, learn spell.",
            miss: "Spend no materials, can't learn spell this level.",
            fumble: "Spend half materials, can't learn spell this level."
        }, {
            name: "Recall Knowledge",
            tags: ["Concentrate","Secret"],
            skill: "",
            reqprof: "U",
            crit: "Recall accurate knowledge plus extra information.",
            hit: "Recall accurate knowledge.",
            miss: "Nil.",
            fumble: "You recall wrong information."
        }, {
            name: "Subsist",
            tags: ["Downtime"],
            skill: "",
            dc: "Typically 15.",
            reqprof: "U",
            crit: "Provide subsistence for 2, or comfortable for yourself.",
            hit: "Provide yourself subsistence.",
            miss: "Fatigued until you get food and shelter.",
            fumble: "-2c to Subsist for 1 week and in danger of hunger or thirst."
        }, {
            name: "Balance",
            tags: ["Move"],
            action: 1,
            skill: "acrobatics",
            dc: "The Balance DC of the surface.",
            reqprof: "U",
            crit: "Move up to your speed.",
            hit: "Move up to your speed as difficult terrain.",
            miss: "Lose the move action, or fall and end your turn.",
            fumble: "Fall and end your turn."
        }, {
            name: "Tumble Through",
            tags: ["Move"],
            dc: "Enemy Reflex DC",
            action: 1,
            skill: "acrobatics",
            reqprof: "U",
            crit: "As success.",
            hit: "Move through target as difficult terrain.",
            miss: "Movement ends and you trigger reactions.",
            fumble: "As failure."
        }, {
            name: "Maneuver in Flight",
            tags: ["Move"],
            action: 1,
            skill: "acrobatics",
            reqprof: "T",
            crit: "As success.",
            hit: "Succeed at the maneuver.",
            miss: "Nil.",
            fumble: "The maneuver fails with dire consequences."
        }, {
            name: "Squeeze",
            tags: ["Exploration", "Move"],
            skill: "acrobatics",
            reqprof: "T",
            crit: "Squeeze at 10' per min.",
            hit: "Squeeze at 5' per min.",
            miss: "Nil.",
            fumble: "Stuck. To escape, check again and get better than a fumble."
        }, {
            name: "Borrow An Arcane Spell",
            tags: ["Concentrate", "Exploration"],
            skill: "arcana",
            reqprof: "T",
            crit: "As success.",
            hit: "Prepare the borrowed spell.",
            miss: "Can't prepare the spell until next preparation, but keep the slot.",
            fumble: "As failure."
        }, {
            name: "Climb",
            tags: ["Move"],
            action: 1,
            skill: "athletics",
            reqprof: "U",
            crit: "Climb at 5' + a quarter your speed.",
            hit: "Climb at a quarter your speed.",
            miss: "Nil.",
            fumble: "Fall, landing prone if on stable ground."
        }, {
            name: "Force Open",
            tags: ["Attack"],
            action: 1,
            skill: "athletics",
            reqprof: "U",
            crit: "Open the item without damaging it.",
            hit: "Open the item but break it.",
            miss: "Nil.",
            fumble: "Jam the item. -2c on future attempts to force."
        }, {
            name: "Grapple",
            tags: ["Attack"],
            dc: "Enemy Fortitude DC",
            action: 1,
            skill: "athletics",
            reqprof: "U",
            crit: "Target restrained until end of your next turn.",
            hit: "Target grabbed until end of your next turn.",
            miss: "Release target if they were grabbed.",
            fumble: "Target can grab you or force you to fall prone."
        }, {
            name: "High Jump",
            tags: [],
            action: 2,
            dc: "30",
            skill: "athletics",
            reqprof: "U",
            crit: "Choose: 8' vertical, or 5' vertical and 10' horizontal.",
            hit: "5' vertical.",
            miss: "Leap normally.",
            fumble: "Fall prone in your space."
        }, {
            name: "Long Jump",
            tags: [],
            dc: "The number of feet you're attempting to leap.",
            action: 2,
            skill: "athletics",
            reqprof: "U",
            crit: "As success.",
            hit: "Leap the target distance.",
            miss: "Leap normally.",
            fumble: "Leap normally, fall prone when you land."
        }, {
            name: "Shove",
            tags: ["Attack"],
            action: 1,
            dc: "Enemy Fortitude DC",
            skill: "athletics",
            reqprof: "U",
            crit: "Push target <=10' away, and can Stride after it.",
            hit: "Push target <=5' back, and can Stride after it.",
            miss: "Nil.",
            fumble: "Fall prone."
        }, {
            name: "Swim",
            tags: ["Move"],
            action: 1,
            skill: "athletics",
            reqprof: "U",
            crit: "Swim 10'+Speed/4.",
            hit: "Swim 5'+Speed/4..",
            miss: "Nil.",
            fumble: "Lose a round of air."
        }, {
            name: "Trip",
            tags: ["Attack"],
            action: 1,
            dc: "Enemy Reflex DC",
            skill: "athletics",
            reqprof: "U",
            crit: "Target prone and takes [[1d6]] bludgeoning.",
            hit: "Target prone.",
            miss: "Nil.",
            fumble: "You fall prone."
        }, {
            name: "Disarm",
            tags: ["Attack"],
            action: 1,
            skill: "athletics",
            reqprof: "T",
            dc: "Enemy Reflex DC",
            crit: "Disarm target.",
            hit: "Target -2c to use item and others +2c to diarm target until their next turn.",
            miss: "Nil.",
            fumble: "Fall prone."
        }, {
            name: "Repair",
            tags: ["Exploration", "Manipulate"],
            skill: "crafting",
            reqprof: "U",
            crit: "Repair 10 HP plus 10 HP per proficiency rank.",
            hit: "Repair 5 HP plus 5 HP per proficiency rank.",
            miss: "Nil.",
            fumble: "You deal [[2d6]] damage to the item."
        }, {
            name: "Craft",
            tags: ["Downtime", "Manipulate"],
            skill: "crafting",
            dc: "Per the item's level, +2/5/10 for Uncommon/Rare/Unique.",
            reqprof: "T",
            crit: "Make the item. Extra time reduces costs based on level+1.",
            hit: "Make the item. Extra times reduces costs based on level.",
            miss: "You don't make the item but you can salvage all the materials.",
            fumble: "You don't make the item but you can salvage 90% of the materials."
        }, {
            name: "Identify Alchemy",
            tags: ["Concentrate","Exploration","Secret"],
            skill: "crafting",
            reqprof: "T",
            crit: "As success.",
            hit: "Identify the item and its activation.",
            miss: "Nil.",
            fumble: "Misidentify the item."
        }, {
            name: "Create a Diversion",
            tags: ["Mental"],
            action: 1,
            skill: "deception",
            reqprof: "U",
            dc: "Perception DC of each target",
            crit: "As success.",
            hit: "(per target) You are hidden.",
            miss: "(per target) You are not hidden, target knows you were trying to hide."
        }, {
            name: "Impersonate",
            tags: ["Concentrate", "Exploration", "Manipulate", "Secret"],
            skill: "deception",
            reqprof: "U",
            crit: "As success.",
            dc: "Perception DC of each target.",
            hit: "Target thinks you're who you're impersonating.",
            miss: "Target can tell you're not that person.",
            fumble: "Target can tell you're not that person and recognizes you if they know you."
        }, {
            name: "Lie",
            tags: ["Auditory","Concentrate","Linguistic","Mental","Secret"],
            skill: "deception",
            reqprof: "U",
            dc: "Perception DC of each target.",
            crit: "As success.",
            hit: "Target believes you.",
            miss: "Target doesn't believe you and gains +4c against your lies.",
            fumble: "As failure."
        }, {
            name: "Feint",
            tags: ["Mental"],
            skill: "deception",
            dc: "Perception DC of target.",
            reqprof: "T",
            action: 1,
            crit: "Target flat-footed against your melee until end of your next turn.",
            hit: "Target flat-footed against your next melee in the current turn.",
            miss: "Nil.",
            fumble: "You are flat-footed against their melee until end of your next turn."
        }, {
            name: "Gather Information",
            tags: ["Exploration", "Secret"],
            skill: "diplomacy",
            reqprof: "U",
            crit: "As success.",
            hit: "You find information.",
            miss: "Nil.",
            fumble: "You gather wrong information."
        }, {
            name: "Make an Impression",
            tags: ["Auditory", "Concentrate", "Exploration", "Linguistic", "Mental"],
            skill: "diplomacy",
            reqprof: "U",
            dc: "Target Will DC.",
            crit: "Attitude improves by 2 steps.",
            hit: "Attitude improves by 1 step.",
            miss: "Nil.",
            fumble: "Attitude worsens by 1 step."
        }, {
            name: "Request",
            tags: ["Auditory", "Concentrate", "Linguistic", "Mental"],
            skill: "diplomacy",
            dc: "Automatic failure if Unfriendly or Hostile.",
            reqprof: "U",
            crit: "Target agrees.",
            hit: "Target agrees with caveats.",
            miss: "Target refuses the request.",
            fumble: "Target refuses and attitude worsens by 1 step."
        }, {
            name: "Coerce",
            tags: ["Auditory", "Concentrate", "Emotion", "Exploration", "Lingustic", "Mental"],
            skill: "intimidation",
            reqprof: "U",
            dc: "Target Will DC.",
            crit: "Target obeys, then becomes unfriendly but is too scared to retaliate.",
            hit: "Target obeys, then becomes unfriendly and may act against you.",
            miss: "Target refuses and becomes unfriendly.",
            fumble: "Target refuses, becomes hostile and immune 1 week."
        }, {
            name: "Demoralize",
            tags: ["Auditory", "Concentrate", "Emotion", "Mental"],
            skill: "intimidation",
            action: 1,
            reqprof: "U",
            dc: "Target Will DC.",
            crit: "Target frightened 2 and immune 10 minutes.",
            hit: "Target frightened 1 and immune 10 minutes.",
            miss: "Target immune 10 minutes.",
            fumble: "As failure."
        }, {
            name: "Stabilize",
            tags: ["Manipulate"],
            skill: "medicine",
            action: 2,
            dc: "5 + the creature's recovery roll DC.",
            reqprof: "U",
            crit: "As success.",
            hit: "Target loses the dying condition.",
            miss: "Target's dying value increases by 1.",
            fumble: "As failure."
        }, {
            name: "Stop Bleeding",
            tags: ["Manipulate"],
            skill: "medicine",
            dc: "The DC of the effect that caused the bleeding.",
            action: 2,
            reqprof: "U",
            crit: "As success.",
            hit: "Target attempts a flat check to end the bleeding.",
            miss: "Target immediately takes their persistent bleed damage.",
            fumble: "As failure."
        }, {
            name: "Treat Disease",
            tags: ["Downtime","Manipulate"],
            dc: "The disease's DC.",
            skill: "medicine",
            reqprof: "T",
            crit: "Target gets +4c to their next save against the disease.",
            hit: "Target gets +2c to their next save against the disease.",
            miss: "Nil.",
            fumble: "Target gets -2c to their next save against the disease."
        }, {
            name: "Treat Poison",
            tags: ["Manipulate"],
            skill: "medicine",
            dc: "The poison's DC.",
            action: 1,
            reqprof: "T",
            crit: "Target gets +4c to their next save against the poison.",
            hit: "Target gets +2c to their next save against the poison.",
            miss: "Nil.",
            fumble: "Target gets -2c to their next save against the poison."
        }, {
            name: "Treat Wounds",
            tags: ["Exploration","Healing","Manipulate"],
            skill: "medicine",
            dc: "15/20/30/40 for +0/+10/+30/+50.",
            reqprof: "T",
            crit: "Target heals [[4d8]] + difficulty bonus and is no longer wounded.",
            hit: "Target heals [[2d8]] + difficulty bonus and is no longer wounded.",
            miss: "Nil.",
            fumble: "Target takes [[d8]] damage."
        }, {
            name: "Command an Animal",
            tags: ["Auditory", "Concentrate"],
            skill: "nature",
            dc: "Animal Will DC.",
            reqprof: "U",
            action: 1,
            crit: "As success.",
            hit: "Animal obeys.",
            miss: "Nil.",
            fumble: "Animal misbehaves."
        }, {
            name: "Perform",
            tags: ["Concentrate"],
            skill: "performance",
            reqprof: "U",
            action: 1,
            crit: "Your performance is impressive.",
            hit: "Your performance is appreciable.",
            miss: "Your performance is unsuccessful.",
            fumble: "Your performance is degrading."
        }, {
            name: "Create Forgery",
            tags: ["Downtime","Secret"],
            skill: "society",
            reqprof: "T",
            dc: "20 to not be obviously detectable.",
            crit: "As success.",
            hit: "Observer does not detect the forgery.",
            miss: "Observer detects the forgery.",
            fumble: "As failure."
        }, {
            name: "Conceal an Object",
            tags: ["Manipulate","Secret"],
            skill: "stealth",
            reqprof: "U",
            dc: "Each observer's Perception DC.",
            action: 1,
            crit: "As success.",
            hit: "(Per observer) Observer does not casually notice the object.",
            miss: "(Per observer) Observer notices the object.",
            fumble: "As failure."
        }, {
            name: "Hide",
            tags: ["Secret"],
            skill: "stealth",
            reqprof: "U",
            dc: "Each observer's Perception DC.",
            action: 1,
            crit: "As success.",
            hit: "Become Hidden instead of Observed.",
            miss: "Remain Observed.",
            fumble: "As failure."
        }, {
            name: "Sneak",
            tags: ["Move", "Secret"],
            skill: "stealth",
            dc: "Each observer's Perception DC.",
            reqprof: "U",
            action: 1,
            crit: "As success.",
            hit: "Remained undetected during your move.",
            miss: "Become Hidden during your move.",
            fumble: "Become Observed during your move if possible, otherwise Hidden."
        }, {
            name: "Sense Direction",
            tags: ["Exploration", "Secret"],
            skill: "survival",
            dc: "15/20/30/40 for wilderness/underground/featureless/surreal.",
            reqprof: "U",
            crit: "Know where you are and exactly where cardinal directions are.",
            hit: "Oon't get lost and have a sense of the cardinal directions.",
            miss: "Nil.",
            fumble: "Nil."
        }, {
            name: "Track",
            tags: ["Concentrate", "Exploration", "Move"],
            skill: "survival",
            reqprof: "T",
            dc: "Enemy survival DC or enemy's proficiency at covering tracks.",
            action: 1,
            crit: "As success.",
            hit: "Successfully find or follow the trail.",
            miss: "Lose the trail for 1 hour.",
            fumble: "Lose the trail for 24 hours."
        }, {
            name: "Palm an Object",
            tags: ["Manipulate"],
            skill: "thievery",
            reqprof: "U",
            dc: "Each observer's Perception DC.",
            action: 1,
            crit: "As success.",
            hit: "Not noticed palming the object.",
            miss: "Noticed palming the object.",
            fumble: "As failure."
        }, {
            name: "Steal",
            tags: ["Manipulate"],
            skill: "thievery",
            reqprof: "U",
            action: 1,
            dc: "Each observer's Perception DC.",
            crit: "As success.",
            hit: "Take the object and aren't noticed.",
            miss: "Fail to take the object, or are noticed taking it.",
            fumble: "As failure."
        }, {
            name: "Disable a Device",
            tags: ["Manipulate"],
            skill: "thievery",
            reqprof: "T",
            action: 2,
            crit: "Disable the device with no trace, or earn 2 successes.",
            hit: "Disable the device, or earn 1 success.",
            miss: "Nil.",
            fumble: "Trigger the device."
        }, {
            name: "Pick a Lock",
            tags: ["Manipulate"],
            skill: "thievery",
            dc: "15x2, 20x3, 25x4, 30x5, 40x6.",
            reqprof: "T",
            action: 2,
            crit: "Unlock the lock with no trace, or earn 2 successes.",
            hit: "Unlock the lock, or earn 1 success.",
            miss: "Nil.",
            fumble: "Break your thieves' tools."
        }, {
            name: "Seek",
            tags: ["Concentrate","Secret"],
            skill: "perception",
            dc: "Target Stealth DC.",
            reqprof: "U",
            action: 1,
            crit: "A creature becomes observed. You know where an object is.",
            hit: "An undetected creature becomes hidden, a hidden creature becomes observed. You get a clue as to where an object is.",
            miss: "Nil.",
            fumble: "Nil.",
        }, {
            name: "Sense Motive",
            tags: ["Concentrate", "Secret"],
            skill: "perception",
            dc: "Target Deception DC.",
            reqprof: "U",
            action: 1,
            crit: "You know the creature's true intentions, and if magic is affecting it.",
            hit: "You know if the creature is behaving normally or not.",
            miss: "You believe they're behaving normally and not being deceptive.",
            fumble: "You get the wrong idea about their intentions."
        }, {
            name: "Goblin Song",
            tags: ["Goblin"],
            skill: "performance",
            dc: "Target Will DC.",
            reqprof: "U",
            action: 1,
            crit: "Target takes -1s to Perception and Will saves for 1 minute.",
            hit: "Target takes -1s to Perception and Will saves for 1 round.",
            miss: "Nil.",
            fumble: "Target is immune to Goblin Song for 1 hour."
        }, {
            name: "Awesome Blow",
            tags: ["Barbarian", "Concentrate", "Rage"],
            skill: "athletics",
            dc: "Target Fortitude DC.",
            reqprof: "U",
            action: 0,
            crit: "Push target <=10' away, they fall prone and take [[1d6]] bludgeoning. You can Stride after them.",
            hit: "Push target <=5' away, they fall prone. You can Stride after them.",
            miss: "You perform a normal Knockback.",
            fumble: "As failure."
        }, {
            name: "Whirling Throw",
            tags: ["Monk"],
            skill: "athletics",
            dc: "Target Fortitude DC, modified by size.",
            reqprof: "U",
            action: 1,
            crit: "Throw the creature <=(10+Strength*5)' and it lands prone.",
            hit: "Throw the creature <=(10+Strength*5)'.",
            miss: "Nil.",
            fumble: "The creature is no longer grabbed or restrained by you."
        }, {
            name: "Battle Assessment",
            tags: ["Rogue", "Secret"],
            skill: "perception",
            dc: "Enemy Deception or Stealth DC.",
            reqprof: "U",
            action: 1,
            crit: "Learn two things (GM's choice): highest enemy weakness, worst enemy save, best enemy resistance, one immunity.",
            hit: "Learn one thing from the list above.",
            miss: "Nil.",
            fumble: "Learn false information about a topic from the list."
        }, {
            name: "Sabotage",
            tags: ["Incapacitation", "Rogue"],
            skill: "thievery",
            dc: "Target's Reflex DC.",
            reqprof: "U",
            action: 1,
            crit: "Deal 4 times your Thievery proficiency bonus in damage.",
            hit: "Deal 2 times your Thievery proficiency bonus in damage.",
            miss: "Nil.",
            fumble: "The target is immune to your Sabotage for 1 day."
        }, {
            name: "Delay Trap",
            tags: ["Rogue"],
            skill: "thievery",
            dc: "The trap's Disable DC plus 5.",
            reqprof: "U",
            action: 0,
            crit: "Choose: Prevent the trap from being triggered, or delay it until the start/end of your next turn.",
            hit: "As above, but the GM chooses whichever is worse. They cannot choose the start of your turn.",
            miss: "Nil.",
            fumble: "You're flat footed until the start of your next turn."
        }, {
            name: "Recognize Spell",
            tags: ["General", "Skill", "Secret"],
            skill: "",
            reqprof: "T",
            action: 0,
            crit: "Recognize the spell and get +1 save or AC against it.",
            hit: "Recognize the spell.",
            miss: "Nil.",
            fumble: "Recognize the spell as something else."
        }, {
            name: "Scare To Death",
            tags: ["Death", "Emotion", "Fear", "General", "Incapacitation", "Skill"],
            skill: "intimidation",
            dc: "Enemy Will DC.",
            reqprof: "L",
            action: 1,
            crit: "Target must Fortitude save vs your Intimidation DC or die. On non-crit they are frightened 2 and fleeing 1.",
            hit: "Target is Frightened 2.",
            miss: "Target is Frightened 1,",
            fumble: "Nil."
        }, {
            name: "Identify Creature (Recall Knowledge)",
            tags: ["Concentrate","Secret"],
            dc: "Per creature level, +2/+5/+10 for uncommon/rare/unique.",
            skill: "",
            reqprof: "U",
            crit: "As success, plus you learn something subtler.",
            hit: "You learn one of the creature's best-known attributes.",
            miss: "Nil.",
            fumble: "You misidentify the creature."
        }, {
            name: "Train Animal",
            tags: ["Downtime","General","Manipulate","Skill"],
            dc: "Per creature level, adjusted for attitude.",
            skill: "nature",
            reqprof: "T",
            crit: "As success.",
            hit: "Animal learns the action, or upgrades it to not need a roll.",
            miss: "Nil.",
            fumble: "As failure."
        }, {
            name: "Trick Magic Item",
            tags: ["General","Manipulate","Skill"],
            dc: "Per item level.",
            skill: "",
            reqprof: "T",
            action: 1,
            crit: "As success.",
            hit: "You can use the item until the end of this turn.",
            miss: "You can't use the item or trick it again this turn.",
            fumble: "You can't use the item or trick it again today."
        }, {
            name: "AA Befriend a Local",
            tags: ["Concentrate","Downtime","Linguistic"],
            dc: "20.",
            skill: "",
            reqprof: "U",
            crit: "-10% discount or +1 Diplomacy in Breachill, permanently.",
            hit: "Benefits above for weeks equal to your Charisma.",
            miss: "Nil.",
            fumble: "You lose all benefits and take +5 DC to befriendthis NPC."
        }, {
            name: "AA Administer Altaerein",
            tags: ["Concentrate","Downtime","Linguistic","Mental"],
            skill: "society",
            dc: "20.",
            reqprof: "U",
            crit: "Citadel runs for a month and +2c to Organize Labor that month.",
            hit: "Citadel runs for a month.",
            miss: "-4c to all downtime actions at Altaerin. Can try again tomorrow.",
            fumble: "As failure, but can only try again next week."
        }, {
            name: "AA Organize Labor",
            tags: ["Concentrate","Downtime","Linguistic","Mental"],
            skill: "",
            dc: "13 for regular workers, 18 for specialists.",
            reqprof: "U",
            crit: "Workers work for the full duration at 0.5 or 2.5 gp per day.",
            hit: "Workers work for the full duration at 1 or 5 gp per day.",
            miss: "Workers work for one day. If you didn't use Diplomacy, -1c to future labor checks.",
            fumble: "Nobody works. If you didn't use Diplomacy, you can't use that skill to organize any more."
        }, {
            name: "EC Promote the Circus",
            tags: ["Circus","Downtime"],
            skill: "society",
            dc: "Per party level.",
            reqprof: "U",
            crit: "Gain (2*level)+Cha modifier Anticipation.",
            hit: "Gain level+Cha modifier Anticipation.",
            miss: "Gain 1 Anticipation.",
            fumble: "Nil."
        }, {
            name: "EC Perform a Trick",
            tags: ["Circus","Variable"],
            skill: "",
            dc: "Per party level.",
            reqprof: "U",
            crit: "Gain (trick level) Excitement and (Trick level/2) Anticipation.",
            hit: "Gain (trick level) Excitement.",
            miss: "Nil.",
            fumble: "Lose (trick level/2) Excitement."
        }, {
            name: "Aid",
            tags: [],
            skill: "",
            dc: "Usually 20.",
            reqprof: "U",
            crit: "Give your ally +2c, or +3c/+4c if master/legend.",
            hit: "Give your ally +1c.",
            miss: "Nil.",
            fumble: "Give your ally -1c."
        }, {
            name: "Battle Prayer",
            tags: ["Divine","General","Skill"],
            skill: "religion",
            reqprof: "M",
            action: 1,
            dc: "Enemy Will DC.",
            crit: "Deal [[2d6]] damage, or [[6d6]] if legendary. Enemy immune 1 day.",
            hit: "Deal [[1d6]] damage, or [[3d6]] if legendary. Enemy immune 1 day.",
            miss: "Enemy immune 1 day.",
            fumble: "You can't reuse for 10 minutes. Enemy immune 1 day."
        }, {
            name: "Evangelize",
            tags: ["Auditory","General","Linguistic","Mental","Skill"],
            skill: "diplomacy",
            reqprof: "M",
            action: 1,
            dc: "Enemy Will DC.",
            crit: "Target agrees with you or is stupefied 2 for 1 round. Target immune 1 day.",
            hit: "Target agrees with you or stupefied 1 for 1 round. Target immune 1 day.",
            miss: "Target unaffected.",
            fumble: "As Failure."
        }, {
            name: "Sacred Defense",
            tags: ["Divine","General","Skill"],
            skill: "religion",
            reqprof: "M",
            action: 1,
            dc: "30, or 40 for bonus if Legendary.",
            crit: "Gain +10thp for 1 min, or 25thp with bonus.",
            hit: "Gain +5thp for 1 min, or 15thp with bonus.",
            miss: "Nil.",
            fumble: "Cannot call your deity for 1 day."
        }
        ];

    }
}

new Pathfinder2Utils();
log("Hyphz's Pathfinder 2 Utilities started");


