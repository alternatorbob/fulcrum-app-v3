import "./css/main.css";
import * as faceapi from "face-api.js";
import { delay, updatePixelRatio } from "./js/utils";
import { Photo, NavBar, HomePage } from "./js/internal";
import { changeState, states, getState } from "./js/state.js";
import {
    FullscreenPopup,
    IntroTransition,
    addButtonComponents,
    SystemMessage,
} from "./js/UI";
import { NavBar2 } from "./js/NavBar2";

const loadModel = () => {
    return Promise.all([
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
        faceapi.nets.ageGenderNet.loadFromUri("/models"),
        faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    ]);
};

let homePage, photoApp, navBar;

const setupViews = () => {
    const app = document.querySelector("#app");

    homePage = new HomePage(switchActiveView);
    photoApp = new Photo(app, switchActiveView);
    navBar = new NavBar(switchActiveView);

    // addButtonComponents(navBar);
    // navBar.render();
};

const initializeApp = async () => {
    updatePixelRatio();

    await loadModel();
    console.log("models were loaded");

    setupViews();
    homePage.createDivs();
    switchActiveView();
};

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

            photoApp.clearAll();

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
            // const message = new SystemMessage("Tap a face to revert");
            // message.showFor(750);

            photoApp.setEditMode(false);
            // navBar.render();

            //call faceSwap api
            navBar.updateButtons();

            break;

        case "edit":
            console.log(`Current View: ${activeState}`);
            photoApp.setEditMode(true);

            const message = new SystemMessage("tap a face to edit");
            message.showFor(3000);

            break;

        case "edit-prompt":
            console.log(`Current View: ${activeState}`);

            break;
    }
}

initializeApp();
