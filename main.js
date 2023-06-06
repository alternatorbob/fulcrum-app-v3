import { attachListeners } from "./js/attachListeners";
import { drawDetectionBox, drawResult } from "./js/drawUtils";
import {
    getDetections,
    processDetections,
    swapFace,
    swapFaceNEW,
} from "./js/faceDetectionSwap";
import { onImageUpload } from "./js/handleImage";
import { Loader, clearInput, moveCanvasLayers, switchView } from "./js/ui";
import { objectModule } from "./js/objectModule";

export let activeView;
// switchActiveView();
attachListeners();

export function switchActiveView(activeView) {
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

            break;

        case "edit":
            console.log(`Current View: ${activeView}`);
            moveCanvasLayers("edit");

            // console.log(hiddenDetectionObjects);

            break;

        case "edit-prompt":
            console.log(`Current View: ${activeView}`);
            break;
    }
}
