import "../css/loader.css";
import { NavBar } from "./NavBar";
import { ButtonComponent } from "./NavBar2";

const buttons = {
    cancel: { type: "span", attribute: "Cancel", callback: "handleCancel" },
    download: {
        type: "img",
        attribute: "/icons/Download_Button.svg",
        callback: "handleDownload",
    },
    edit: { type: "span", attribute: "Edit", callback: "handleEdit" },

    prompt: {
        type: "img",
        attribute: "icons/Edit_Prompt.svg",
        callback: "handlePrompt",
    },
    regenerate: {
        type: "img",
        attribute: "icons/Regenerate_Button.svg",
        callback: "handleRegenerate",
    },
    done: { type: "span", attribute: "Done", callback: "handleDone" },
};

export const addButtonComponents = (navBar) => {
    for (const key in buttons) {
        const btn = new ButtonComponent(
            buttons[key].type,
            buttons[key].attribute,
            buttons[key].callback,
            key
        );

        navBar.addComponent(btn);
    }
};

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

export class SystemMessage {
    constructor(text) {
        this.text = text;
        this.createMessage();
        this.autoHideTimeout = null;
    }

    createMessage() {
        this.message = document.createElement("div");
        this.message.className = "system-message";
        this.message.innerText = this.text;
        document.querySelector("#app").appendChild(this.message);
        this.applyStyles();
        this.hide();
    }

    show() {
        this.message.style.transition = "opacity 5.5s, transform 0.75s";
        this.message.style.opacity = "1";
        this.message.style.transform = "translateY(0)";
    }

    hide() {
        this.message.style.transition = "opacity 0.5s, transform 0.75s";
        this.message.style.opacity = "0";
        this.message.style.transform = "translateY(-30%)";
    }

    showFor(duration) {
        this.show();
        if (this.autoHideTimeout) {
            clearTimeout(this.autoHideTimeout);
        }
        this.autoHideTimeout = setTimeout(() => {
            this.hide();
        }, duration);
    }

    stopAutoHide() {
        if (this.autoHideTimeout) {
            clearTimeout(this.autoHideTimeout);
        }
    }

    calculateWidth() {
        const textLength = this.text.length;
        const averageCharacterWidth = 10; // Assuming an average width of 10 pixels per character
        const minWidth = 120; // Minimum width of the message
        return Math.max(minWidth, textLength * averageCharacterWidth);
    }

    applyStyles() {
        const divWidth = this.calculateWidth();

        this.message.style.position = "fixed";
        this.message.style.top = "60px";
        this.message.style.left = `calc(50% - ${divWidth / 2}px)`;
        this.message.style.zIndex = "9999";
        this.message.style.background = "black";
        this.message.style.height = "40px";
        this.message.style.width = `${this.calculateWidth()}px`;
        this.message.style.color = "white";
        this.message.style.textAlign = "center";
        this.message.style.pointerEvents = "none";
        this.message.style.userSelect = "none";
        this.message.style.borderRadius = "4px";

        // Center text vertically
        this.message.style.display = "flex";
        this.message.style.alignItems = "center";
        this.message.style.justifyContent = "center";
    }
}

export class Loader {
    constructor(text) {
        this.text = text;
        this.loaderElement = null;
    }

    generateHTML() {
        const loaderDiv = document.createElement("div");
        const textNode = document.createTextNode(this.text);
        const textContainer = document.createElement("div");

        for (let i = 0; i < 16; i++) {
            const loaderChild = document.createElement("div");

            loaderDiv.appendChild(loaderChild);
        }

        textContainer.appendChild(textNode);
        loaderDiv.appendChild(textContainer);

        this.loaderElement = loaderDiv;

        loaderDiv.className = "lds-spinner";
        loaderDiv.style.position = "absolute";
        loaderDiv.style.left = `calc(50% - ${39.5}px)`;
        this.loaderElement.style.bottom = "84px";

        // loaderDiv.style.left = "50%";
        loaderDiv.style.zIndex = "1000";

        textContainer.style.position = "absolute";
        textContainer.style.fontSize = "0.8em";
        textContainer.style.zIndex = "1000";
        textContainer.style.pointerEvents = "none";
        textContainer.style.top = "65%";
        textContainer.style.left = "65%";
        textContainer.style.transform = "translate(-50%, -50%)";

        return loaderDiv;
    }

    show() {
        console.log("should show loader");
        if (!this.loaderElement) {
            this.loaderElement = this.generateHTML();
            document.body.appendChild(this.loaderElement);
        }

        document.body.classList.add("loading");

        this.loaderElement.style.opacity = "0";
        this.loaderElement.style.transition = "opacity 0.55s, transform 0.3s";
        this.loaderElement.style.transitionTimingFunction = "ease-in-out";

        this.loaderElement.style.pointerEvents = "none";
        // this.loaderElement.style.position = "fixed";
        // this.loaderElement.style.left = "47.55%";
        // this.loaderElement.style.transform = "translateX(-50%)";

        this.loaderElement.style.opacity = "1";
        this.loaderElement.style.transition = "opacity 0.2s, transform 0.3s";

        // this.loaderElement.style.transitionTimingFunction = "ease-in-out";

        // this.loaderElement.style.transform = "translateY(-10%) scale(1)";
    }

    hide() {
        if (!this.loaderElement) {
            return;
        }

        document.body.classList.remove("loading");

        this.loaderElement.style.opacity = "0";
        // this.loaderElement.style.transform = "translateY(-10%) scale(0.8)";

        setTimeout(() => {
            if (this.loaderElement.parentNode) {
                this.loaderElement.parentNode.removeChild(this.loaderElement);
            }
        }, 300);
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

// window.ScreenOrientation.onchange = function (e) {
//     if (window.screen.orientation.type.includes("landscape")) {
//         document.body.style.backgroundColor = "white";
//     } else if (window.screen.orientation.type.includes("portrait")) {
//         document.body.style.backgroundColor = "black";
//     }
// };

// window.screen.orientation.onchange = function () {
//     if (window.screen.orientation.type.includes("landscape")) {
//         document.body.style.backgroundColor = "blue";
//     } else if (window.screen.orientation.type.includes("portrait")) {
//         document.body.style.backgroundColor = "black";
//     }
// };
