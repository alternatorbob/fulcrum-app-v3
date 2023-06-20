import { changeState, states, getState } from "./state.js";
import eventBus from "./EventBus.js";

export class NavBar {
    constructor(switchActiveViewCallback) {
        this.switchActiveView = switchActiveViewCallback;
        this.navBarElement = document.createElement("div");
        this.navBarElement.id = "navbar"; // Set the ID for the navigation bar
        document.querySelector(".photo").appendChild(this.navBarElement); // Append the navigation bar to the document body
        this.updateButtons(); // Update the buttons initially
        this.applyStyles(); // Apply styles within the constructor

        // this.handleEditButtonClick = this.handleEditButtonClick.bind(this);
        this.attachListeners();
    }

    updateButtons() {
        this.navBarElement.innerHTML = ""; // Clear previous buttons
        const currentState = getState();

        switch (currentState) {
            case "detections":
                this.navBarElement.innerHTML = `
                <span id="cancel-button">Cancel</span>
                
                <span id="edit-button">Edit</span>
            `;

                this.attachListeners(currentState);
                break;

            case "result":
                this.navBarElement.innerHTML = `
                    <span id="cancel-button">Cancel</span>
                    <img
                        id="download-button"
                        src="/icons/Download_Button.svg"
                        alt=""
                        style="
                            height: 28px;

                        "
                    />
                    <span id="edit-button">Edit</span>
                `;

                this.attachListeners(currentState);
                break;

            case "edit":
                this.navBarElement.innerHTML = `
                    <span id="cancel-button">Cancel</span>
                    <img
                        id="prompt-button"
                        src="icons/Edit_Prompt.svg"
                        alt=""
                        style="height: 22px"
                    />
                    <img
                        id="regenerate-button"
                        src="icons/Regenerate_Button.svg"
                        alt=""
                        style="height: 28px; margin-top: -2px"
                    />
                    <span id="done-button">Done</span>
                `;

                this.attachListeners(currentState);
                break;
        }
    }

    attachListeners(currentState) {
        switch (currentState) {
            case "result":
                const cancelButton = this.navBarElement
                    .querySelector("#cancel-button")
                    .addEventListener("click", () => {
                        console.log("Cancel button clicked");
                        changeState(states.HOME);
                        this.switchActiveView(); // Trigger the switchActiveView callback
                        this.updateButtons();
                    });

                const downloadButton = this.navBarElement
                    .querySelector("#download-button")
                    .addEventListener("click", () => {
                        console.log("Download button clicked");

                        eventBus.dispatchEvent("downloadResult");
                    });

                const editButton = this.navBarElement
                    .querySelector("#edit-button")
                    .addEventListener("click", () => {
                        console.log("Edit button clicked");
                        // console.log(this.switchActiveView);
                        changeState(states.EDIT);
                        this.switchActiveView(); // Trigger the switchActiveView callback
                        this.updateButtons();

                        // Dispatch the toggleEnable event through the EventBus
                        eventBus.dispatchEvent("toggleEnable");
                    });
                break;

            case "edit":
                const cancelButton2 = this.navBarElement
                    .querySelector("#cancel-button")
                    .addEventListener("click", () => {
                        changeState(states.RESULT);
                        this.switchActiveView();
                        this.updateButtons();
                    });

                const promptButton = this.navBarElement
                    .querySelector("#prompt-button")
                    .addEventListener("click", () => {
                        console.log("Prompt button clicked");
                    });

                const regenerateButton = this.navBarElement
                    .querySelector("#regenerate-button")
                    .addEventListener("click", () => {
                        console.log("Regenerate button clicked");
                        eventBus.dispatchEvent("triggerRegenerate");
                    });

                const doneButton = this.navBarElement
                    .querySelector("#done-button")
                    .addEventListener("click", () => {
                        console.log("Done button clicked");
                        changeState(states.RESULT);
                        this.switchActiveView();
                        this.updateButtons();
                    });

                break;
        }
    }

    disableButton(button, callback) {
        button.css.style.cssText = `opacity: 50%`;

        button.updateButtonState();
    }

    enableButton(button, callback) {
        button.css.style.cssText = `opacity: 100%`;
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

        // this.navBarElement.backgroundColor = "black";

        // Get the buttons inside the navbar
        const buttons = this.navBarElement.querySelectorAll("button");

        // Apply the centering property to the second button
        if (buttons.length >= 2) {
            buttons[1].style.marginLeft = "auto";
            buttons[1].style.marginRight = "auto";
            buttons[1].style.transform = "translateY(-15px)";
        }
    }
}
