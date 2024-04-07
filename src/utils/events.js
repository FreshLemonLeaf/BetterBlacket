/*
    Full credit is attributed to @zastlx on Github & @notzastix on Discord.
    Thank you for the help on BetterBlacket <3
*/

class EventManager {
    #_subscriptions = new Map();

    subscribe = (event, callback) => {
        console.log(`Subscribed to event '${event}'.`);
        if (typeof callback !== 'function') return console.warn('EventManager: Event callback must be a function.');
        if (!this.#_subscriptions.has(event)) this.#_subscriptions.set(event, new Set());
        this.#_subscriptions.get(event).add(callback);
    };

    dispatch = (event, payload) => {
        console.log(`Dispatching event '${event}'.`);
        if (this.#_subscriptions.has(event)) this.#_subscriptions.get(event).forEach(callback => callback(payload));
        else console.warn(`EventManager: Event '${event}' does not exist.`);
    };
};

const eventManager = new EventManager();
export default eventManager;