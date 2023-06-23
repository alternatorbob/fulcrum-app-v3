import { globalControls } from "../globalControls";
import { inPaint } from "./replicate";

export function cropCanvas(sourceCanvas, x, y, width, height) {
    const croppedCanvas = document.createElement("canvas");

    // document
    //     .querySelector("#photo--input--container")
    //     .appendChild(sourceCanvas);
    // Calculate the new width and height to ensure they are multiples of 8
    // const newWidth = 512;
    // const newHeight = 512;
    // const newWidth = Math.ceil(width / 8) * 8;
    // const newHeight = Math.ceil(height / 8) * 8;
    // croppedCanvas.width = newWidth;
    // croppedCanvas.height = newHeight;

    croppedCanvas.width = width;
    croppedCanvas.height = height;

    const ctx = croppedCanvas.getContext("2d");
    ctx.drawImage(sourceCanvas, x, y, width, height, 0, 0, width, height);

    return croppedCanvas;
}

export function resizeCanvas(sourceCanvas, width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(sourceCanvas, 0, 0, width, height);
    return canvas;
}

export function drawRectangleOnCanvas(canvas, x, y, width, height) {
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "red"; // Set rectangle color

    ctx.fillRect(x, y, width, height);
}

export function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function highestValueKey(object) {
    let highestValue = 0;
    let highestKey = null;

    for (const key in object) {
        if (object.hasOwnProperty(key)) {
            const value = object[key];
            if (
                typeof value === "number" &&
                !isNaN(value) &&
                value > highestValue
            ) {
                highestValue = value;
                highestKey = key;
            }
        }
    }

    return highestKey;
}

export function highlightPoints(canvas, point) {
    const ctx = canvas.getContext("2d");
    const radius = 10;
    const { x, y } = point;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
}

export function pushValues(start, end) {
    let tempArray = [];
    if (start < end) {
        for (let i = start; i <= end; i++) {
            tempArray.push(i);
        }
    } else if (start > end) {
        for (let i = start; i >= end; i--) {
            tempArray.push(i);
        }
    }
    return tempArray;
}

export function getNumberFromString(string) {
    return parseInt(string.match(/\d+/)[0]);
}

export function distanceBetweenPoints(point1, point2) {
    return Math.sqrt(
        Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
}

export function appendElem(elem) {
    const div = document.querySelector("#photo--input--container");
    elem.style.width = "60px";
    div.appendChild(elem);
}

export function isInArray(array, id) {
    return array.some((obj) => obj.id === id);
}

export function removeFromArray(array, idToRemove) {
    const indexToRemove = array.findIndex((obj) => obj.id === idToRemove);

    if (indexToRemove !== -1) {
        array.splice(indexToRemove, 1);
    }
}

export function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
    });
}

// #region dependencies for random ----------

function isNumber(elem) {
    return !(isNaN(elem) || elem === null);
}

// #endregion ----------

export function random(a, b) {
    if (arguments.length === 1) {
        if (Array.isArray(a)) {
            const index = Math.floor(random(a.length));

            return a[index];
        } else if (typeof a === "object") {
            return random(Object.values(a));
        } else if (isNumber(a)) {
            return Math.random() * a;
        }
    } else if (arguments.length === 0) {
        return Math.random();
    }

    return Math.random() * (b - a) + a;
}

export async function emulateLoader(interval) {
    let percentage = 0;

    // Helper function to delay execution
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    while (percentage < 100) {
        // Wait for the specified interval
        await delay(interval);

        // Increment the percentage
        percentage += Math.floor(Math.random() * 6) + 7;

        // Ensure the percentage doesn't exceed 100
        if (percentage > 100) {
            percentage = 100;
        }

        // Log the current percentage
        console.log(`Current percentage: ${percentage}%`);
    }

    return percentage;
}

export function srcToFile(src, fileName, mimeType) {
    return fetch(src)
        .then(function (res) {
            return res.arrayBuffer();
        })
        .then(function (buf) {
            return new File([buf], fileName, { type: mimeType });
        });
}

export function calculateMultiplier(width) {
    // Define the range of the width values
    const minWidth = 40;
    const maxWidth = 400;

    // Define the range of the multiplier values
    const minMultiplier = 0.8;
    const maxMultiplier = 1.7;

    // Calculate the normalized width value
    const normalizedWidth = (width - minWidth) / (maxWidth - minWidth);

    // Calculate the mapped multiplier value
    const mappedMultiplier =
        normalizedWidth * (maxMultiplier - minMultiplier) + minMultiplier;

    // Return the mapped multiplier value
    return mappedMultiplier;
}

export function adjustDetectionBoxes(box) {
    const scaleFactor = 1.5;
    let detectionBox = { ...box };
    let squareBox = { ...box };

    detectionBox.x -= detectionBox.width / (scaleFactor * 2.66);
    detectionBox.y -= (detectionBox.width / (scaleFactor * 2.66)) * 1.4;
    detectionBox.width *= scaleFactor;
    detectionBox.height *= scaleFactor;

    //squareBox
    squareBox.x -= squareBox.width / 3;
    squareBox.y -= squareBox.width / 4;

    squareBox.width > squareBox.height
        ? (squareBox.height = squareBox.width)
        : (squareBox.width = squareBox.height);

    squareBox.width *= 1.3;
    squareBox.height *= 1.3;

    return [detectionBox, squareBox];
}

let remove = null;

export const updatePixelRatio = () => {
    if (remove != null) {
        remove();
    }
    let mqString = `(resolution: ${window.devicePixelRatio}dppx)`;
    let media = matchMedia(mqString);
    media.addEventListener("change", updatePixelRatio);
    remove = function () {
        media.removeEventListener("change", updatePixelRatio);
    };

    console.log("devicePixelRatio: " + window.devicePixelRatio);
};

export const calculatePercentageChange = (oldValue, newValue) =>
    ((newValue - oldValue) / Math.abs(oldValue)) * 100;

export const scaleValueUp = (value, percentage) =>
    value * (1 + percentage / 100);

export const scaleValueDown = (value, percentage) =>
    value * (1 - Math.abs(percentage) / 100);

if (globalControls.keepItHot) window.addEventListener("load", keepItHot);

export async function keepItHot() {
    console.log("keepin it hot");
    const formData = new FormData();

    const prompt =
        "a bottle of french wine, detailed, beautiful typography, classy, traditional, expensive wine";
    const size = 64;

    const image = await getImageAsBase64("/keepItHot/bottle.jpg");
    const mask = await getImageAsBase64("/keepItHot/mask.jpg");

    // console.log("image: ", image, "mask: ", mask);
    // return;

    formData.append("prompt", prompt);
    formData.append("edit_image", image);
    formData.append("mask", mask);
    formData.append("width", size);
    formData.append("height", size);

    const { id } = await fetch("/api/inpaint", {
        method: "POST",
        body: formData,
    }).then((res) => res.json());

    let succeeded = false;
    let output;

    while (!succeeded) {
        const data = await fetch(`/api/${id}`).then((res) => res.json());

        // succeeded = true;
        if (data.status === "succeeded") {
            succeeded = true;
            output = data.output[0];

            break;
        } else {
            // console.log(data.logs);
            console.log("keepin it hot");
        }

        await delay(750);
    }

    // Wait for 5 minutes before calling the function again
    // await new Promise((resolve) => setTimeout(resolve, 30 * 1000));
    await new Promise((resolve) => setTimeout(resolve, 3 * 60 * 1000));

    // Call the function again
    await keepItHot();
}

async function getImageAsBase64(imagePath) {
    try {
        const response = await fetch(imagePath);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Error fetching image:", error);
        throw error;
    }
}
