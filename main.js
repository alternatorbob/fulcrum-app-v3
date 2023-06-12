import "./css/main.css";
import * as faceapi from "face-api.js";
import { delay, updatePixelRatio } from "./js/utils";
import { Photo } from "./js/internal";
import { NavBar } from "./js/internal";
import { HomePage } from "./js/internal";
import { changeState, states, getState } from "./js/state.js";

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
    faceapi.nets.ageGenderNet.loadFromUri("/models"),
]).then(() => {
    console.log("models were loaded");
    switchActiveView();
});

const app = document.querySelector("#app");
const homePage = new HomePage();
homePage.createDivs();

const photoApp = new Photo(app);
const navBar = new NavBar(switchActiveView);

const photoDiv = document.querySelector(".photo");
const homeDiv = document.querySelector(".home");

updatePixelRatio();

export async function switchActiveView(activeState = getState()) {
    switch (activeState) {
        case "home":
            console.log(`Current View: ${activeState}`);
            homeDiv.style.display = "flex";
            photoDiv.classList.add("hidden");

            // await delay(3000);
            changeState(states.DETECTIONS);
            switchActiveView();

            break;

        case "detections":
            console.log(`Current View: ${activeState}`);
            photoDiv.classList.remove("hidden");
            homeDiv.style.display = "none";

            photoApp.getFaces("./vertical.jpg").then(async () => {
                // await delay(2000);
                changeState(states.RESULT);
                switchActiveView();

                // photoApp.setEditMode(getState());
            });
            break;

        case "result":
            console.log(`Current View: ${activeState}`);
            navBar.updateButtons();

            break;

        case "edit":
            console.log(`Current View: ${activeState}`);

            break;

        case "edit-prompt":
            console.log(`Current View: ${activeState}`);

            break;
    }
}
