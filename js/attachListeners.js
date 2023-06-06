import { activeObject, regenerateFace } from "./drawUtils";
import { onImageUpload } from "./handleImage";
import { activeView, switchView, moveCanvasLayers } from "./ui";

export function attachListeners() {
    //home
    const inputElement = document.querySelector("#camera-input");
    inputElement.addEventListener("change", async (event) => {
        // imageResult = await handleImageUpload(event);
        await onImageUpload(event).then(switchView("detections", true));
    });

    /*
    //result
    const editButton = document.querySelector("#edit-button");
    const backButton = document.querySelector("#back-button");

    editButton.addEventListener("click", () => {
        switchView("edit");
        updateResult();
        moveCanvasLayers("edit");
    });

    backButton.addEventListener("click", () => {
        switchView("home");
    });

    const downloadButton = document.querySelector("#download-button");
    downloadButton.addEventListener("click", () => {
        switchView("home");
    });

    const cancelButtons = document.querySelectorAll(".cancel-button");
    cancelButtons.forEach((button) => {
        button.addEventListener("click", () => {
            switch (activeView) {
                case "result":
                    switchView("home");
                    break;

                case "edit":
                    switchView("result");
                    moveCanvasLayers("result");
                    break;
                case "edit-prompt":
                    switchView("edit");
                    break;
            }
        });
    });
    const doneButtons = document.querySelectorAll(".done-button");
    doneButtons.forEach((button) => {
        button.addEventListener("click", () => {
            switch (activeView) {
                case "result":
                    switchView("home");
                    break;

                case "edit":
                    switchView("result");
                    moveCanvasLayers("result");
                    updateResult();
                    break;

                case "edit-prompt":
                    switchView("edit");
                    break;
            }
        });
    });

    //edit
    const popupContainer = document.querySelector(".popup-container");
    const promptButton = document.querySelector("#prompt-button");
    const regenerateButton = document.querySelector("#regenerate-button");

    promptButton.addEventListener("click", async () => {
        popupContainer.classList.add("active");
        // activeView = "edit-prompt";
        switchView("edit-prompt");
        handleViewChange();
    });

    regenerateButton.addEventListener("click", () => {
        regenerateFace(activeObject);
    });
    */
}
