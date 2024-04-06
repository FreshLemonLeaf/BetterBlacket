import axios from 'axios';
import storage from 'utils/storage.js';
import loadPlugins from './loadPlugins.js';

export default async (single) => {
    bb.themes.list = [];
    bb.themes.broken = [];

    [...document.querySelectorAll('[id*=\'bb-theme\']')].forEach((v) => v.remove());

    let themes = storage.get('bb_themeData', true).active.filter(a => a.trim() !== '');

    for (let theme of themes) {
        axios.get(theme).then(async (res) => {
            let data = res.data;
            let meta = {};

            const matches = data.match(/\/\*\*\s*\n([\s\S]*?)\*\//s)[1].split('\n');
            if (matches) matches.forEach(input => {
                let match = /@(\w+)\s+([\s\S]+)/g.exec(input);
                if (match) meta[match[1]] = match[2].trim();
            });
            else return bb.themes.broken.push({
                url: theme,
                reason: 'Theme metadata could not be found.'
            });

            const themeStyle = document.createElement('style');
            themeStyle.id = `bb-theme-${btoa(Math.random().toString(36).slice(2))}`;
            if (meta.autoImportant === 'true' || !meta.autoImportant) data = data.replaceAll(/([^;{}]*:[^;{}]*);/g, '$1 !important;');
            themeStyle.innerHTML = data;

            bb.themes.list.push({
                element: themeStyle,
                name: meta.name,
                meta,
                url: theme
            });

            document.head.appendChild(themeStyle);
            console.log(`Loaded theme "${meta.name}".`);
            bb.eventManager.dispatch('themeUpdate');
        }).catch((err) => {
            console.log('Failed to load theme: ' + theme + ' - ', err);
            bb.themes.broken.push({
                url: theme,
                reason: 'Theme could not be loaded.'
            });
            bb.eventManager.dispatch('themeUpdate');
        });
    };

    if (single) return console.log('Reloaded themes.');
    console.log('Started loading themes. Calling loadPlugins()...');
    loadPlugins();
};