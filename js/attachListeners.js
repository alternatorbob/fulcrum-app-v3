import { activeObject, imageClick, regenerateFace } from "./drawUtils";
import { onImageUpload } from "./handleImage";
import { moveCanvasLayers, switchView } from "./ui";
import { switchActiveView } from "../main";

export function attachListeners() {
    //home
    const inputElement = document.querySelector("#camera-input");
    inputElement.addEventListener("change", async (event) => {
        //was like this before, now loader shows on homescreen
        // await onImageUpload(event).then(switchView("detections"));

        await onImageUpload(event);
    });

    // const imageCanvas = document.querySelector("#image--canvas");
    // imageCanvas.addEventListener("click", imageClick());

    //result
    const editButton = document.querySelector("#edit-button");
    // const backButton = document.querySelector("#back-button");

    editButton.addEventListener("click", () => {
        switchActiveView("edit");
    });

    // backButton.addEventListener("click", () => {
    //     switchActiveView("home");
    // });

    // const downloadButton = document.querySelector("#download-button");
    // downloadButton.addEventListener("click", () => {
    //     switchActiveView("home");
    // });

    // const cancelButtons = document.querySelectorAll(".cancel-button");
    // cancelButtons.forEach((button) => {
    //     button.addEventListener("click", () => {
    //         switch (activeView) {
    //             case "result":
    //                 switchView("home");
    //                 break;

    //             case "edit":
    //                 switchView("result");
    //                 moveCanvasLayers("result");
    //                 break;
    //             case "edit-prompt":
    //                 switchView("edit");
    //                 break;
    //         }
    //     });
    // });

    const doneButtons = document.querySelectorAll(".done-button");
    doneButtons.forEach((button) => {
        button.addEventListener("click", () => {
            switch (activeView) {
                case "result":
                    switchActiveView("home");
                    break;

                case "edit":
                    switchActiveView("result");
                    break;

                case "edit-prompt":
                    switchActiveView("edit");
                    break;
            }
        });
    });

    //edit
    // const popupContainer = document.querySelector(".popup-container");
    // const promptButton = document.querySelector("#prompt-button");
    // const regenerateButton = document.querySelector("#regenerate-button");

    // promptButton.addEventListener("click", async () => {
    //     popupContainer.classList.add("active");
    //     // activeView = "edit-prompt";
    //     switchView("edit-prompt");
    //     handleViewChange();
    // });

    // regenerateButton.addEventListener("click", () => {
    //     regenerateFace(activeObject);
    // });
}
