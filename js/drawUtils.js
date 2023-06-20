import * as faceapi from "face-api.js";
import { globalControls } from "../globalControls";
import {
    pushValues,
    distanceBetweenPoints,
    isInArray,
    removeFromArray,
    calculateMultiplier,
} from "./utils";

// let pointIndexes = pushValues(17, 26).concat([
//     45, 64, 55, 56, 57, 58, 59, 60, 36, 17,
// ]);
let pointIndexes = pushValues(17, 26).concat([64, 55, 56, 57, 58, 59, 60, 17]);
let resultCanvas, detectionsCanvas;
export let activeObject;
export let hiddenDetectionObjects = [];

export function clearCanvas(canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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

export function featherEdges(canvas) {
    const ctx = canvas.getContext("2d");
    const margin = 15;

    ctx.save();

    ctx.filter = `blur(${margin / 4}px)`;
    ctx.fillStyle = "black";

    ctx.fillRect(
        margin,
        margin,
        canvas.width - margin * 2,
        canvas.height - margin * 2
    );

    ctx.restore();

    return;
}

export function drawCanvasToCanvas(sourceCanvas, destinationCanvas, bounds) {
    const srcCtx = sourceCanvas.getContext("2d");
    const destCtx = destinationCanvas.getContext("2d");

    if (!bounds) {
        destCtx.drawImage(sourceCanvas, 0, 0);
        return;
    }

    const { x, y, width, height } = bounds;
    const size = Math.max(width, height);
    destCtx.drawImage(sourceCanvas, x, y, size, size);
}

export function drawImageToCanvas(sourceImage, destinationCanvas, bounds) {
    const destCtx = destinationCanvas.getContext("2d");

    if (!bounds) {
        destCtx.drawImage(sourceImage, 0, 0);
        return;
    }

    const { x, y, width, height } = bounds;
    destCtx.drawImage(sourceImage, x, y, width, height);
}

export function createMaskCanvas(face, squareCanvas) {
    const { width, height } = squareCanvas;

    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = width;
    maskCanvas.height = height;

    const ctx = maskCanvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.fillRect(0, 0, width, height);

    const faceX = face.cvBounds.x;
    const faceY = face.cvBounds.y;

    const shiftedPositions = [...face.cvBounds.points.positions];
    shiftedPositions.forEach((point) => {
        point._x -= faceX;
        point._y -= faceY;
    });

    drawMask(maskCanvas, shiftedPositions);

    return maskCanvas;
}

export function drawMask(canvas, points) {
    const ctx = canvas.getContext("2d");
    // let pointIndexes = pushValues(17, 26).concat(pushValues(16, 0));
    const multiplier = globalControls.maskRadiusFactor;
    // const multiplier = calculateMultiplier()

    const mouthWidth =
        distanceBetweenPoints(points[60], points[64]) * multiplier;
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
    // invertedContext.filter = "invert(100%)";

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
