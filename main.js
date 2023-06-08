import { objectModule, viewModule } from "./js/objectModule";
import { attachListeners } from "./js/attachListeners";
import {
    drawDetectionBox,
    drawResult,
    imageClick,
    toggleVisibility,
    updateVisibility,
    wasDetectionClicked,
} from "./js/drawUtils";
import {
    getDetections,
    processDetections,
    swapFace,
    swapFaceNEW,
} from "./js/faceDetectionSwap";
import { onImageUpload } from "./js/handleImage";
import { Loader, clearInput, moveCanvasLayers, switchView } from "./js/ui";

// export let activeView = viewModule.setValue("home");
export let activeView = "home";
let imageCanvas;
attachListeners();
switchActiveView("home");

export async function switchActiveView(activeView) {
    switchView(activeView);

    let detectionObjects = objectModule.getObjectValue();
    switch (activeView) {
        case "home":
            console.log(`Current View: ${activeView}`);
            clearInput("camera-input");
            objectModule.setObjectValue("");
            //clearCanvases
            break;

        case "detections":
            console.log(`Current View: ${activeView}`);
            detectionObjects.forEach(async (object) => {
                await drawDetectionBox(object);
            });

            switchActiveView("result");
            break;

        case "result":
            console.log(`Current View: ${activeView}`);
            moveCanvasLayers("result");

            detectionObjects.forEach(async (object) => {
                processDetections(object);
                object.result = await swapFaceNEW(object);
                drawResult(object);
            });

            /*
            // let val = wasDetectionClicked(e, activeView);
            // if (val.wasClicked) {
            //     updateVisibility(val.id, activeView);
            //     // toggleVisibility(val.id);
            //     // console.log(updateShowingValue(val.wasClicked, val.id));
            // }

            // const resultCanvases = document.querySelectorAll(".result-canvas");
            // resultCanvases.forEach((canvas) => {
            //     console.log(canvas);
            //     canvas.addEventListener("click", () => {
            //         console.log("clickity click");
            //     });
            // });
            */
            break;

        case "edit":
            console.log(`Current View: ${activeView}`);
            moveCanvasLayers("edit");
            // imageCanvas.removeEventListener("click", imageClick(activeView));

            // detectionObjects.forEach((object) => {
            //     let { detection, result } = object.isShowing;
            //     console.log("detection", detection);
            //     console.log("result", result);
            //     // detection = false;
            //     toggleVisibility(object.id, detection, result);
            // });

            // console.log(hiddenDetectionObjects);

            break;

        case "edit-prompt":
            console.log(`Current View: ${activeView}`);
            break;
    }
}
