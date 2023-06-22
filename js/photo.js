import * as faceapi from "face-api.js";
import { emulateLoader, getNumberFromString, loadImage, random } from "./utils";
import { Face, HomePage } from "./internal";
import { Loader, SystemMessage } from "./UI";
import {
    drawCanvasToCanvas,
    createMaskCanvas,
    invertColors,
    drawImageToCanvas,
    copyCanvas,
} from "./drawUtils";
import eventBus from "./EventBus";
import { states, changeState } from "./state";
import { inPaint } from "./replicate";
import { AnimatedCircles } from "./AnimatedCircles";
import { globalControls } from "../globalControls";

export class Photo {
    constructor(parent, switchActiveView) {
        this.switchActiveView = switchActiveView;
        this.photoView = document.createElement("div");
        this.photoView.classList.add("photo");
        parent.appendChild(this.photoView);

        const canvasContainer = document.createElement("div");
        canvasContainer.classList.add("canvasContainer");
        this.photoView.appendChild(canvasContainer);

        const canvas = document.createElement("canvas");
        canvas.id = "photo-canvas";
        canvasContainer.appendChild(canvas);
        // parent.className = "photoContainer";
        this.parent = parent;
        this.faces = [];
        this.swappedFaces = [];
        this.storedResults = [];
        this.cv = canvas;
        this.c = canvas.getContext("2d");
        this.img = null;
        this.editMode = false;

        this.lastClickedFace = null;
        this.lastClickedFaceId = null;

        eventBus.subscribe("fileSelected", this.getFaces.bind(this));
        eventBus.subscribe("setEditMode", this.setEditMode.bind(this));

        eventBus.addEventListener("downloadResult", () => {
            this.downloadResult();
        });

        eventBus.addEventListener("triggerRegenerate", () => {
            this.triggerRegenerate();
        });

        eventBus.addEventListener("storeResults", () => {
            this.storeResults();
        });

        eventBus.addEventListener("restoreFaces", () => {
            this.restoreFaces();
        });
    }

    async getFaces(src) {
        const loader = new Loader("detecting");
        loader.show();
        this.img = src;

        const faces = [];

        let detections = await faceapi
            .detectAllFaces(this.img)
            .withFaceLandmarks()
            .withAgeAndGender()
            .withFaceExpressions();

        detections = detections.filter(({ detection }) => {
            return detection._score > 0.6;
        });

        if (detections.length < 1) {
            const message = new SystemMessage("No face were detected");
            message.showFor(globalControls.systemMessageDuration);
            loader.hide();
            return;
        }

        let highestValue = 0;
        let chosenExpression = null;

        for (const det of detections) {
            const { _x, _y, _width, _height } = det.alignedRect.box;

            const bounds = {
                x: _x,
                y: _y,
                width: _width,
                height: _height,
                points: det.landmarks,
            };

            for (const expression in det.expressions) {
                const val = det.expressions[expression];
                if (val > highestValue) {
                    highestValue = val;
                    chosenExpression = expression;
                }
            }

            const features = {
                age: det.age,
                gender: det.gender,
                expression: chosenExpression,
            };

            const faceObject = { bounds: bounds, features: features };

            faces.push(faceObject);
        }

        changeState(states.DETECTIONS);
        this.switchActiveView();

        loader.hide();

        this.faces = await Promise.all(
            faces.map(async (faceObj) => {
                const { bounds, features } = faceObj;
                const face = new Face(bounds, features, this.photoView, this);

                console.log("initial faces", face);

                // const scaledBounds = face.canvasToViewport(
                //     bounds,
                //     this.cv,
                //     this.photoView
                // );
                // console.log("scaledBounds: ", face.scaledBounds);

                // const animatedCircles = new AnimatedCircles(face.elem, bounds);

                // animatedCircles.show();

                const result = await this.swapFace(face, features);
                // result.width = face.squareCanvas.width;
                // result.height = face.squareCanvas.height;

                // animatedCircles.hide();

                face.setSwappedFace(result, face.id);

                face.refreshCanvas = () => this.render();

                this.swappedFaces.push(face);

                return face;
            })
        );

        changeState(states.RESULT);
        this.switchActiveView();

        this.setEditMode(this.editMode);

        const message = new SystemMessage("tap face to keep original");
        message.showFor(globalControls.systemMessageDuration);
        // message.show()
    }

    storeResults() {
        console.log("storeResults");
        this.swappedFaces.forEach((face) => {
            this.storedResults.push({
                result: copyCanvas(face.result),
                id: face.id,
            });
        });
    }

    restoreFaces() {
        console.log("restoreFaces");

        this.faces.forEach((face, index) => {
            const { result, id } = this.storedResults[index];
            face.setSwappedFace(result, id);
        });
    }

    setLastClickedFace(id) {
        changeState(states.EDITSELECTED);
        this.switchActiveView();

        this.swappedFaces.forEach((face) => {
            const faceId = getNumberFromString(face.elem.id);

            if (faceId === id) {
                console.log("lastClickedFace: ", face);

                this.lastClickedFace = face;
                this.lastClickedFaceId = id;
                return;
            }
        });
    }

