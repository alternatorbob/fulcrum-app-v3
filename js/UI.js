import { NavBar } from "./NavBar";

export function createViews(states) {
    const appContainer = document.querySelector("#app");
    let isFirst = true; // Variable to track the first div

    for (let key in states) {
        const myDiv = document.createElement("div");
        myDiv.id = `${states[key]}`;
        if (!isFirst) {
            myDiv.classList.add("hidden"); // Add "hidden" class to all except the first div
        }
        isFirst = false; // Update the flag after the first div
        appContainer.appendChild(myDiv);
    }
}

export class FullscreenPopup {
    constructor(switchActiveView) {
        this.switchActiveView = switchActiveView;
        this.navBar = new NavBar(switchActiveView);
        this.popup = document.createElement("div");
        this.textContainer = document.createElement("div");
        this.textArea = document.createElement("textarea");

        this.initialize();
    }

    initialize() {
        this.popup.style.position = "fixed";
        this.popup.style.left = "0";
        this.popup.style.top = "0";
        this.popup.style.width = "100%";
        this.popup.style.height = "100%";
        this.popup.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        this.popup.style.display = "none";
        this.popup.style.zIndex = "9999";
        this.popup.style.transition = "transform 0.3s ease-in-out";
        this.popup.style.transform = "translateY(100%)";

        this.textContainer.style.position = "absolute";
        this.textContainer.style.left = "0";
        this.textContainer.style.top = "0";
        this.textContainer.style.width = "100%";
        this.textContainer.style.height = "80%";
        this.textContainer.style.display = "flex";
        this.textContainer.style.alignItems = "center";
        this.textContainer.style.justifyContent = "center";

        this.textArea.style.width = "80%";
        this.textArea.style.height = "80%";
        this.textArea.value =
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

        this.popup.appendChild(this.navBar.element);
        this.textContainer.appendChild(this.textArea);
        this.popup.appendChild(this.textContainer);
        document.body.appendChild(this.popup);
    }

    open() {
        this.popup.style.display = "block";
        setTimeout(() => {
            this.popup.style.transform = "translateY(0)";
        }, 100);
    }

    close() {
        this.popup.style.transform = "translateY(100%)";
        setTimeout(() => {
            this.popup.style.display = "none";
        }, 300);
    }
}

export class Loader {
    constructor(text) {
        this.text = text;
        this.loaderElement = null;
    }

    generateHTML() {
        const loaderDiv = document.createElement("div");
        loaderDiv.className = "lds-spinner";

        for (let i = 0; i < 16; i++) {
            const loaderChild = document.createElement("div");
            loaderDiv.appendChild(loaderChild);
        }

        const textNode = document.createTextNode(this.text);
        const textContainer = document.createElement("div");

        textContainer.style.position = "absolute";
        textContainer.style.zIndes = "1000";
        textContainer.style.pointerEvents = "none";
        textContainer.style.top = "65%";
        textContainer.style.left = "65%";
        textContainer.style.transform = "translate(-50%, -50%)";

        textContainer.appendChild(textNode);
        loaderDiv.appendChild(textContainer);

        this.loaderElement = loaderDiv;

        return loaderDiv;
    }

    show() {
        console.log("should show loader");
        if (!this.loaderElement) {
            this.loaderElement = this.generateHTML();
            document.body.appendChild(this.loaderElement);
        }

        this.loaderElement.style.fontSize = "10px";
        this.loaderElement.style.opacity = "0";
        this.loaderElement.style.transform = "scale(0.6)";
        this.loaderElement.style.transition = "opacity 0.3s, transform 0.3s";
        this.loaderElement.style.pointerEvents = "none";
        this.loaderElement.style.position = "fixed";
        this.loaderElement.style.bottom = "80px";
        this.loaderElement.style.left = "47.55%";
        this.loaderElement.style.transform = "translateX(-50%) scale(0.6)";

        setTimeout(() => {
            this.loaderElement.style.opacity = "1";
            this.loaderElement.style.transform = "translateX(-50%) scale(1)";
        }, 10);
    }

    hide() {
        if (!this.loaderElement) {
            return;
        }

        this.loaderElement.style.opacity = "0";
        this.loaderElement.style.transform = "translateX(-50%) scale(0.6)";

        setTimeout(() => {
            if (this.loaderElement.parentNode) {
                this.loaderElement.parentNode.removeChild(this.loaderElement);
            }
        }, 300);
    }
}

export class IntroTransition {
    constructor() {
        this.logoDiv = document.getElementsByClassName("logo"); // Replace 'logo' with the ID of your logo div
        this.fadeDivId = "fade"; // ID of the fade div
        this.fadeDiv = null;

        this.accelerometerSupported = false;
        this.accelerationListener = null;
        this.transitionTimeout = null;

        this.init();
    }

    init() {
        if (
            typeof DeviceMotionEvent !== "undefined" &&
            typeof DeviceMotionEvent.requestPermission === "function"
        ) {
            DeviceMotionEvent.requestPermission().then((permissionState) => {
                if (permissionState === "granted") {
                    this.accelerometerSupported = true;
                    this.addAccelerometerListener();
                }
            });
        } else if (window.DeviceMotionEvent) {
            this.accelerometerSupported = true;
            this.addAccelerometerListener();
        }

        this.addAccelerometerListener();

        // Add an event listener to detect touch or mouse click
        document.addEventListener("click", this.startTransition.bind(this));
        document.addEventListener(
            "touchstart",
            this.startTransition.bind(this)
        );

        // // Create the fade div
        this.createFadeDiv();
    }

    createFadeDiv() {
        this.fadeDiv = document.createElement("div");
        this.fadeDiv.id = this.fadeDivId;
        document.body.appendChild(this.fadeDiv);
    }

    addAccelerometerListener() {
        this.accelerationListener = (event) => {
            const acceleration = event.accelerationIncludingGravity;

            // Calculate the total acceleration vector
            const accelerationMagnitude = Math.sqrt(
                acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2
            );

            // If the total acceleration exceeds the threshold, start the transition
            if (accelerationMagnitude > 1.5) {
                this.startTransition();
            }
        };

        window.addEventListener("devicemotion", this.accelerationListener);
    }

    removeAccelerometerListener() {
        if (this.accelerationListener) {
            window.removeEventListener(
                "devicemotion",
                this.accelerationListener
            );
            this.accelerationListener = null;
        }
    }

    startTransition() {
        // Remove the accelerometer listener and clear the transition timeout
        this.removeAccelerometerListener();
        clearTimeout(this.transitionTimeout);

        // Move the logo div to the top
        this.logoDiv.style.top = "0";

        // Fade out the logo and fade div
        this.logoDiv.style.opacity = "0";
        this.fadeDiv.style.opacity = "0";

        // Uncover the rest of the elements by fading in the fade div
        setTimeout(() => {
            this.fadeDiv.style.display = "none";
        }, 1000);
    }
}
