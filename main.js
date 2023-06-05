import { attachListeners } from "./js/attachListeners";
import { activeView, moveCanvasLayers } from "./js/ui";
import { hiddenDetectionObjects } from "./js/drawUtils";

export function handleViewChange() {
    switch (activeView) {
        case "home":
            console.log(`Current View: ${activeView}`);
            break;

        case "result":
            console.log(`Current View: ${activeView}`);

            // moveCanvasLayers("result");

            break;

        case "edit":
            console.log(`Current View: ${activeView}`);
            // console.log(hiddenDetectionObjects);

            break;

        case "edit-prompt":
            console.log(`Current View: ${activeView}`);
            break;
    }
}

attachListeners();
