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
}

// Create a shared instance of the EventBus
const eventBus = new EventBus();
export default eventBus;
