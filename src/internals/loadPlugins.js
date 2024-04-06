import patcher from './patcher.js';
import eventManager from 'utils/events.js';
import storage from 'utils/storage.js';

export default async () => {
    let pluginData = storage.get('bb_pluginData', true);
    let contentLoaded = false;

    await Promise.all(Object.values(import.meta.glob('../plugins/*/index.js', {
        eager: true
    })).map(b => b?.default()));

    console.log(`Detected readyState ${document.readyState}. Running onLoad listeners...`);

    document.addEventListener('DOMContentLoaded', () => {
        if (contentLoaded) return;
        contentLoaded = true;

        bb.plugins.list.forEach((plugin) => {
            if (pluginData.active.includes(plugin.title) || plugin.required) plugin.onLoad?.();
        });
    });

    if (document.readyState !== 'loading' && !contentLoaded) bb.plugins.list.forEach((plugin) => {
        if (pluginData.active.includes(plugin.title) || plugin.required) plugin.onLoad?.();
    });

    eventManager.subscribe('pageInit', () => {
        console.log(`Plugins got pageInit. Starting plugins...`);
        bb.plugins.list.forEach((plugin) => {
            if (pluginData.active.includes(plugin.title) || plugin.required) plugin.onStart?.();
        });
    });

    bb.plugins.list.forEach(plug => {
        if (pluginData.active.includes(plug.title) || plug.required) plug.patches.forEach(p => bb.patches.push({
            ...p,
            plugin: plug.title
        }));
    });

    bb.plugins.active = pluginData.active;
    bb.plugins.settings = pluginData.settings;

    console.log('Plugin data loaded. Starting patcher...');
    patcher();
}