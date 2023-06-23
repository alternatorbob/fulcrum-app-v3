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
         

            case "result":
                this.navBarElement.innerHTML = `
                    <span id="cancel-button">Cancel</span>
                    
                    <img
                        id="download-button"
                        src="/icons/Download_Button.svg"
                        alt=""
                        style="
                            height: 36px; overflow: visible; 
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
                        id="regenerate-button"
                        class="button-disabled"
                        src="icons/Regenerate_Button.svg"
                        alt=""
                        style="height: 36px; overflow: visible; "
                        />
                    <span class="button-disabled" id="done-button">Done</span>
                `;

                this.attachListeners(currentState);
                break;

            case "edit-selected":
                this.navBarElement.innerHTML = `
                <span id="cancel-button">Cancel</span>
                
                <img
                    id="regenerate-button"
                    src="icons/Regenerate_Button.svg"
                    alt=""
                    style="height: 36px; overflow: visible; "
                />
                <span class="button-disabled" id="done-button">Done</span>
            `;
                this.attachListeners(currentState);
                break;

            case "regenerated":
                this.navBarElement.innerHTML = `
                <span id="cancel-button">Cancel</span>
                
                <img
                    id="regenerate-button"
                    src="icons/Regenerate_Button.svg"
                    alt=""
                    style="height: 36px; overflow: visible; "
                />
                <span id="done-button">Done</span>
            `;
                this.attachListeners(currentState);
                break;
        }
    }

    attachListeners(currentState) {
        switch (currentState) {
            case "detections":
                const cancelButton0 = this.navBarElement
                    .querySelector("#cancel-button")
                    .addEventListener("click", () => {
                        console.log("Cancel button clicked");
                        changeState(states.HOME);
                        this.switchActiveView(); // Trigger the switchActiveView callback
                        this.updateButtons();
                    });
                break;

            case "result":
                const cancelButton1 = this.navBarElement
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
                        eventBus.dispatchEvent("storeResults");
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

                // const promptButton = this.navBarElement
                //     .querySelector("#prompt-button")
                //     .addEventListener("click", () => {
                //         console.log("Prompt button clicked");
                //     });

                break;

            case "edit-selected":
                const cancelButton3 = this.navBarElement
                    .querySelector("#cancel-button")
                    .addEventListener("click", () => {
                        changeState(states.EDIT);
                        this.switchActiveView();
                        this.updateButtons();
                    });

                const regenerateButton = this.navBarElement
                    .querySelector("#regenerate-button")
                    .addEventListener("click", () => {
                        console.log("Regenerate button clicked");
                        changeState(states.REGENERATED);

                        

                        this.switchActiveView();
                        this.updateButtons();

                        eventBus.dispatchEvent("triggerRegenerate");
                    });

                break;

            case "regenerated":
                const cancelButton4 = this.navBarElement
                    .querySelector("#cancel-button")
                    .addEventListener("click", () => {
                        changeState(states.RESULT);
                        this.switchActiveView();
                        this.updateButtons();

                        eventBus.publish("setEditMode", false);
                        eventBus.dispatchEvent("restoreFaces");
                    });

                const regenerateButton2 = this.navBarElement
                    .querySelector("#regenerate-button")
                    .addEventListener("click", () => {
                        console.log("Regenerate button clicked");
                        // changeState(states.REGENERATED);

                        this.switchActiveView();
                        this.updateButtons();

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
        const elem = this.navBarElement;
        elem.style.overflow = "visible";
        elem.style.display = "flex";
        // elem.style.justifyContent = "space-between";
        elem.style.position = "fixed";
        elem.style.bottom = "75px";
        elem.style.left = "0";
        elem.style.height = '36px'
        elem.style.right = "0";
        elem.style.margin = "auto";
        elem.style.color = "white";
        elem.style.padding = "20px";
        elem.style.overflow = "hidden"; // Hide overflowing pseudo-element
    }
}

//prompt button in case
/*
<img
                        id="prompt-button"
                        src="icons/Edit_Prompt.svg"
                        alt=""
                        style="height: 22px"
                    />

                    */
