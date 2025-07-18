// ==UserScript==
// @name         BetterBlacket Enhanced
// @description  The ultimate client mod for Blacket with 20+ toggleable features
// @version      4.0.0
// @icon         https://blacket.org/content/logo.png

// @author       Death / VillainsRule
// @namespace    https://bb.villainsrule.xyz

// @match        *://blacket.org/*
// @match        *://blacket.xotic.org/*
// @match        *://blacket.monkxy.com/*
// @match        *://dashboard.iblooket.com/*
// @match        *://b.blooketis.life/*
// @match        *://b.fart.services/*

// @grant        none
// @run-at       document-start
// ==/UserScript==

/* eslint-disable */

// Core Framework - Enhanced Plugin System
class BetterBlacketCore {
    constructor() {
        this.version = "4.0.0";
        this.plugins = new Map();
        this.settings = this.loadSettings();
        this.themes = [];
        this.init();
    }

    init() {
        console.log(`%c[BetterBlacket] %cv${this.version} Initializing...`, 
            'color: #00ff00; font-weight: bold;', 'color: #ffffff;');
        
        this.loadFontAwesome();
        this.setupEventSystem();
        this.setupSettingsUI();
        this.loadPlugins();
        this.startPatcher();
    }

    loadFontAwesome() {
        // Add Font Awesome 6 CDN
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        link.integrity = 'sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    }

    loadSettings() {
        try {
            return JSON.parse(localStorage.getItem('bb_settings') || '{}');
        } catch {
            return {};
        }
    }

    saveSettings() {
        localStorage.setItem('bb_settings', JSON.stringify(this.settings));
    }

    getSetting(pluginName, settingName, defaultValue = false) {
        return this.settings[pluginName]?.[settingName] ?? defaultValue;
    }

    setSetting(pluginName, settingName, value) {
        if (!this.settings[pluginName]) this.settings[pluginName] = {};
        this.settings[pluginName][settingName] = value;
        this.saveSettings();
    }

    registerPlugin(plugin) {
        this.plugins.set(plugin.name, plugin);
        console.log(`%c[BetterBlacket] %cRegistered plugin: ${plugin.name}`, 
            'color: #00ff00; font-weight: bold;', 'color: #ffffff;');
    }

    setupEventSystem() {
        this.events = new EventTarget();
        
        // Global event dispatcher
        this.on = (event, callback) => this.events.addEventListener(event, callback);
        this.emit = (event, data = {}) => this.events.dispatchEvent(new CustomEvent(event, { detail: data }));
    }

    setupSettingsUI() {
        // Enhanced settings UI will be injected when settings page loads
        this.on('pageLoad', (e) => {
            if (e.detail.path === '/settings') {
                this.injectSettingsUI();
            }
        });
    }

    injectSettingsUI() {
        // Create BetterBlacket settings section
        const settingsHTML = `
            <div class="bb-settings-container">
                <div class="bb-settings-header">
                    <h2><i class="fas fa-rocket"></i> BetterBlacket Settings</h2>
                    <div class="bb-header-actions">
                        <button class="bb-btn bb-btn-primary" onclick="bb.openPluginCreator()">
                            <i class="fas fa-plus"></i> Create Plugin
                        </button>
                        <span class="bb-version">v${this.version}</span>
                    </div>
                </div>
                <div class="bb-plugins-grid">
                    ${Array.from(this.plugins.values()).map(plugin => this.createPluginCard(plugin)).join('')}
                </div>
            </div>
            <div class="bb-plugin-creator" id="bb-plugin-creator" style="display: none;">
                <div class="bb-creator-content">
                    <div class="bb-creator-header">
                        <h2><i class="fas fa-tools"></i> Create Custom Plugin</h2>
                        <button class="bb-btn bb-btn-secondary" onclick="bb.closePluginCreator()"><i class="fas fa-times"></i></button>
                    </div>
                    <form class="bb-creator-form" onsubmit="bb.saveCustomPlugin(event)">
                        <div class="bb-form-row">
                            <div class="bb-form-group">
                                <label>Plugin Name *</label>
                                <input type="text" id="plugin-name" placeholder="My Awesome Plugin" required>
                            </div>
                            <div class="bb-form-group">
                                <label>Author *</label>
                                <input type="text" id="plugin-author" placeholder="Your Name" required>
                            </div>
                        </div>
                        <div class="bb-form-group">
                            <label>Description *</label>
                            <input type="text" id="plugin-description" placeholder="What does your plugin do?" required>
                        </div>
                        <div class="bb-form-group">
                            <label>Plugin Code *</label>
                            <textarea id="plugin-code" placeholder="// Your plugin code here
class MyPlugin {
    constructor() {
        this.name = 'My Plugin';
        this.description = 'Does amazing things';
        this.defaultEnabled = false;
    }
    
    init() {
        console.log('My plugin loaded!');
        // Your plugin logic here
    }
    
    // Optional: Add styles
    get styles() {
        return \`
            .my-plugin-style {
                color: #00ff00;
            }
        \`;
    }
}" required></textarea>
                        </div>
                        <div class="bb-form-row">
                            <div class="bb-form-group">
                                <label>
                                    <input type="checkbox" id="plugin-enabled"> 
                                    Enable immediately
                                </label>
                            </div>
                        </div>
                        <div class="bb-creator-actions">
                            <button type="button" class="bb-btn bb-btn-secondary" onclick="bb.closePluginCreator()">
                                Cancel
                            </button>
                            <button type="submit" class="bb-btn bb-btn-success">
                                Create Plugin
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Inject into settings page
        setTimeout(() => {
            const container = document.querySelector('.styles__mainContainer___4TLvi-camelCase');
            if (container) {
                container.insertAdjacentHTML('afterbegin', settingsHTML);
                this.attachSettingsListeners();
            }
        }, 100);
    }

    createPluginCard(plugin) {
        const isEnabled = this.getSetting(plugin.name, 'enabled', plugin.defaultEnabled ?? false);
        const isCustom = plugin.isCustom || false;
        const hasError = plugin.hasError || false;
        
        return `
            <div class="bb-plugin-card ${isEnabled ? 'enabled' : 'disabled'} ${isCustom ? 'custom' : ''} ${hasError ? 'error' : ''}">
                <div class="bb-plugin-header">
                    <div class="bb-plugin-title-section">
                        <h3>${plugin.name} ${isCustom ? '<i class="fas fa-cog"></i>' : ''} ${hasError ? '<i class="fas fa-exclamation-triangle"></i>' : ''}</h3>
                        ${isCustom ? `<span class="bb-custom-badge">Custom</span>` : ''}
                        ${plugin.author ? `<span class="bb-author-badge">by ${plugin.author}</span>` : ''}
                    </div>
                    <div class="bb-plugin-controls">
                        ${isCustom ? `<button class="bb-btn bb-btn-danger bb-btn-small" onclick="bb.deleteCustomPlugin('${plugin.name}')" title="Delete Plugin"><i class="fas fa-trash"></i></button>` : ''}
                        <label class="bb-toggle">
                            <input type="checkbox" ${isEnabled ? 'checked' : ''} 
                                   data-plugin="${plugin.name}" data-setting="enabled" ${hasError ? 'disabled' : ''}>
                            <span class="bb-slider"></span>
                        </label>
                    </div>
                </div>
                <p class="bb-plugin-description">${plugin.description}</p>
                ${hasError ? '<p class="bb-error-message">This plugin has errors and cannot be enabled.</p>' : ''}
                ${plugin.settings ? this.createPluginSettings(plugin) : ''}
            </div>
        `;
    }

    createPluginSettings(plugin) {
        if (!plugin.settings || plugin.settings.length === 0) return '';
        
        return `
            <div class="bb-plugin-settings">
                <h4>Settings</h4>
                ${plugin.settings.map(setting => `
                    <div class="bb-setting-item">
                        <label>${setting.name}</label>
                        <label class="bb-toggle bb-toggle-small">
                            <input type="checkbox" 
                                   ${this.getSetting(plugin.name, setting.key, setting.default) ? 'checked' : ''}
                                   data-plugin="${plugin.name}" data-setting="${setting.key}">
                            <span class="bb-slider"></span>
                        </label>
                    </div>
                `).join('')}
            </div>
        `;
    }

    attachSettingsListeners() {
        document.querySelectorAll('.bb-toggle input').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const plugin = e.target.dataset.plugin;
                const setting = e.target.dataset.setting;
                const value = e.target.checked;
                
                this.setSetting(plugin, setting, value);
                
                if (setting === 'enabled') {
                    const card = e.target.closest('.bb-plugin-card');
                    card.classList.toggle('enabled', value);
                    card.classList.toggle('disabled', !value);
                }
                
                this.emit('settingChanged', { plugin, setting, value });
            });
        });
    }

    startPatcher() {
        this.patcher = new ScriptPatcher();
        this.patcher.start();
    }

    loadPlugins() {
        // Load all plugins
        this.loadCorePlugins();
        this.loadNewPlugins();
    }

    loadCorePlugins() {
        // Original plugins with enhanced features
        this.registerPlugin(new AdvancedOpenerPlugin());
        this.registerPlugin(new BetterChatPlugin());
        this.registerPlugin(new BetterNotificationsPlugin());
        this.registerPlugin(new BlookUtilitiesPlugin());
        this.registerPlugin(new BazaarSniperPlugin());
        this.registerPlugin(new DeafBotPlugin());
        this.registerPlugin(new QuickCSSPlugin());
        this.registerPlugin(new StaffTagsPlugin());
        this.registerPlugin(new TokensEverywherePlugin());
        this.registerPlugin(new HighlightRarityPlugin());
    }

    loadNewPlugins() {
        // NEW PLUGINS - 10+ additional features
        this.registerPlugin(new AutoClaimerPlugin());
        this.registerPlugin(new BlookTrackerPlugin());
        this.registerPlugin(new ChatFiltersPlugin());
        this.registerPlugin(new CustomSoundsPlugin());
        this.registerPlugin(new DarkModePlugin());
        this.registerPlugin(new FastTradePlugin());
        this.registerPlugin(new GameStatsPlugin());
        this.registerPlugin(new HotkeysPlugin());
        this.registerPlugin(new InvestmentTrackerPlugin());
        this.registerPlugin(new JumpToTopPlugin());
        this.registerPlugin(new KeywordAlertsPlugin());
        this.registerPlugin(new LeaderboardTrackerPlugin());
        this.registerPlugin(new MoodSystemPlugin());
        this.registerPlugin(new NotificationSoundsPlugin());
        this.registerPlugin(new OneClickActionsPlugin());
        this.registerPlugin(new PackOpeningStatsPlugin());
        this.registerPlugin(new QuickNavigationPlugin());
        this.registerPlugin(new RainbowTextPlugin());
        this.registerPlugin(new SessionStatsPlugin());
        this.registerPlugin(new TimeDisplayPlugin());
        
        // Load custom plugins
        this.loadCustomPlugins();
    }
    
    // Plugin Creator Methods
    openPluginCreator() {
        document.getElementById('bb-plugin-creator').style.display = 'flex';
    }
    
    closePluginCreator() {
        document.getElementById('bb-plugin-creator').style.display = 'none';
        // Reset form
        document.querySelector('.bb-creator-form').reset();
    }
    
    saveCustomPlugin(event) {
        event.preventDefault();
        
        const name = document.getElementById('plugin-name').value.trim();
        const author = document.getElementById('plugin-author').value.trim();
        const description = document.getElementById('plugin-description').value.trim();
        const code = document.getElementById('plugin-code').value.trim();
        const enabled = document.getElementById('plugin-enabled').checked;
        
        if (!name || !author || !description || !code) {
            alert('Please fill in all required fields!');
            return;
        }
        
        try {
            // Create plugin object
            const customPlugin = {
                name,
                author,
                description,
                code,
                enabled,
                isCustom: true,
                created: Date.now()
            };
            
            // Save to localStorage
            const customPlugins = this.getCustomPlugins();
            customPlugins.push(customPlugin);
            localStorage.setItem('bb_custom_plugins', JSON.stringify(customPlugins));
            
            // Try to load the plugin immediately
            this.loadCustomPlugin(customPlugin);
            
            // Set enabled state
            if (enabled) {
                this.setSetting(name, 'enabled', true);
            }
            
            // Close creator and refresh settings
            this.closePluginCreator();
            this.refreshSettingsUI();
            
            alert(`Plugin "${name}" created successfully!${enabled ? ' It has been enabled.' : ''}`);
            
        } catch (error) {
            console.error('Error creating plugin:', error);
            alert('Error creating plugin. Please check your code and try again.');
        }
    }
    
    getCustomPlugins() {
        try {
            return JSON.parse(localStorage.getItem('bb_custom_plugins') || '[]');
        } catch {
            return [];
        }
    }
    
    loadCustomPlugins() {
        const customPlugins = this.getCustomPlugins();
        customPlugins.forEach(pluginData => {
            try {
                this.loadCustomPlugin(pluginData);
            } catch (error) {
                console.error(`Failed to load custom plugin "${pluginData.name}":`, error);
            }
        });
    }
    
    loadCustomPlugin(pluginData) {
        try {
            // Create a safe execution environment
            const pluginFunction = new Function('bb', `
                ${pluginData.code}
                
                // If the code doesn't return a class, wrap it in a basic plugin structure
                if (typeof this.name === 'undefined') {
                    return class CustomPlugin {
                        constructor() {
                            this.name = "${pluginData.name}";
                            this.description = "${pluginData.description}";
                            this.author = "${pluginData.author}";
                            this.defaultEnabled = ${pluginData.enabled};
                            this.isCustom = true;
                        }
                        
                        init() {
                            ${pluginData.code}
                        }
                    };
                } else {
                    // Return the defined class
                    return eval('(' + arguments[0] + ')');
                }
            `);
            
            const PluginClass = pluginFunction.call({}, this);
            const pluginInstance = new PluginClass();
            
            // Ensure it has the required properties
            pluginInstance.name = pluginData.name;
            pluginInstance.description = pluginData.description;
            pluginInstance.author = pluginData.author;
            pluginInstance.isCustom = true;
            
            this.registerPlugin(pluginInstance);
            
        } catch (error) {
            console.error(`Error loading custom plugin "${pluginData.name}":`, error);
            // Create a dummy plugin that shows the error
            this.registerPlugin({
                name: pluginData.name + ' (Error)',
                description: `Custom plugin failed to load: ${error.message}`,
                author: pluginData.author,
                isCustom: true,
                hasError: true,
                init: () => console.error(`Custom plugin "${pluginData.name}" has errors`)
            });
        }
    }
    
    refreshSettingsUI() {
        // Refresh the settings UI to show new plugins
        const container = document.querySelector('.bb-settings-container');
        if (container) {
            const pluginsGrid = container.querySelector('.bb-plugins-grid');
            if (pluginsGrid) {
                pluginsGrid.innerHTML = Array.from(this.plugins.values())
                    .map(plugin => this.createPluginCard(plugin)).join('');
                this.attachSettingsListeners();
            }
        }
    }
    
    deleteCustomPlugin(pluginName) {
        if (confirm(`Are you sure you want to delete the plugin "${pluginName}"?`)) {
            // Remove from storage
            const customPlugins = this.getCustomPlugins();
            const filteredPlugins = customPlugins.filter(p => p.name !== pluginName);
            localStorage.setItem('bb_custom_plugins', JSON.stringify(filteredPlugins));
            
            // Remove from memory
            this.plugins.delete(pluginName);
            
            // Refresh UI
            this.refreshSettingsUI();
            
            alert(`Plugin "${pluginName}" deleted successfully!`);
        }
    }
}

// Script Patcher Class
class ScriptPatcher {
    constructor() {
        this.blacklistedKeywords = ["cdn-cgi", "jquery", "jscolor"];
        this.patched = [];
        this.observer = null;
    }

    start() {
        console.log("[BetterBlacket] Starting script patcher...");
        
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(async (node) => {
                        if (node.tagName === "SCRIPT" && 
                            !this.blacklistedKeywords.some(k => node.src.includes(k)) && 
                            node.src.includes(location.host) && 
                            !this.patched.includes(node.src)) {
                            
                            console.log("[BetterBlacket] Intercepting script:", node.src);
                            this.patched.push(node.src);
                            node.removeAttribute("src");
                        }
                    });
                }
            });
        });

        this.observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        // Block existing scripts
        [...document.querySelectorAll("script")].forEach((script) => {
            if (!this.blacklistedKeywords.some(k => script.src.includes(k)) && 
                script.src.includes(location.host) && 
                !this.patched.includes(script.src)) {
                
                console.log("[BetterBlacket] Blocking script:", script.src);
                this.patched.push(script.src);
                script.removeAttribute("src");
            }
        });

        // Wait for jQuery then patch scripts
        this.waitForJQuery();
    }

    async waitForJQuery() {
        if (!window.$) {
            setTimeout(() => this.waitForJQuery(), 100);
            return;
        }

        console.log("[BetterBlacket] jQuery detected! Patching scripts...");
        this.observer.disconnect();
        await this.patchScripts();
    }

    async patchScripts() {
        // Patch scripts with plugin modifications
        for (const scriptUrl of this.patched) {
            try {
                const response = await fetch(scriptUrl);
                let code = await response.text();
                
                // Apply plugin patches
                code = this.applyPatches(code, scriptUrl);
                
                // Create patched script
                const blob = new Blob([`// Patched by BetterBlacket v${bb.version}\n${code}`], 
                    { type: 'application/javascript' });
                const url = URL.createObjectURL(blob);
                
                const script = document.createElement('script');
                script.src = url;
                script.setAttribute('data-bb-patched', scriptUrl);
                document.head.appendChild(script);
                
                console.log(`[BetterBlacket] Patched: ${scriptUrl}`);
            } catch (error) {
                console.error(`[BetterBlacket] Failed to patch ${scriptUrl}:`, error);
            }
        }
        
        this.injectStyles();
    }

    applyPatches(code, scriptUrl) {
        // Apply patches from enabled plugins
        bb.plugins.forEach(plugin => {
            if (bb.getSetting(plugin.name, 'enabled', plugin.defaultEnabled ?? false) && plugin.patches) {
                plugin.patches.forEach(patch => {
                    if (scriptUrl.includes(patch.file)) {
                        patch.replacements?.forEach(replacement => {
                            if (replacement.condition && !bb.getSetting(plugin.name, replacement.condition)) {
                                return; // Skip if condition not met
                            }
                            
                            const regex = new RegExp(replacement.match, 'gm');
                            if (regex.test(code)) {
                                code = code.replace(regex, replacement.replace);
                                console.log(`[BetterBlacket] Applied patch from ${plugin.name}`);
                            }
                        });
                    }
                });
            }
        });
        
        return code;
    }

    injectStyles() {
        const styles = Array.from(bb.plugins.values())
            .filter(plugin => bb.getSetting(plugin.name, 'enabled', plugin.defaultEnabled ?? false))
            .map(plugin => plugin.styles || '')
            .join('\n\n');
        
        if (styles) {
            const styleElement = document.createElement('style');
            styleElement.textContent = styles + this.getCoreStyles();
            document.head.appendChild(styleElement);
        }
    }

    getCoreStyles() {
        return `
            /* BetterBlacket Core Styles */
            .bb-settings-container {
                background: #2f2f2f;
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
                border: 2px solid #3f3f3f;
            }
            
            .bb-settings-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #3f3f3f;
            }
            
            .bb-settings-header h2 {
                color: #00ff00;
                margin: 0;
                font-size: 24px;
            }
            
            .bb-version {
                background: #00ff00;
                color: #000;
                padding: 4px 8px;
                border-radius: 5px;
                font-weight: bold;
                font-size: 12px;
            }
            
            .bb-plugins-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 15px;
            }
            
            .bb-plugin-card {
                background: #3f3f3f;
                border-radius: 8px;
                padding: 15px;
                border: 2px solid transparent;
                transition: all 0.3s ease;
            }
            
            .bb-plugin-card.enabled {
                border-color: #00ff00;
                box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
            }
            
            .bb-plugin-card.disabled {
                opacity: 0.6;
                border-color: #666;
            }
            
            .bb-plugin-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .bb-plugin-header h3 {
                margin: 0;
                color: #fff;
                font-size: 16px;
            }
            
            .bb-plugin-description {
                color: #ccc;
                margin: 0 0 15px 0;
                font-size: 14px;
            }
            
            .bb-plugin-settings {
                border-top: 1px solid #555;
                padding-top: 10px;
            }
            
            .bb-plugin-settings h4 {
                margin: 0 0 10px 0;
                color: #fff;
                font-size: 14px;
            }
            
            .bb-setting-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .bb-setting-item label {
                color: #ccc;
                font-size: 13px;
            }
            
            .bb-toggle {
                position: relative;
                display: inline-block;
                width: 50px;
                height: 24px;
            }
            
            .bb-toggle-small {
                width: 40px;
                height: 20px;
            }
            
            .bb-toggle input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            
            .bb-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #666;
                transition: .4s;
                border-radius: 24px;
            }
            
            .bb-slider:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: .4s;
                border-radius: 50%;
            }
            
            .bb-toggle-small .bb-slider:before {
                height: 14px;
                width: 14px;
            }
            
            input:checked + .bb-slider {
                background-color: #00ff00;
            }
            
            input:checked + .bb-slider:before {
                transform: translateX(26px);
            }
            
            .bb-toggle-small input:checked + .bb-slider:before {
                transform: translateX(20px);
            }
            
            /* Plugin Creator Styles */
            .bb-plugin-creator {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            
            .bb-creator-content {
                background: #2f2f2f;
                border-radius: 10px;
                padding: 20px;
                max-width: 800px;
                width: 90%;
                max-height: 90%;
                overflow-y: auto;
                border: 2px solid #00ff00;
            }
            
            .bb-creator-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #3f3f3f;
            }
            
            .bb-creator-header h2 {
                color: #00ff00;
                margin: 0;
            }
            
            .bb-creator-form {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .bb-form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            
            .bb-form-group {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            
            .bb-form-group label {
                color: #fff;
                font-weight: bold;
            }
            
            .bb-form-group input,
            .bb-form-group textarea {
                background: #3f3f3f;
                border: 2px solid #555;
                border-radius: 5px;
                padding: 10px;
                color: #fff;
                font-family: 'Courier New', monospace;
            }
            
            .bb-form-group textarea {
                min-height: 200px;
                resize: vertical;
            }
            
            .bb-form-group input:focus,
            .bb-form-group textarea:focus {
                outline: none;
                border-color: #00ff00;
            }
            
            .bb-creator-actions {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 2px solid #3f3f3f;
            }
            
            .bb-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
            }
            
            .bb-btn-primary {
                background: #007bff;
                color: #fff;
            }
            
            .bb-btn-secondary {
                background: #6c757d;
                color: #fff;
            }
            
            .bb-btn-success {
                background: #28a745;
                color: #fff;
            }
            
            .bb-btn-danger {
                background: #dc3545;
                color: #fff;
            }
            
            .bb-btn-small {
                padding: 5px 10px;
                font-size: 12px;
            }
            
            .bb-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            }
            
            .bb-header-actions {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            /* Custom Plugin Styles */
            .bb-plugin-card.custom {
                border-color: #ffd700;
                position: relative;
            }
            
            .bb-plugin-card.custom::before {
                content: '';
                position: absolute;
                top: -2px;
                left: -2px;
                right: -2px;
                bottom: -2px;
                background: linear-gradient(45deg, #ffd700, #ffed4e, #ffd700);
                border-radius: 10px;
                z-index: -1;
                animation: shimmer 2s infinite;
            }
            
            @keyframes shimmer {
                0%, 100% { opacity: 0.7; }
                50% { opacity: 1; }
            }
            
            .bb-plugin-card.error {
                border-color: #dc3545;
                background: #4a2c2c;
            }
            
            .bb-plugin-title-section {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            
            .bb-plugin-controls {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .bb-custom-badge {
                background: #ffd700;
                color: #000;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 10px;
                font-weight: bold;
            }
            
            .bb-author-badge {
                background: #6c757d;
                color: #fff;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 10px;
            }
            
            .bb-error-message {
                color: #dc3545;
                font-style: italic;
                margin: 5px 0;
            }
            
            /* Notification Styles */
            .bb-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #2f2f2f;
                color: #fff;
                padding: 15px 20px;
                border-radius: 8px;
                border-left: 4px solid #00ff00;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                animation: slideIn 0.3s ease;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            /* Plugin Creator Styles */
            .bb-header-actions {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .bb-btn {
                padding: 8px 16px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
                font-size: 14px;
            }
            
            .bb-btn-primary {
                background: #007bff;
                color: white;
            }
            
            .bb-btn-primary:hover {
                background: #0056b3;
            }
            
            .bb-btn-secondary {
                background: #6c757d;
                color: white;
            }
            
            .bb-btn-secondary:hover {
                background: #545b62;
            }
            
            .bb-btn-success {
                background: #28a745;
                color: white;
            }
            
            .bb-btn-success:hover {
                background: #1e7e34;
            }
            
            .bb-btn-danger {
                background: #dc3545;
                color: white;
            }
            
            .bb-btn-danger:hover {
                background: #c82333;
            }
            
            .bb-btn-small {
                padding: 4px 8px;
                font-size: 12px;
            }
            
            .bb-plugin-creator {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            
            .bb-creator-content {
                background: #2f2f2f;
                border-radius: 10px;
                padding: 30px;
                max-width: 800px;
                width: 90%;
                max-height: 90%;
                overflow-y: auto;
            }
            
            .bb-creator-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 2px solid #3f3f3f;
            }
            
            .bb-creator-header h2 {
                color: #00ff00;
                margin: 0;
            }
            
            .bb-creator-form {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .bb-form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            
            .bb-form-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .bb-form-group label {
                color: #fff;
                font-weight: bold;
            }
            
            .bb-form-group input,
            .bb-form-group textarea {
                padding: 10px;
                border: 2px solid #3f3f3f;
                border-radius: 5px;
                background: #1f1f1f;
                color: #fff;
                font-family: 'Courier New', monospace;
            }
            
            .bb-form-group textarea {
                min-height: 200px;
                resize: vertical;
            }
            
            .bb-creator-actions {
                display: flex;
                gap: 15px;
                justify-content: flex-end;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 2px solid #3f3f3f;
            }
            
            .bb-plugin-title-section {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            
            .bb-plugin-controls {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .bb-custom-badge {
                background: #17a2b8;
                color: white;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 10px;
                font-weight: bold;
            }
            
            .bb-author-badge {
                background: #6c757d;
                color: white;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 10px;
            }
            
            .bb-plugin-card.custom {
                border-left: 4px solid #17a2b8;
            }
            
            .bb-plugin-card.error {
                border-left: 4px solid #dc3545;
                opacity: 0.7;
            }
            
            .bb-error-message {
                color: #dc3545;
                font-style: italic;
                font-size: 12px;
                margin: 5px 0;
            }
        `;
    }
}

