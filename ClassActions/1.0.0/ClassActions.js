var ClassActions = (function () {
	'use strict';
	function createMod() {
		function systemFeedBack(msg) {
			sendChat('System', `&{template:desc} {{desc=${msg}}}`);
		}
		function consoleLog(msg) {
			if (!dev) {
				return;
			}
			log(msg);
		}
		function systemAlert(msg) {
			sendChat('System', msg, undefined, { noarchive: true });
		}
		function findCharToken(charId) {
			return (graphic) => {
				return graphic.get('represents') === charId;
			};
		}
		function filterTokens(graphic) {
			return graphic.get('_subtype') === 'token';
		}
		function toggleDmgModifier(charId, action, value) {
			function findDmgModifType(type) {
				return (obj) => {
					if (!obj) {
						return false;
					}
					return `${obj.get('current')}`.toLowerCase() === type;
				};
			}
			const baseName = 'repeating_damagemod';
			const flagSuffix = 'global_damage_active_flag';
			const damageModObjs = findObjs({
				characterid: charId,
				type: 'attribute',
			}).filter((obj) => obj.get('name').includes(baseName));
			const filter = findDmgModifType(action);
			const dmgModTypeObject = damageModObjs.find(filter);
			if (dmgModTypeObject) {
				const nameId = dmgModTypeObject.get('name').split('_')[2];
				const flagName = `${baseName}_${nameId}_${flagSuffix}`;
				sendChat(
					'',
					`!setattr --silent --charid ${charId} --sel --${flagName}|${value ? 1 : 0}`,
					undefined,
					{
						noarchive: true,
					}
				);
			}
		}
		function setMarker(token, action, value = true) {
			const markers = {
				rage: 'strong',
			};
			token.set({
				[`status_${markers[action]}`]: value,
			});
		}
		function getMappedAction(action) {
			const map = Object.keys(actionsMapping);
			return map.find((key) => actionsMapping[key] === action);
		}
		function findAction(content) {
			const findActionRegex = /{{name=(.*?)}}/;
			const result = content.match(findActionRegex);
			if (!result) {
				return '';
			}
			let action = result[1].toLowerCase();
			if (actionsMapping[action]) {
				action = actionsMapping[action];
			}
			return action.toLowerCase();
		}
		function decreaseClassResource(charId) {
			const resource = findObjs({
				characterid: charId,
				type: 'attribute',
				name: 'class_resource',
			})[0];
			const resource_name = findObjs({
				characterid: charId,
				type: 'attribute',
				name: 'class_resource_name',
			})[0];
			let current = resource.get('current');
			if (current <= 0) {
				systemFeedBack(
					'You have no more available class features today'
				);
				return false;
			}
			resource.set('current', current - 1);
			current = resource.get('current');
			const max = resource.get('max');
			const name = resource_name.get('current');
			let msg = `You have ${current} of ${max} on ${name}`;
			systemFeedBack(msg);
			return true;
		}
		function handleChatMessage(msg) {
			const { content, rolledByCharacterId, rolltemplate } = msg;
			const char = getObj('character', rolledByCharacterId);
			if (content === noTokenErroMsg || rolltemplate !== 'traits') {
				return;
			}
			if (char) {
				const action = findAction(content);
				const charToken = everything.find(
					findCharToken(rolledByCharacterId)
				);
				if (actions.includes(action)) {
					const perfomed = decreaseClassResource(rolledByCharacterId);
					//toggle dmg modif if needed
					if (dmgModActions.includes(action)) {
						toggleDmgModifier(
							rolledByCharacterId,
							action,
							perfomed
						);
					}
					//set marker if its needed
					if (setMarkerActions.includes(action)) {
						if (!charToken) {
							systemAlert(noTokenErroMsg);
							return;
						}
						setMarker(charToken, action, perfomed);
					}
				}
			}
		}
		const noTokenErroMsg = 'Your token is not on the table';
		const actions = ['rage', 'divine sense'];
		const dmgModActions = ['rage'];
		const setMarkerActions = ['rage'];
		const actionsMapping = {
			fúria: 'rage',
			'sentido divino': 'divine sense',
		};
		const dev = true;
		const everything = findObjs({ type: 'graphic' }).filter((obj) =>
			filterTokens(obj)
		);
		on('chat:message', (msg) => {
			if (msg) {
				handleChatMessage(msg);
			}
		});
	}
	function checkInstall() {
		log('=== Class Actions ready ===');
	}
	function registerEventHandlers() {
		createMod();
	}
	return {
		checkInstall,
		registerEventHandlers,
	};
})();
on('ready', () => {
	'use strict';
	ClassActions.checkInstall();
	ClassActions.registerEventHandlers();
});
