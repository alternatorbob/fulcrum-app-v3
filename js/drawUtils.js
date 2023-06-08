import * as faceapi from "face-api.js";
import {
    pushValues,
    distanceBetweenPoints,
    isInArray,
    removeFromArray,
} from "./utils";
import { detectionObjects, swapFace } from "./faceDetectionSwap";

// let pointIndexes = pushValues(17, 26).concat([
//     45, 64, 55, 56, 57, 58, 59, 60, 36, 17,
// ]);
let pointIndexes = pushValues(17, 26).concat([64, 55, 56, 57, 58, 59, 60, 17]);
let resultCanvas, detectionsCanvas;
export let activeObject;
export let hiddenDetectionObjects = [];

export async function drawDetectionBox(object) {
    if (!object.isShowing.detection) return;

    const { _x, _y, _width, _height } = object.detectionBox;
    const img = new Image();
    const photoContainer = document.querySelector("#photo--input--container");

    img.onload = () => {
        const frame = document.createElement("img");
        frame.classList.add("detection-frame");
        frame.id = `frame-${object.id}`;

        frame.src = "icons/fulcrum_frame_new.svg";
        frame.style.zIndex = "999";
        frame.style.pointerEvents = "none";
        frame.style.position = "absolute";
        frame.style.left = `${_x}px`;
        frame.style.top = `${_y}px`;
        frame.style.width = `${_width}px`;
        frame.style.height = `${_height}px`;
        photoContainer.appendChild(frame);
    };

    img.src = "icons/fulcrum_frame_new.svg";
}

export function imageClick(e) {
    // console.log(e);
    // let val = wasDetectionClicked(e, activeView);
    // if (val.wasClicked) {
    //     updateVisibility(val.id, activeView);
    //     // toggleVisibility(val.id);
    //     // console.log(updateShowingValue(val.wasClicked, val.id));
    // }
}

function clearCanvas(canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function toggleVisibility(id, toggleResult, toggleDetection) {
    if (!toggleResult) {
        const result = document.querySelector(`#result-${id}`);
        result.classList.toggle("hidden");
    }

    if (!toggleDetection) {
        const detection = document.querySelector(`#frame-${id}`);
        detection.classList.toggle("hidden");
    }
}

export function drawResult(object) {
    const { _x, _y, _width, _height } = object.squareBox;
    const photoContainer = document.querySelector("#photo--input--container");
    // const resultCanvas = document.createElement("canvas");
    const resultCanvas = object.result;
    const ctx = resultCanvas.getContext("2d");
    // ctx.drawImage(object.result, _x, _y, _width, _height);

    resultCanvas.classList.add("result-canvas");
    resultCanvas.id = `result-${object.id}`;
    resultCanvas.style.position = "absolute";
    resultCanvas.style.zIndex = "999";
    resultCanvas.style.pointerEvents = "none";
    resultCanvas.style.left = `${_x}px`;
    resultCanvas.style.top = `${_y}px`;
    resultCanvas.style.width = `${_width}px`;
    resultCanvas.style.height = `${_height}px`;
    photoContainer.appendChild(resultCanvas);
    // document.body.appendChild(object.result);

    return resultCanvas;
}

export function wasDetectionClicked(e) {
    for (let i = 0; i < detectionObjects.length; i++) {
        const object = detectionObjects[i];
        const { _x, _y, _width, _height } = object.detectionBox;
        console.log(object);
        if (
            e.offsetX > _x &&
            e.offsetX < _x + _width &&
            e.offsetY > _y &&
            e.offsetY < _y + _height
        ) {
            return { wasClicked: true, id: object.id };
        }
    }
    return false;
}

export function updateVisibility(id, activeView) {
    for (let i = 0; i < detectionObjects.length; i++) {
        const object = detectionObjects[i];
        let { detection, result } = object.isShowing;

        if (object.id === id) {
            switch (activeView) {
                case "result":
                    console.log("updateVisibility: result");
                    detection = !detection;
                    result = !result;

                    break;

                case "edit":
                    console.log("updateVisibility: edit");
                    detection = !detection;
                    break;
            }
            toggleVisibility(object.id, detection, result);
        }
    }
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
    invertedContext.filter = "invert(100%)";

    // Draw the original canvas onto the inverted canvas with the filter applied
    invertedContext.drawImage(canvas, 0, 0);

    // Add randomly sized and positioned semi-transparent blue rectangles
    const numRectangles = Math.floor(Math.random() * 15) + 5; // Random number of rectangles between 1 and 10
    const maxRectangleSize = 60; // Maximum size of each rectangle

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