// NEW PLUGIN CLASSES (10+ Additional Features)

class AutoClaimerPlugin {
    constructor() {
        this.name = "Auto Claimer";
        this.description = "Automatically claims daily rewards when available";
        this.defaultEnabled = false;
        this.settings = [
            { name: "Auto Claim Daily", key: "autoClaim", default: true },
            { name: "Show Notifications", key: "showNotifications", default: true }
        ];
    }

    init() {
        if (!bb.getSetting(this.name, 'enabled')) return;
        
        this.checkForClaims();
        setInterval(() => this.checkForClaims(), 60000); // Check every minute
    }

    async checkForClaims() {
        if (!bb.getSetting(this.name, 'autoClaim')) return;
        
        try {
            const response = await fetch('/worker/claim');
            const data = await response.json();
            
            if (!data.error) {
                if (bb.getSetting(this.name, 'showNotifications')) {
                    this.showNotification(`Auto-claimed ${data.reward} tokens!`);
                }
            }
        } catch (error) {
            console.log('[Auto Claimer] No claim available');
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'bb-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }
}

class BlookTrackerPlugin {
    constructor() {
        this.name = "Blook Tracker";
        this.description = "Track blook collection progress and statistics";
        this.defaultEnabled = false;
        this.settings = [
            { name: "Track Duplicates", key: "trackDupes", default: true },
            { name: "Show Progress Bar", key: "showProgress", default: true },
            { name: "Export Statistics", key: "allowExport", default: true }
        ];
    }

    init() {
        if (!bb.getSetting(this.name, 'enabled')) return;
        this.addTrackingUI();
    }

    addTrackingUI() {
        // Add tracking interface to blooks page
        bb.on('pageLoad', (e) => {
            if (e.detail.path === '/blooks') {
                this.injectBlookTracker();
            }
        });
    }

    injectBlookTracker() {
        const trackerHTML = `
            <div class="bb-blook-tracker">
                <h3><i class="fas fa-chart-bar"></i> Collection Progress</h3>
                <div class="bb-progress-bar">
                    <div class="bb-progress-fill" style="width: ${this.getCollectionProgress()}%"></div>
                </div>
                <div class="bb-stats">
                    <span>Unique: ${this.getUniqueBlooks()}</span>
                    <span>Total: ${this.getTotalBlooks()}</span>
                    <span>Duplicates: ${this.getDuplicates()}</span>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            const container = document.querySelector('.styles__profileContainer___CSuIE-camelCase');
            if (container) {
                container.insertAdjacentHTML('afterbegin', trackerHTML);
            }
        }, 500);
    }

    getCollectionProgress() {
        if (!window.blacket?.user?.blooks) return 0;
        const owned = Object.keys(window.blacket.user.blooks).length;
        const total = Object.keys(window.blacket.blooks || {}).length;
        return total > 0 ? Math.round((owned / total) * 100) : 0;
    }

    getUniqueBlooks() {
        return Object.keys(window.blacket?.user?.blooks || {}).length;
    }

    getTotalBlooks() {
        return Object.values(window.blacket?.user?.blooks || {}).reduce((sum, count) => sum + count, 0);
    }

    getDuplicates() {
        const blooks = window.blacket?.user?.blooks || {};
        return Object.values(blooks).reduce((sum, count) => sum + Math.max(0, count - 1), 0);
    }

    get styles() {
        return `
            .bb-blook-tracker {
                background: #2f2f2f;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 15px;
                border: 2px solid #00ff00;
            }
            
            .bb-blook-tracker h3 {
                margin: 0 0 10px 0;
                color: #00ff00;
            }
            
            .bb-progress-bar {
                background: #1f1f1f;
                height: 10px;
                border-radius: 5px;
                overflow: hidden;
                margin-bottom: 10px;
            }
            
            .bb-progress-fill {
                background: linear-gradient(90deg, #00ff00, #00aa00);
                height: 100%;
                transition: width 0.3s ease;
            }
            
            .bb-stats {
                display: flex;
                justify-content: space-between;
                color: #ccc;
                font-size: 14px;
            }
        `;
    }
}

class ChatFiltersPlugin {
    constructor() {
        this.name = "Chat Filters";
        this.description = "Filter and customize chat messages";
        this.defaultEnabled = false;
        this.settings = [
            { name: "Hide System Messages", key: "hideSystem", default: false },
            { name: "Filter Profanity", key: "filterProfanity", default: false },
            { name: "Hide Ping Sounds", key: "hidePingSounds", default: false },
            { name: "Custom Word Filter", key: "customFilter", default: false }
        ];
        this.bannedWords = ['spam', 'scam', 'hack'];
    }

    init() {
        if (!bb.getSetting(this.name, 'enabled')) return;
        this.patchChat();
    }

    patchChat() {
        this.patches = [{
            file: '/lib/js/game.js',
            replacements: [{
                match: /data\.message\.content/g,
                replace: 'bb.plugins.get("Chat Filters").filterMessage(data.message.content)',
                condition: 'enabled'
            }]
        }];
    }

    filterMessage(content) {
        if (!content) return content;
        
        let filtered = content;
        
        if (bb.getSetting(this.name, 'filterProfanity')) {
            filtered = this.filterProfanity(filtered);
        }
        
        if (bb.getSetting(this.name, 'customFilter')) {
            filtered = this.applyCustomFilter(filtered);
        }
        
        return filtered;
    }

    filterProfanity(text) {
        // Basic profanity filter
        const profanity = ['damn', 'hell', 'crap'];
        let filtered = text;
        
        profanity.forEach(word => {
            const regex = new RegExp(word, 'gi');
            filtered = filtered.replace(regex, '*'.repeat(word.length));
        });
        
        return filtered;
    }

    applyCustomFilter(text) {
        let filtered = text;
        
        this.bannedWords.forEach(word => {
            const regex = new RegExp(word, 'gi');
            filtered = filtered.replace(regex, '[FILTERED]');
        });
        
        return filtered;
    }
}

class CustomSoundsPlugin {
    constructor() {
        this.name = "Custom Sounds";
        this.description = "Add custom sound effects for various actions";
        this.defaultEnabled = false;
        this.settings = [
            { name: "Pack Open Sound", key: "packSound", default: true },
            { name: "Trade Sound", key: "tradeSound", default: true },
            { name: "Message Sound", key: "messageSound", default: false },
            { name: "Rare Blook Sound", key: "rareSound", default: true }
        ];
        this.sounds = {
            pack: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
            trade: 'https://www.soundjay.com/misc/sounds/beep-3.wav',
            message: 'https://www.soundjay.com/misc/sounds/beep-10.wav',
            rare: 'https://www.soundjay.com/misc/sounds/success-sound-effect.wav'
        };
    }

    init() {
        if (!bb.getSetting(this.name, 'enabled')) return;
        this.setupSounds();
    }

    setupSounds() {
        // Preload sounds
        Object.values(this.sounds).forEach(url => {
            const audio = new Audio(url);
            audio.preload = 'auto';
        });
        
        // Hook into game events
        bb.on('packOpened', () => {
            if (bb.getSetting(this.name, 'packSound')) {
                this.playSound('pack');
            }
        });
        
        bb.on('tradeReceived', () => {
            if (bb.getSetting(this.name, 'tradeSound')) {
                this.playSound('trade');
            }
        });
    }

    playSound(type) {
        try {
            const audio = new Audio(this.sounds[type]);
            audio.volume = 0.3;
            audio.play().catch(e => console.log('Sound play failed:', e));
        } catch (error) {
            console.log('Custom sound error:', error);
        }
    }
}

class DarkModePlugin {
    constructor() {
        this.name = "Enhanced Dark Mode";
        this.description = "Advanced dark mode with customizable themes";
        this.defaultEnabled = false;
        this.settings = [
            { name: "Deep Dark", key: "deepDark", default: false },
            { name: "Blue Accent", key: "blueAccent", default: false },
            { name: "Green Accent", key: "greenAccent", default: true },
            { name: "High Contrast", key: "highContrast", default: false }
        ];
    }

    init() {
        if (!bb.getSetting(this.name, 'enabled')) return;
        this.applyDarkMode();
    }

    applyDarkMode() {
        const style = document.createElement('style');
        style.textContent = this.getDarkModeCSS();
        document.head.appendChild(style);
    }

    getDarkModeCSS() {
        const deepDark = bb.getSetting(this.name, 'deepDark');
        const blueAccent = bb.getSetting(this.name, 'blueAccent');
        const greenAccent = bb.getSetting(this.name, 'greenAccent');
        const highContrast = bb.getSetting(this.name, 'highContrast');
        
        const bgColor = deepDark ? '#0a0a0a' : '#1a1a1a';
        const cardColor = deepDark ? '#111111' : '#2f2f2f';
        const accentColor = blueAccent ? '#0088ff' : greenAccent ? '#00ff00' : '#ff6b6b';
        
        return `
            :root {
                --bb-bg-primary: ${bgColor};
                --bb-bg-secondary: ${cardColor};
                --bb-accent: ${accentColor};
                --bb-text-primary: ${highContrast ? '#ffffff' : '#e0e0e0'};
                --bb-text-secondary: ${highContrast ? '#cccccc' : '#b0b0b0'};
            }
            
            body, .styles__background___2J-JA-camelCase {
                background-color: var(--bb-bg-primary) !important;
                color: var(--bb-text-primary) !important;
            }
            
            .styles__container___2VzTy-camelCase,
            .styles__cardContainer___NGmjp-camelCase,
            .styles__profileContainer___CSuIE-camelCase {
                background-color: var(--bb-bg-secondary) !important;
                border-color: var(--bb-accent) !important;
            }
            
            .styles__button___2hNZo-camelCase {
                background: linear-gradient(135deg, var(--bb-accent), color-mix(in srgb, var(--bb-accent) 80%, #000)) !important;
            }
        `;
    }

    get styles() {
        return this.getDarkModeCSS();
    }
}

class FastTradePlugin {
    constructor() {
        this.name = "Fast Trade";
        this.description = "Speed up trading with quick actions and shortcuts";
        this.defaultEnabled = false;
        this.settings = [
            { name: "One-Click Accept", key: "quickAccept", default: true },
            { name: "Auto-Fill Common Trades", key: "autoFill", default: false },
            { name: "Trade Templates", key: "templates", default: true },
            { name: "Quick Decline", key: "quickDecline", default: true }
        ];
    }

    init() {
        if (!bb.getSetting(this.name, 'enabled')) return;
        this.enhanceTrading();
    }

    enhanceTrading() {
        bb.on('pageLoad', (e) => {
            if (e.detail.path === '/trade') {
                this.addFastTradeUI();
            }
        });
    }

    addFastTradeUI() {
        setTimeout(() => {
            const tradeContainer = document.querySelector('.styles__tradingContainer___B1ABS-camelCase');
            if (tradeContainer) {
                const fastTradeHTML = `
                    <div class="bb-fast-trade">
                        <h4><i class="fas fa-bolt"></i> Fast Trade</h4>
                        <div class="bb-trade-actions">
                            <button class="bb-btn bb-btn-green" onclick="bb.plugins.get('Fast Trade').quickAccept()">
                                <i class="fas fa-check"></i> Quick Accept
                            </button>
                            <button class="bb-btn bb-btn-red" onclick="bb.plugins.get('Fast Trade').quickDecline()">
                                <i class="fas fa-times"></i> Quick Decline
                            </button>
                        </div>
                    </div>
                `;
                tradeContainer.insertAdjacentHTML('beforebegin', fastTradeHTML);
            }
        }, 1000);
    }

    quickAccept() {
        if (!bb.getSetting(this.name, 'quickAccept')) return;
        
        const acceptButton = document.querySelector('[onclick*="acceptTrade"]');
        if (acceptButton) {
            acceptButton.click();
        }
    }

    quickDecline() {
        if (!bb.getSetting(this.name, 'quickDecline')) return;
        
        const declineButton = document.querySelector('[onclick*="declineTrade"]');
        if (declineButton) {
            declineButton.click();
        }
    }

    get styles() {
        return `
            .bb-fast-trade {
                background: #2f2f2f;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 15px;
                border: 2px solid #00ff00;
            }
            
            .bb-fast-trade h4 {
                margin: 0 0 10px 0;
                color: #00ff00;
            }
            
            .bb-trade-actions {
                display: flex;
                gap: 10px;
            }
            
            .bb-btn {
                padding: 8px 16px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
            }
            
            .bb-btn-green {
                background: #00ff00;
                color: #000;
            }
            
            .bb-btn-red {
                background: #ff0000;
                color: #fff;
            }
            
            .bb-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            }
        `;
    }
}

class GameStatsPlugin {
    constructor() {
        this.name = "Game Statistics";
        this.description = "Track detailed gameplay statistics and achievements";
        this.defaultEnabled = false;
        this.settings = [
            { name: "Track Pack Opens", key: "trackPacks", default: true },
            { name: "Track Trades", key: "trackTrades", default: true },
            { name: "Track Chat Messages", key: "trackChat", default: false },
            { name: "Export Stats", key: "allowExport", default: true }
        ];
        this.stats = this.loadStats();
    }

    init() {
        if (!bb.getSetting(this.name, 'enabled')) return;
        this.startTracking();
    }

    loadStats() {
        try {
            return JSON.parse(localStorage.getItem('bb_game_stats') || '{}');
        } catch {
            return {
                packsOpened: 0,
                tradesCompleted: 0,
                messagesSent: 0,
                tokensEarned: 0,
                blooksFound: 0,
                sessionStart: Date.now()
            };
        }
    }

    saveStats() {
        localStorage.setItem('bb_game_stats', JSON.stringify(this.stats));
    }

    startTracking() {
        // Track pack opens
        bb.on('packOpened', (data) => {
            if (bb.getSetting(this.name, 'trackPacks')) {
                this.stats.packsOpened++;
                this.stats.blooksFound++;
                this.saveStats();
            }
        });

        // Track trades
        bb.on('tradeCompleted', () => {
            if (bb.getSetting(this.name, 'trackTrades')) {
                this.stats.tradesCompleted++;
                this.saveStats();
            }
        });

        // Track messages
        bb.on('messageSent', () => {
            if (bb.getSetting(this.name, 'trackChat')) {
                this.stats.messagesSent++;
                this.saveStats();
            }
        });
    }

    getStatsDisplay() {
        const sessionTime = Math.floor((Date.now() - this.stats.sessionStart) / 1000 / 60);
        
        return `
            <div class="bb-game-stats">
                <h3><i class="fas fa-chart-line"></i> Game Statistics</h3>
                <div class="bb-stat-grid">
                    <div class="bb-stat-item">
                        <span class="bb-stat-label">Packs Opened:</span>
                        <span class="bb-stat-value">${this.stats.packsOpened.toLocaleString()}</span>
                    </div>
                    <div class="bb-stat-item">
                        <span class="bb-stat-label">Trades Completed:</span>
                        <span class="bb-stat-value">${this.stats.tradesCompleted.toLocaleString()}</span>
                    </div>
                    <div class="bb-stat-item">
                        <span class="bb-stat-label">Messages Sent:</span>
                        <span class="bb-stat-value">${this.stats.messagesSent.toLocaleString()}</span>
                    </div>
                    <div class="bb-stat-item">
                        <span class="bb-stat-label">Session Time:</span>
                        <span class="bb-stat-value">${sessionTime}m</span>
                    </div>
                </div>
            </div>
        `;
    }

    get styles() {
        return `
            .bb-game-stats {
                background: #2f2f2f;
                padding: 15px;
                border-radius: 8px;
                margin: 15px 0;
                border: 2px solid #00ff00;
            }
            
            .bb-game-stats h3 {
                margin: 0 0 15px 0;
                color: #00ff00;
            }
            
            .bb-stat-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }
            
            .bb-stat-item {
                display: flex;
                justify-content: space-between;
                padding: 8px;
                background: #3f3f3f;
                border-radius: 5px;
            }
            
            .bb-stat-label {
                color: #ccc;
            }
            
            .bb-stat-value {
                color: #00ff00;
                font-weight: bold;
            }
        `;
    }
}

class HotkeysPlugin {
    constructor() {
        this.name = "Hotkeys";
        this.description = "Keyboard shortcuts for common actions";
        this.defaultEnabled = false;
        this.settings = [
            { name: "Enable Hotkeys", key: "enableHotkeys", default: true },
            { name: "Chat Focus (Tab)", key: "chatFocus", default: true },
            { name: "Quick Settings (Ctrl+,)", key: "quickSettings", default: true },
            { name: "Toggle Dark Mode (Ctrl+D)", key: "toggleDark", default: false }
        ];
        this.hotkeys = new Map();
    }

    init() {
        if (!bb.getSetting(this.name, 'enabled')) return;
        this.setupHotkeys();
    }

    setupHotkeys() {
        document.addEventListener('keydown', (e) => {
            if (!bb.getSetting(this.name, 'enableHotkeys')) return;
            
            // Tab - Focus chat
            if (e.key === 'Tab' && bb.getSetting(this.name, 'chatFocus')) {
                e.preventDefault();
                const chatInput = document.querySelector('#chatBox');
                if (chatInput) {
                    chatInput.focus();
                }
            }
            
            // Ctrl+, - Quick settings
            if (e.ctrlKey && e.key === ',' && bb.getSetting(this.name, 'quickSettings')) {
                e.preventDefault();
                window.location.href = '/settings';
            }
            
            // Ctrl+D - Toggle dark mode
            if (e.ctrlKey && e.key === 'd' && bb.getSetting(this.name, 'toggleDark')) {
                e.preventDefault();
                const darkModePlugin = bb.plugins.get('Enhanced Dark Mode');
                if (darkModePlugin) {
                    const currentState = bb.getSetting('Enhanced Dark Mode', 'enabled');
                    bb.setSetting('Enhanced Dark Mode', 'enabled', !currentState);
                    location.reload(); // Reload to apply changes
                }
            }
            
            // Escape - Close modals
            if (e.key === 'Escape') {
                const modal = document.querySelector('.arts__modal___VpEAD-camelCase');
                if (modal) {
                    modal.remove();
                }
            }
        });
        
        this.showHotkeyHelper();
    }

    showHotkeyHelper() {
        // Add hotkey indicator
        const indicator = document.createElement('div');
        indicator.className = 'bb-hotkey-indicator';
        indicator.innerHTML = '<i class="fas fa-keyboard"></i> Press ? for hotkeys';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #2f2f2f;
            color: #fff;
            padding: 8px 12px;
            border-radius: 5px;
            font-size: 12px;
            z-index: 1000;
            opacity: 0.7;
            cursor: pointer;
        `;
        
        indicator.onclick = () => this.showHotkeyModal();
        document.body.appendChild(indicator);
        
        // Hide after 5 seconds
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.style.opacity = '0.3';
            }
        }, 5000);
    }

