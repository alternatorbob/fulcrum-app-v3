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

export async function emulateLoader(duration, interval) {
    let percentage = 0;

    // Helper function to delay execution
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    while (percentage < 100) {
        // Wait for the specified interval
        await delay(interval);

        // Increment the percentage
        // percentage += Math.floor(Math.random(7, 12));
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
