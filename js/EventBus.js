class EventBus {
    constructor() {
        this.eventListeners = {};
    }

    addEventListener(eventName, listener) {
        if (!this.eventListeners[eventName]) {
            this.eventListeners[eventName] = [];
        }
        this.eventListeners[eventName].push(listener);
    }

    removeEventListener(eventName, listener) {
        const listeners = this.eventListeners[eventName];
        if (listeners) {
            this.eventListeners[eventName] = listeners.filter(
                (l) => l !== listener
            );
        }
    }

    dispatchEvent(eventName, data) {
        const listeners = this.eventListeners[eventName];
        if (listeners) {
            listeners.forEach((listener) => listener(data));
        }
    }

    subscribe(eventType, handler) {
        if (!this.eventListeners[eventType]) {
            this.eventListeners[eventType] = [];
        }
        this.eventListeners[eventType].push(handler);
    }

    publish(eventType, data) {
        if (!this.eventListeners[eventType]) {
            return;
        }
        this.eventListeners[eventType].forEach((handler) => handler(data));
    }

    publishString(eventName, string) {
        if (!this.eventListeners[eventName]) {
            return;
        }

        this.eventListeners[eventName].forEach((handler) => {
            handler(string);
        });
    }

    subscribeString(eventType, handler) {
        if (!this.eventListeners[eventType]) {
            this.eventListeners[eventType] = [];
        }

        const wrappedHandler = (data) => {
            handler(data);
        };

        this.eventListeners[eventType].push(wrappedHandler);
    }
}

// Create a shared instance of the EventBus
const eventBus = new EventBus();
export default eventBus;