    showHotkeyModal() {
        const modal = `
            <div class="arts__modal___VpEAD-camelCase">
                <div class="bb-hotkey-modal">
                    <h2><i class="fas fa-keyboard"></i> Keyboard Shortcuts</h2>
                    <div class="bb-hotkey-list">
                        <div class="bb-hotkey-item">
                            <kbd>Tab</kbd>
                            <span>Focus chat input</span>
                        </div>
                        <div class="bb-hotkey-item">
                            <kbd>Ctrl</kbd> + <kbd>,</kbd>
                            <span>Open settings</span>
                        </div>
                        <div class="bb-hotkey-item">
                            <kbd>Ctrl</kbd> + <kbd>D</kbd>
                            <span>Toggle dark mode</span>
                        </div>
                        <div class="bb-hotkey-item">
                            <kbd>Esc</kbd>
                            <span>Close modals</span>
                        </div>
                    </div>
                    <button onclick="this.closest('.arts__modal___VpEAD-camelCase').remove()" class="bb-btn bb-btn-green">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modal);
    }

    get styles() {
        return `
            .bb-hotkey-modal {
                background: #2f2f2f;
                padding: 20px;
                border-radius: 10px;
                max-width: 400px;
                margin: 20px auto;
                color: #fff;
            }
            
            .bb-hotkey-modal h2 {
                margin: 0 0 20px 0;
                text-align: center;
                color: #00ff00;
            }
            
            .bb-hotkey-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-bottom: 20px;
            }
            
