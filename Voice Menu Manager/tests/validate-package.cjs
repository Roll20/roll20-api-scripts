'use strict';
// No dependencies. Validates the keywords used by the bundled official schema.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const schema = JSON.parse(fs.readFileSync(path.join(__dirname, 'roll20-script.schema.json'), 'utf8'));
const metadata = JSON.parse(fs.readFileSync(path.join(root, 'script.json'), 'utf8'));
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
function matches(value, type) {
    return type === 'object' ? object(value) : type === 'array' ? Array.isArray(value) :
        type === 'integer' ? Number.isInteger(value) : type === 'null' ? value === null : typeof value === type;
}
function validate(rule, value, at = '$') {
    if (rule === false) throw new Error(at + ': property is not allowed');
    if (rule === true) return;
    if (rule.type && !(Array.isArray(rule.type) ? rule.type : [rule.type]).some(type => matches(value, type))) throw new Error(at + ': wrong type');
    if (rule.enum && !rule.enum.includes(value)) throw new Error(at + ': invalid enum value');
    if (typeof value === 'string' && rule.pattern && !new RegExp(rule.pattern).test(value)) throw new Error(at + ': does not match pattern');
    if (Array.isArray(value)) {
        if (rule.maxItems !== undefined && value.length > rule.maxItems) throw new Error(at + ': too many items');
        if (rule.uniqueItems && new Set(value.map(item => JSON.stringify(item))).size !== value.length) throw new Error(at + ': duplicate array entries');
        if (rule.items) value.forEach((item, index) => validate(rule.items, item, at + '[' + index + ']'));
    }
    if (object(value)) {
        if (rule.maxProperties !== undefined && Object.keys(value).length > rule.maxProperties) throw new Error(at + ': too many properties');
        for (const required of rule.required || []) if (!Object.prototype.hasOwnProperty.call(value, required)) throw new Error(at + ': missing ' + required);
        for (const name of Object.keys(value)) {
            if (rule.properties && Object.prototype.hasOwnProperty.call(rule.properties, name)) validate(rule.properties[name], value[name], at + '.' + name);
            else if (rule.additionalProperties !== undefined) validate(rule.additionalProperties, value[name], at + '.' + name);
        }
    }
}
validate(schema, metadata);
assert.throws(() => validate(schema, { ...metadata, version: 'invalid-version' }));
assert.throws(() => validate(schema, { ...metadata, roll20userid: 'not-a-numeric-id' }));
assert.throws(() => validate(schema, { ...metadata, modifies: { 'macro.action': 'invalid' } }));
assert.equal(metadata.name, path.basename(root));
assert.equal(metadata.authors, 'Kingkiller546');
assert.equal(metadata.script, 'VoiceMenuManager.js');
const source = fs.readFileSync(path.join(root, metadata.script));
assert.deepEqual(source, fs.readFileSync(path.join(root, metadata.version, metadata.script)));
assert(source.toString().includes('v' + metadata.version));
const ids = Array.isArray(metadata.roll20userid) ? metadata.roll20userid : String(metadata.roll20userid).split(',');
if (!ids.length) {
    if (process.argv.includes('--release')) throw new Error('Release blocked: add Kingkiller546\'s actual numeric Roll20 user ID to script.json.');
    console.log('DRAFT: Roll20 author user ID is not supplied. Add it before submission.');
}
console.log('PASS: official metadata schema, author alias, folder/script names and identical versioned source.');
