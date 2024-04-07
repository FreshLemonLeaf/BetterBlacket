import patcher from './patcher.js';
import eventManager from 'utils/events.js';
import storage from 'utils/storage.js';

export default async () => {
    let pluginData = storage.get('bb_pluginData', true);
    let contentLoaded = false;

    await Promise.all(Object.values(import.meta.glob('../@(plugins|userplugins)/*/index.js', { eager: true })).map(async (pluginFile) => {
        let plugin = pluginFile.default();

        bb.plugins.list.push(plugin);
        if (!!plugin.styles) bb.plugins.styles[plugin.title] = plugin.styles;
    }));

    console.log(`Detected readyState ${document.readyState}. Running onLoad listeners...`);

    document.addEventListener('DOMContentLoaded', () => {
        if (contentLoaded) return;
        contentLoaded = true;

        bb.plugins.list.forEach((plugin) => {
            if (pluginData.active.includes(plugin.title) || plugin.required) plugin.onLoad?.();
        });
    });

    if (document.readyState !== 'loading' && !contentLoaded) {
        contentLoaded = true;

        bb.plugins.list.forEach((plugin) => {
            if (pluginData.active.includes(plugin.title) || plugin.required) plugin.onLoad?.();
        });
    };

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

    bb.plugins.active = [...pluginData.active, ...bb.plugins.list.filter(p => p.required).map(p => p.title)];
    bb.plugins.settings = pluginData.settings;

    console.log('Plugin data loaded. Starting patcher...');
    patcher();
}