import "./main.css";
import { delay } from "../js/utils";
import { Photo } from "./js/photo";
import { changeState, states, getState } from "./js/state.js";
import { updatePixelRatio } from "./js/updatePixelRatio";

const app = document.querySelector("#app");
updatePixelRatio();

switchActiveView();

export async function switchActiveView(activeView = getState()) {
    switch (activeView) {
        case "home":
            console.log(`Current View: ${activeView}`);
            await delay(3000);
            changeState(states.DETECTIONS);
            switchActiveView();
            break;

        case "detections":
            console.log(`Current View: ${activeView}`);
            const photoApp = new Photo(app);
            photoApp.getFaces("./vertical.jpg").then(async () => {
                await delay(2000);
                changeState(states.RESULT);
                switchActiveView();

                // photoApp.setEditMode(getState());
            });

        case "result":
            console.log(`Current View: ${activeView}`);

            break;

        case "edit":
            console.log(`Current View: ${activeView}`);

            break;

        case "edit-prompt":
            console.log(`Current View: ${activeView}`);

            break;
    }
}