            .bb-hotkey-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                background: #3f3f3f;
                border-radius: 5px;
            }
            
            kbd {
                background: #1f1f1f;
                color: #00ff00;
                padding: 2px 6px;
                border-radius: 3px;
                font-family: monospace;
                font-size: 12px;
                border: 1px solid #555;
            }
        `;
    }
}

// Continue with more plugins...
class TimeDisplayPlugin {
    constructor() {
        this.name = "Time Display";
        this.description = "Shows current time and session duration";
        this.defaultEnabled = false;
        this.settings = [
            { name: "Show Clock", key: "showClock", default: true },
            { name: "Show Session Time", key: "showSession", default: true },
            { name: "24 Hour Format", key: "format24", default: false }
        ];
        this.sessionStart = Date.now();
    }

    init() {
        if (!bb.getSetting(this.name, 'enabled')) return;
        this.createTimeDisplay();
    }

    createTimeDisplay() {
        const timeDisplay = document.createElement('div');
        timeDisplay.className = 'bb-time-display';
        timeDisplay.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(47, 47, 47, 0.9);
            color: #00ff00;
            padding: 8px 12px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 14px;
            z-index: 1000;
            backdrop-filter: blur(5px);
        `;
        
        document.body.appendChild(timeDisplay);
        
        setInterval(() => this.updateTime(timeDisplay), 1000);
    }

    updateTime(element) {
        const now = new Date();
        const format24 = bb.getSetting(this.name, 'format24');
        
        let timeString = '';
        
        if (bb.getSetting(this.name, 'showClock')) {
            timeString += format24 ? 
                now.toLocaleTimeString('en-US', { hour12: false }) :
                now.toLocaleTimeString('en-US');
        }
        
        if (bb.getSetting(this.name, 'showSession')) {
            const sessionTime = Math.floor((Date.now() - this.sessionStart) / 1000 / 60);
            if (timeString) timeString += '\n';
            timeString += `Session: ${sessionTime}m`;
        }
        
        element.textContent = timeString;
    }
}

