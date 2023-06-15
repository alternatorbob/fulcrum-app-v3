import "./css/main.css";
import * as faceapi from "face-api.js";
import { delay, updatePixelRatio } from "./js/utils";
import { Photo } from "./js/internal";
import { NavBar } from "./js/internal";
import { HomePage } from "./js/internal";
import { changeState, states, getState } from "./js/state.js";
import { Popup } from "./js/Components/Popup";
import { IntroTransition } from "./js/Components/IntroTransition";

updatePixelRatio();

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
    faceapi.nets.ageGenderNet.loadFromUri("/models"),
]).then(() => {
    console.log("models were loaded");
    homePage.createDivs();
    switchActiveView();
});

const app = document.querySelector("#app");
const homePage = new HomePage(switchActiveView);

console.log("createDivs");

const photoApp = new Photo(app);
const navBar = new NavBar(switchActiveView);

// const popup = new FullscreenPopup(switchActiveView);
// popup.open();

export async function switchActiveView(activeState = getState()) {
    const photoDiv = document.querySelector(".photo");
    const homeDiv = document.querySelector(".home");
    
    switch (activeState) {
        case "home":
            console.log(`Current View: ${activeState}`);
            homeDiv.style.display = "flex";
            photoDiv.classList.add("hidden");

            // await delay(3000);
            // changeState(states.DETECTIONS);
            // switchActiveView();

            break;

        case "detections":
            console.log(`Current View: ${activeState}`);
            photoDiv.classList.remove("hidden");
            homeDiv.style.display = "none";

            // await photoApp.getFaces("./vertical.jpg");
            changeState(states.RESULT);
            switchActiveView();
            break;

        case "result":
            console.log(`Current View: ${activeState}`);
            // await photoApp.swapFaces();

            photoApp.setEditMode(false);
            //call faceSwap api
            navBar.updateButtons();

            break;

        case "edit":
            console.log(`Current View: ${activeState}`);
            photoApp.setEditMode(true);

            break;

        case "edit-prompt":
            console.log(`Current View: ${activeState}`);

            break;
    }
}
