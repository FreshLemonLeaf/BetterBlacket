import Modal from 'utils/modal.js';
import storage from 'utils/storage.js';
import eventManager from 'utils/events.js';

if (!storage.get('bb_pluginData')) storage.set('bb_pluginData', { active: [], settings: {} }, true);
if (!storage.get('bb_themeData')) storage.set('bb_themeData', { active: [] }, true);

window.bb = {
    Modal,
    storage,
    plugins: {
        list: [],
        settings: {},
        styles: [],
        internals: {
            pendingChanges: false
        }
    },
    themes: {
        list: [],
        broken: [],
        reload: () => loadThemes(true)
    },
    patches: [],
    eventManager
};

console.log('Defined global "bb" variable:', bb, 'Calling loadThemes()...');

import loadThemes from 'internals/loadThemes.js';
loadThemes();