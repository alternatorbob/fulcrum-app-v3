import { activeObject, imageClick, regenerateFace } from "./drawUtils";
import { onImageUpload } from "./handleImage";
import { moveCanvasLayers, switchView } from "./ui";
import { switchActiveView } from "../main";
import { delay } from "./utils";
import { srcToFile } from "./utils";

export function attachListeners() {

    // const inputElements = document.querySelectorAll('.upload')
    //home
    const inputElements = [document.querySelector("#upload-input"), document.querySelector("#camera-input")];

    inputElements.forEach((inputElement) => {

        inputElement.addEventListener("change", async (event) => {
            const file = event.target.files[0];
            await onImageUpload(file);
        });

    });
    //was like this before, now loader shows on homescreen
    // await onImageUpload(event).then(switchView("detections"));

    // create file object from image
    //  cc  delay(0).then(emulateUpload)
    async function emulateUpload() {
        const file = await srcToFile('./test-images/vertical.jpg', 'image.jpg', 'image/jpeg')
        onImageUpload(file)
    }

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
