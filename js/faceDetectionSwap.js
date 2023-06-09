import * as faceapi from "face-api.js";
import { CircleAnimation, Loader, switchView } from "./ui";
import {
    createMaskCanvas,
    createCanvasLayers,
    adjustDetectionBoxes,
    invertColors,
    applyInvertFilterAndRandomSquares,
} from "./drawUtils";
import {
    cropCanvas,
    appendElem,
    delay,
    resizeCanvas,
    loadImage,
    emulateLoader,
} from "./utils";
import { inPaint } from "./replicate";
import { getPrompt } from "./getPrompt";
import { switchActiveView } from "../main";

import { objectModule } from "./objectModule";

import config from "../config";

let imageCanvas;
export let detectionObjects = [];

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
    faceapi.nets.ageGenderNet.loadFromUri("/models"),
]).then(start);

function start() {
    console.log("models were loaded");
}

export async function getDetections(img) {
    console.log(img);
    const image = await faceapi.bufferToImage(img);
    imageCanvas = document.querySelector("#image--canvas");
    const { width, height } = imageCanvas;
    // const detectionsCanvas = createCanvasLayers(image, width, height);
    const displaySize = { width: width, height: height };

    // faceapi.matchDimensions(imageCanvas, displaySize);

    let detections = await faceapi
        .detectAllFaces(image)
        .withFaceLandmarks()
        .withAgeAndGender();

    detections = detections.filter(({ detection }) => {
        return detection._score > 0.6;
    });

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    resizedDetections.forEach(async (result, index) => {
        const { _x, _y, _width, _height } = result.detection.box;
        const box = result.detection.box;
        const points = result.landmarks.positions;

        const mask = createMaskCanvas(image, width, height, points, index);

        detectionObjects.push({
            image: cropCanvas(imageCanvas, _x, _y, _width, _height),
            detectionBox: adjustDetectionBoxes(box)[0],
            squareBox: adjustDetectionBoxes(box)[1],
            mask: mask,
            points: points,
            gender: result.gender,
            age: result.age,
            isShowing: { detection: true, result: true },
            id: index,
        });
    });

    objectModule.setValue(detectionObjects);
}

export function processDetections(object) {
    const size = 512;
    const { _x, _y, _width, _height } = object.squareBox;
    const canvas = resizeCanvas(
        cropCanvas(imageCanvas, _x, _y, _width, _height),
        size,
        size
    );

    object.canvas = canvas;
    object.mask = resizeCanvas(
        cropCanvas(object.mask, _x, _y, _width, _height),
        size,
        size
    );

    const promptDetails = { gender: object.gender, age: object.age };
    let myPrompt = getPrompt(promptDetails);
    object.myPrompt = myPrompt;
}

// const renders = detectionObjects.map(async (object, index) => {
//     const size = 512;
//     const { _x, _y, _width, _height } = object.squareBox;
//     const canvas = resizeCanvas(
//         cropCanvas(imageCanvas, _x, _y, _width, _height),
//         size,
//         size
//     );

//     object.canvas = canvas;
//     object.mask = resizeCanvas(
//         cropCanvas(object.mask, _x, _y, _width, _height),
//         size,
//         size
//     );

//     const promptDetails = { gender: object.gender, age: object.age };
//     let myPrompt = getPrompt(promptDetails);
//     object.myPrompt = myPrompt;

//     return await swapFace(canvas, object.mask, myPrompt).then((swappedFace) => {
//         object.result = swappedFace;
//         updateResult();
//         // loader.hide();
//     });
// });

export async function swapFaceNEW(object) {
    const loader = new Loader("swapping");
    loader.show();

    const { canvas, mask } = object;

    let output;
    let myLoader = await emulateLoader(10, 500).then(() => {
        output = invertColors(canvas);
    });

    loader.hide();

    return output;
}

export async function swapFace(canvas, mask, myPrompt) {
    const canvas64 = canvas.toDataURL();
    let mask64;
    if (mask) {
        mask64 = mask.toDataURL();
    }

    // const output = invertColors(canvas);

    console.log(emulateLoader, config.simulate);
    if (config.simulate) {

        await emulateLoader(100, 500)
        const output = invertColors(canvas);
        return output;

    } else {

        const output = applyInvertFilterAndRandomSquares(canvas);
        const url = await inPaint(canvas64, mask64, myPrompt, (value) => {
            const lines = value.split("\n").filter(Boolean);
            const lastLine = lines[lines.length - 1];
            let number = 0;
            if (lastLine) number = Number(lastLine.split("%")[0]);
            // console.log("number: ", number);
            console.log("value: ", value);
        });

        return loadImage(url);
    }

}