    triggerRegenerate() {
        this.faces.forEach(async (face) => {
            const faceId = getNumberFromString(face.elem.id);

            if (faceId === this.lastClickedFaceId) {
                console.log("faceId", faceId);
                console.log("this.lastClickedFaceId", this.lastClickedFaceId);
                console.log("face to generate", face);

                this.switchActiveView();

                await this.regenerateFace(face);
                return;
            }
        });
    }

    async swapFace(face, features) {
        const loader = new Loader("swapping");
        loader.show();

        const squareCanvas = face.cropToSquare(this.cv, face.cvBounds);

        console.log("squareCanvas.width", "squareCanvas.height");
        console.log(squareCanvas.width, squareCanvas.height);
        face.squareCanvas = squareCanvas;

        const maskCanvas = createMaskCanvas(face, squareCanvas);

        const scaledSquareCanvas = face.createScaledCanvas(squareCanvas);
        const scaledMaskCanvas = face.createScaledCanvas(maskCanvas);

        // squareCanvas.width = maskCanvas.width = 512;
        // squareCanvas.height = maskCanvas.height = 512;

        const faceImage = scaledSquareCanvas.toDataURL();
        const maskImage = scaledMaskCanvas.toDataURL();

        face.faceImage = faceImage;
        face.maskImage = maskImage;

        // document.body.appendChild(scaledSquareCanvas);
        // document.body.appendChild(scaledMaskCanvas);

        // return scaledSquareCanvas;

        if (globalControls.debugAPI) {
            await emulateLoader(globalControls.delayTime);
            let output = invertColors(squareCanvas);
            loader.hide();
            return output;
        } else {
            const url = await inPaint(
                faceImage,
                maskImage,
                face.prompt,
                (value) => {
                    const lines = value.split("\n").filter(Boolean);
                    const lastLine = lines[lines.length - 1];
                    let number = 0;
                    if (lastLine) number = Number(lastLine.split("%")[0]);
                    // console.log("number: ", number);
                    console.log("value: ", value);
                }
            );

            loader.hide();
            return loadImage(url);
        }
    }

    async regenerateFace(face) {
        console.log("from regenerateFace: ", face);

        const button = document.querySelector("#regenerate-button");

        console.log("button: ", button);

        button.style.display = "none";

        const prototype = Object.getPrototypeOf(face);

        face.faceImage;
        face.maskImage;

        const loader = new Loader("swapping");
        loader.show();

        let output;

        if (globalControls.debugAPI) {
            await emulateLoader(globalControls.delayTime);
            output = invertColors(face.squareCanvas);
            loader.hide();

            // prototype.setSwappedFace.call(this, output);
            face.setSwappedFace(output, face.id);
            setTimeout(() => {
                button.style.display = "flex";
            }, 175);
            return output;
        } else {
            const url = await inPaint(
                face.faceImage,
                face.maskImage,
                face.prompt,
                (value) => {
                    const lines = value.split("\n").filter(Boolean);
                    const lastLine = lines[lines.length - 1];
                    let number = 0;
                    if (lastLine) number = Number(lastLine.split("%")[0]);
                    // console.log("number: ", number);
                    console.log("value: ", value);
                }
            );

            output = await loadImage(url);

            face.setSwappedFace(output, face.id);
            loader.hide();
            setTimeout(() => {
                button.style.display = "flex";
            }, 175);
        }
    }

    getResult(faces) {
        console.log(faces);
    }

    setEditMode(enabled) {
        this.editMode = enabled;
        this.faces.forEach((face) => face.setEditMode(this.editMode));
        this.render();
    }

    resetBoundingBoxes() {
        this.faces.forEach((face) => {
            face.setSelection(false);
        });
    }

    downloadResult() {
        this.drawDownloadResult(this.faces);

        const link = document.createElement("a");

        link.href = this.cv.toDataURL();
        link.download = "made_with_FULCRUM.png";

        link.click();
    }

    drawDownloadResult(faces) {
        faces.forEach((face) => {
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = face.result.width;
            tempCanvas.height = face.result.height;

            // const anonResult = anonImgFromCanvas(face.result);

            drawCanvasToCanvas(face.result, this.cv, face.cvBounds);
            // drawImageToCanvas(anonResult, this.cv, face.bounds)

            // drawCanvasToCanvas(face.result, tempCanvas, face.cvBounds);
            // drawCanvasToCanvas(tempCanvas, this.cv);
            // this.c.drawImage(face.result, x, y, width, height);
        });
    }

    clearAll() {
        const faceInstances = document.querySelectorAll(".face");
        if (faceInstances.length < 1) return;
        console.log("should clear");
        this.c.clearRect(0, 0, this.cv.width, this.cv.height);
        this.faces = [];
        faceInstances.forEach((instance) => instance.remove());
    }

    render() {
        this.cv.width = this.img.width;
        this.cv.height = this.img.height;
        this.c.drawImage(this.img, 0, 0);

        this.faces.forEach((face) => {
            face.render(this.c);
        });
    }
}
