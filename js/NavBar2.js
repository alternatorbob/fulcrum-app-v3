import { changeState, states, getState } from "./state.js";
import eventBus from "./EventBus.js";

// ButtonComponent class
export class ButtonComponent {
    constructor(tagType, attribute, callback, id) {
        this.tagType = tagType;
        this.attribute = attribute;
        this.callback = callback;

        this.wasRendered = false;

        this.element = document.createElement(this.tagType);
        this.element.id = id;

        this.element.addEventListener("click", () => {
            this.publishClick(this.callback);
        });

        this.applyStyles();
    }

    handleClick(callback) {
        console.log(callback);
    }

    publishClick(callback) {
        eventBus.publishString("handleClick", callback);
    }

    show() {
        this.element.classList.remove("hidden");
    }

    hide() {
        this.element.classList.add("hidden");
    }

    enableButton() {
        this.element.css.style.cssText = `opacity: 100%`;
        this.element.addEventListener(
            "click",
            this.publishClick(this.callback)
        );
    }

    disableButton() {
        this.element.css.style.cssText = `opacity: 50%`;
        this.element.removeEventListener(
            "click",
            this.publishClick(this.callBack)
        );
    }

    applyStyles() {
        // this.element.style.cssText = `
        //     display: flex;
        //     flex: 1;
        //     cursor: pointer;

        //     justify-content = center;
        //     alignItems = center;
        //     text-align = center;
        // `;

        this.element.style.display = "flex";
        this.element.style.flex = "1";
        this.element.style.justifyContent = "center";
        this.element.style.alignItems = "center";
        this.element.style.padding = "10px";
        // this.element.style.margin = "5px";
        this.element.style.cursor = "pointer";

        if (this.tagType === "img") {
            // this.element.style.width = "15px";
            this.element.style.height = "28px";
        }
    }

    render() {
        if (this.tagType === "img") {
            this.element.src = this.attribute;
        } else if (this.tagType === "span") {
            this.element.innerHTML = this.attribute;
        } else {
            console.error("Invalid tag type");
            return this.element;
        }

        return this.element;
    }
}

// NavBar class (updated)
export class NavBar2 {
    constructor(switchActiveViewCallback) {
        this.switchActiveView = switchActiveViewCallback;
        this.navBarElement = document.createElement("div");
        this.navBarElement.id = "navbar"; // Set the ID for the navigation bar
        document.querySelector(".photo").appendChild(this.navBarElement); // Append the navigation bar to the document body

        this.applyStyles(); // Apply styles within the constructor

        // this.currentState = currentState;
        this.components = [];
        this.applyStyles();

        eventBus.subscribeString("handleClick", this.handleClick.bind(this));
    }

    addComponent(component) {
        this.components.push(component);
    }

    handleClick(handler) {
        const currentState = getState();

        // console.log("handler", "currentState");
        // console.log(handler, currentState);

        console.log(this.components);

        switch (handler) {
            case "handleCancel":
                break;
            case "handleDownload":
                break;
            case "handleDone":
                break;
            case "handlePrompt":
                break;
            case "handleRegenerate":
                break;
        }

        switch (currentState) {
            case "detections":
                break;
            case "result":
                break;
            case "edit":
                break;
        }
    }

    applyStyles() {
        this.navBarElement.style.display = "flex";
        this.navBarElement.style.justifyContent = "space-between";
        this.navBarElement.style.position = "fixed";
        this.navBarElement.style.bottom = "75px";
        this.navBarElement.style.left = "0";
        this.navBarElement.style.right = "0";
        this.navBarElement.style.margin = "auto";
        this.navBarElement.style.color = "white";
        this.navBarElement.style.padding = "20px";
        this.navBarElement.style.overflow = "hidden"; // Hide overflowing pseudo-element
    }

    render() {
        for (const component of this.components) {
            const id = component.element.id;
            const currentState = getState;

            if (!this.wasRendered) {
                this.navBarElement.appendChild(component.render());
            }

            switch (currentState) {
                case "detections":
                    if (id === "download") {
                        component.show();
                    } else {
                        component.hide();
                    }

                    break;
                case "result":
                    if (id === "download") {
                        component.show();
                    } else {
                        component.hide();
                    }
                    break;
                case "edit":
                    break;
            }
        }

        this.wasRendered = true;

        return this.navBarElement;
    }
}
