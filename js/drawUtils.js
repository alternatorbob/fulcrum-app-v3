import * as faceapi from "face-api.js";
import {
    pushValues,
    distanceBetweenPoints,
    isInArray,
    removeFromArray,
} from "./utils";
import { detectionObjects, swapFace } from "./faceDetectionSwap";

import { activeView } from "./ui";
// let pointIndexes = pushValues(17, 26).concat([
//     45, 64, 55, 56, 57, 58, 59, 60, 36, 17,
// ]);
let pointIndexes = pushValues(17, 26).concat([64, 55, 56, 57, 58, 59, 60, 17]);
let resultCanvas, detectionsCanvas;
export let activeObject;
export let hiddenDetectionObjects = [];

function clearCanvas(canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function updateResult(clear = false, regenerate = false) {
    console.log("updateResult");
    const resCtx = resultCanvas.getContext("2d");
    const detCtx = detectionsCanvas.getContext("2d");

    resCtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
    detCtx.clearRect(0, 0, detectionsCanvas.width, detectionsCanvas.height);

    if (clear) return;

    detectionObjects.forEach((object) => {
        if (activeView == "result") {
            if (
                !object.isShowing.detection &&
                !object.isShowing.result &&
                !isInArray(hiddenDetectionObjects, object.id)
            ) {
                hiddenDetectionObjects.push(object);
            }

            if (object.isShowing.detection) {
                drawDetectionBox(object);

                if (object.result !== undefined) {
                    drawResult(object);
                }
            }
        } else if (activeView == "edit") {
            if (!object.isShowing.detection && !object.isShowing.result) return;

            drawResult(object);
            detCtx.clearRect(
                0,
                0,
                detectionsCanvas.width,
                detectionsCanvas.height
            );

            if (!object.isShowing.detection) {
                drawDetectionBox(object);
                object.isShowing.detection = true;
            }
        }
    });
}

function drawDetectionBox(object) {
    let { _x, _y, _width, _height } = object.detectionBox;
    const ctx = detectionsCanvas.getContext("2d");
    let img = new Image();

    img.onload = () => {
        ctx.drawImage(img, _x, _y, _width, _height);
    };

    img.src = "icons/fulcrum_frame.svg";
}

export function drawResult(object) {
    const { _x, _y, _width, _height } = object.squareBox;
    const ctx = resultCanvas.getContext("2d");

    ctx.drawImage(object.result, _x, _y, _width, _height);
}

function wasDetectionClicked(e) {
    if (!detectionObjects || detectionObjects.length === 0) {
        return;
    }

    detectionObjects.forEach((object, index) => {
        const { _x, _y, _width, _height } = object.detectionBox;
        if (
            e.offsetX > _x &&
            e.offsetX < _x + _width &&
            e.offsetY > _y &&
            e.offsetY < _y + _height
        ) {
            if (activeView == "result") {
                if (isInArray(hiddenDetectionObjects, object.id))
                    removeFromArray(hiddenDetectionObjects, object.id);
                object.isShowing.detection = !object.isShowing.detection;
                object.isShowing.result = !object.isShowing.result;
                //if it is in the hiddenDecteionObjects array we remove it

                updateResult();
            } else if (
                activeView == "edit" &&
                !isInArray(hiddenDetectionObjects, object.id)
            ) {
                //check if obj
                console.log(object.id);
                object.isShowing.detection = !object.isShowing.detection;
                updateResult();
            }
            // console.log("TOUCH BOX");
            activeObject = detectionObjects[object.id];
            // console.log(activeObject);
            return true;
        }
    });

    return false;
}

export async function regenerateFace(object) {
    const { canvas, mask, myPrompt } = object;
    let swappedFace = await swapFace(canvas, mask, myPrompt).then(
        (swappedFace) => {
            object.result = swappedFace;
            updateResult();
        }
    );
}

export function createCanvasLayers(image, width, height) {
    const container = document.querySelector("#photo--input--container");

    resultCanvas = faceapi.createCanvasFromMedia(image);
    resultCanvas.classList.add("result-layer");
    resultCanvas.id = "result--canvas";
    const resCtx = resultCanvas.getContext("2d");
    resCtx.clearRect(0, 0, width, height);

    detectionsCanvas = faceapi.createCanvasFromMedia(image);
    detectionsCanvas.classList.add("result-layer");
    detectionsCanvas.id = "detections--canvas";
    detectionsCanvas.addEventListener("click", (e) => wasDetectionClicked(e));

    resultCanvas.width = width;
    resultCanvas.height = height;
    detectionsCanvas.width = width;
    detectionsCanvas.height = height;

    container.append(resultCanvas, detectionsCanvas);

    return detectionsCanvas;
}

export function adjustDetectionBoxes(box) {
    const scaleFactor = 1.5;
    let detectionBox = { ...box };
    let squareBox = { ...box };

    detectionBox._x -= detectionBox._width / (scaleFactor * 2.66);
    detectionBox._y -= (detectionBox._width / (scaleFactor * 2.66)) * 1.4;
    detectionBox._width *= scaleFactor;
    detectionBox._height *= scaleFactor;

    //squareBox
    squareBox._x -= squareBox._width / 3;
    squareBox._y -= squareBox._width / 4;

    squareBox._width > squareBox._height
        ? (squareBox._height = squareBox._width)
        : (squareBox._width = squareBox._height);

    squareBox._width *= 1.3;
    squareBox._height *= 1.3;

    return [detectionBox, squareBox];
}

function drawEllipse(ctx, x, y, width, height) {
    ctx.ellipse(x, y, width, height, 0, 0, 2 * Math.PI);
}

export function createMaskCanvas(img, width, height, points, id) {
    const container = document.querySelector("#photo--input--container");
    const maskCanvas = document.createElement("canvas");
    maskCanvas.class = `mask--canvas`;
    maskCanvas.id = `mask--canvas--${id}`;
    maskCanvas.width = width;
    maskCanvas.height = height;
    maskCanvas.classList.add("hidden");

    const ctx = maskCanvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.fillRect(0, 0, width, height);
    drawMask(maskCanvas, points);

    container.append(maskCanvas);

    return maskCanvas;
}

export function drawMask(canvas, points) {
    const ctx = canvas.getContext("2d");
    // let pointIndexes = pushValues(17, 26).concat(pushValues(16, 0));

    const mouthWidth = distanceBetweenPoints(points[60], points[64]) * 0.9;
    const mouthHeight = mouthWidth * 0.5;

    ctx.fillStyle = "black";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 20;
    ctx.save();
    ctx.moveTo(points[66]._x, points[66]._y);

    ctx.beginPath();
    drawEllipse(ctx, points[66]._x, points[66]._y, mouthWidth, mouthHeight);
    drawEllipse(
        ctx,
        points[38]._x,
        points[38]._y,
        mouthWidth * 0.7,
        mouthHeight
    );

    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    drawEllipse(
        ctx,
        points[43]._x,
        points[43]._y,
        mouthWidth * 0.7,
        mouthHeight
    );
    ctx.fill();
    ctx.closePath();
    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(points[17]._x, points[17]._y);
    pointIndexes.forEach((index) => {
        const { x, y } = points[index];
        ctx.lineTo(x, y);
    });

    ctx.closePath();
    ctx.fill();

    // ctx.ellipse(
    //     points[66]._x,
    //     points[66]._y,
    //     mouthWidth,
    //     mouthHeight,
    //     0,
    //     0,
    //     2 * Math.PI
    // );

    // ctx.ellipse(
    //     points[38]._x,
    //     points[38]._y,
    //     mouthWidth,
    //     mouthHeight,
    //     0,
    //     0,
    //     2 * Math.PI
    // );

    // ctx.stroke();
}

export function cropToSquare(canvas) {
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    const size = Math.min(width, height);
}

export function invertColors(canvas) {
    const { width, height } = canvas;

    // Create a new canvas element
    const invertedCanvas = document.createElement("canvas");
    const invertedContext = invertedCanvas.getContext("2d");
    invertedCanvas.width = width;
    invertedCanvas.height = height;

    // Apply the 'invert' filter to invert the colors
    // invertedContext.filter = "invert(100%)";

    // Draw the original canvas onto the inverted canvas with the filter applied
    invertedContext.drawImage(canvas, 0, 0);

    // Add randomly sized and positioned semi-transparent blue rectangles
    const numRectangles = Math.floor(Math.random() * 15) + 5; // Random number of rectangles between 1 and 10
    const maxRectangleSize = 30; // Maximum size of each rectangle

    for (let i = 0; i < numRectangles; i++) {
        const rectangleSize = Math.floor(Math.random() * maxRectangleSize) + 1; // Random size between 1 and maxRectangleSize
        const x = Math.floor(Math.random() * (width - rectangleSize));
        const y = Math.floor(Math.random() * (height - rectangleSize));

        const red = Math.floor(Math.random() * 256); // Random red value between 0 and 255
        const green = Math.floor(Math.random() * 256); // Random green value between 0 and 255
        const blue = Math.floor(Math.random() * 256); // Random blue value between 0 and 255

        invertedContext.fillStyle = `rgba(${red}, ${green}, ${blue}, ${0.9}`; // Random semi-transparent blue color
        invertedContext.fillRect(x, y, rectangleSize, rectangleSize);
    }

    // Return the inverted canvas
    return invertedCanvas;
}

export function applyInvertFilterAndRandomSquares(canvas) {
    const context = canvas.getContext("2d");
    const { width, height } = canvas;

    // Apply the invert filter to the canvas
    context.filter = "invert(100%)";
    context.drawImage(canvas, 0, 0);

    // Generate and draw random squares
    const numSquares = 5;
    const squareSize = Math.min(width, height) / 4; // Adjust the size as needed
    context.fillStyle = "red"; // Set the square color

    for (let i = 0; i < numSquares; i++) {
        const randomX = Math.random() * (width - squareSize);
        const randomY = Math.random() * (height - squareSize);

        // Draw the square
        context.fillRect(randomX, randomY, squareSize, squareSize);
    }
}