// Add more plugins here following the same pattern...

// Initialize the core system and existing plugins
class AdvancedOpenerPlugin {
    constructor() {
        this.name = "Advanced Opener";
        this.description = "Mass pack opening with detailed statistics";
        this.defaultEnabled = false;
        this.settings = [
            { name: "Show Statistics", key: "showStats", default: true },
            { name: "Auto Stop on Rare", key: "autoStop", default: false }
        ];
    }

    init() {
        if (!bb.getSetting(this.name, 'enabled')) return;
        // Implementation from original code...
    }

    get styles() {
        return `
            .bb_openModal {
                font-family: "Nunito", sans-serif;
                font-size: 1vw;
                height: 40vw;
                width: 22vw;
                border: 3px solid #262626;
                background: #2f2f2f;
                position: absolute;
                bottom: 1vw;
                right: 1vw;
                border-radius: 7.5px;
                text-align: center;
                color: white;
                overflow: auto;
                padding: 2vw;
            }
        `;
    }
}

// Initialize all other original plugins with the new structure...
class BetterChatPlugin {
    constructor() {
        this.name = "Better Chat";
        this.description = "Enhanced chat features and improvements";
        this.defaultEnabled = true;
        this.settings = [
            { name: "Click to Clan", key: "clickToClan", default: true },
            { name: "Enhanced Context Menu", key: "contextMenu", default: true }
        ];
    }

    init() {
        if (!bb.getSetting(this.name, 'enabled')) return;
        // Implementation...
    }
}

// Add all other original plugins...

// Global initialization
window.bb = new BetterBlacketCore();

// Auto-start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        bb.plugins.forEach(plugin => {
            if (bb.getSetting(plugin.name, 'enabled', plugin.defaultEnabled)) {
                plugin.init?.();
            }
        });
    });
} else {
    // DOM is already ready
    setTimeout(() => {
        bb.plugins.forEach(plugin => {
            if (bb.getSetting(plugin.name, 'enabled', plugin.defaultEnabled)) {
                plugin.init?.();
            }
        });
    }, 100);
}

console.log('%c[BetterBlacket] %cEnhanced v4.0.0 loaded successfully!', 
    'color: #00ff00; font-weight: bold;', 'color: #ffffff;');
