import * as faceapi from "face-api.js";
import { CircleAnimation, Loader } from "./ui";
import {
    createMaskCanvas,
    createCanvasLayers,
    adjustDetectionBoxes,
    invertColors,
    updateResult,
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
    const image = await faceapi.bufferToImage(img);
    const imageCanvas = document.querySelector("#image--canvas");
    const { width, height } = imageCanvas;
    const detectionsCanvas = createCanvasLayers(image, width, height);
    const displaySize = { width: width, height: height };

    faceapi.matchDimensions(detectionsCanvas, displaySize);

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

        // points.forEach((point) => {
        //     // console.log(point);
        //     const circleAnimation = new CircleAnimation(point._x, point._y);
        //     circleAnimation.startAnimation();
        // });

        //draws face boxes
        // faceapi.draw.drawDetections(detectionsCanvas, result);
        //draws face landmarks
        // faceapi.draw.drawFaceLandmarks(detectionsCanvas, result, {
        //     drawLines: true,
        // });

        //nose = 27-30-35

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

        /*
        //brow left
        //brow left
        highlightPoints(detectionsCanvas, points[17]);
        highlightPoints(detectionsCanvas, points[21]);

        //brow right
        highlightPoints(detectionsCanvas, points[22]);
        highlightPoints(detectionsCanvas, points[26]);

        //nose top
        highlightPoints(detectionsCanvas, points[27]);
        // highlightPoints(detectionsCanvas, points[35]);

        //left eye outer
        highlightPoints(detectionsCanvas, points[36]);
        //left eye center
        highlightPoints(detectionsCanvas, points[38]);
        
        //righ eye outer
        highlightPoints(detectionsCanvas, points[45]);
        //righ eye middle
        highlightPoints(detectionsCanvas, points[44]);

        //mouth left
        highlightPoints(detectionsCanvas, points[60]);
        //mouth right
        highlightPoints(detectionsCanvas, points[64]);
        //mout middle middle
        highlightPoints(detectionsCanvas, points[66]);
        //mouth middle bottom
        highlightPoints(detectionsCanvas, points[57]);
        */
    });

    const renders = detectionObjects.map(async (object, index) => {
        updateResult();

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

        const loader = new Loader();
        loader.show();

        return await swapFace(canvas, object.mask, myPrompt).then(
            (swappedFace) => {
                object.result = swappedFace;
                updateResult();
                // loader.hide();
            }
        );
    });
}

export async function swapFace(canvas, mask, myPrompt) {
    const canvas64 = canvas.toDataURL();
    let mask64;
    if (mask) {
        mask64 = mask.toDataURL();
    }

    // const output = invertColors(canvas);
    let output;
    let loader = await emulateLoader(10000, 500).then(() => {
        output = invertColors(canvas);
    });

    // const output = applyInvertFilterAndRandomSquares(canvas);

    // const url = await inPaint(canvas64, mask64, myPrompt, (value) => {
    //     const lines = value.split("\n").filter(Boolean);
    //     const lastLine = lines[lines.length - 1];
    //     let number = 0;
    //     if (lastLine) number = Number(lastLine.split("%")[0]);
    //     // console.log("number: ", number);
    //     console.log("value: ", value);
    // });

    // return loadImage(url);
    return output;
}
