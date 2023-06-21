import * as faceapi from "face-api.js";
import { emulateLoader, getNumberFromString, loadImage, random } from "./utils";
import { Face } from "./internal";
import { Loader, SystemMessage } from "./UI";
import {
    drawCanvasToCanvas,
    createMaskCanvas,
    invertColors,
    drawImageToCanvas,
} from "./drawUtils";
import eventBus from "./EventBus";
import { states, changeState } from "./state";
import { inPaint } from "./replicate";
import { AnimatedCircles } from "./AnimatedCircles";

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
        this.cv = canvas;
        this.c = canvas.getContext("2d");
        this.img = null;
        this.editMode = false;

        this.lastClickedFace = null;
        this.lastClickedFaceId = null;

        eventBus.subscribe("fileSelected", this.getFaces.bind(this));

        eventBus.addEventListener("downloadResult", () => {
            this.downloadResult();
        });

        eventBus.addEventListener("triggerRegenerate", () => {
            this.triggerRegenerate();
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

                // const scaledBounds = face.canvasToViewport(
                //     bounds,
                //     this.cv,
                //     this.photoView
                // );
                // console.log("scaledBounds: ", face.scaledBounds);

                // const animatedCircles = new AnimatedCircles(face.elem, bounds);

                // animatedCircles.show();

                const result = await this.swapFace(face, features);

                // animatedCircles.hide();

                face.setSwappedFace(result);

                face.refreshCanvas = () => this.render();

                this.swappedFaces.push(face);

                return face;
            })
        );

        changeState(states.RESULT);
        this.switchActiveView();

        this.setEditMode(this.editMode);

        const message = new SystemMessage("tap face to keep original");
        message.showFor(3000);
        // message.show()
    }

    setLastClickedFace(id) {
        changeState(states.EDITSELECTED);
        this.switchActiveView();

        this.swappedFaces.forEach((face) => {
            console.log(face);

            const faceId = getNumberFromString(face.elem.id);

            if (faceId === id) {
                this.lastClickedFace = face;
                this.lastClickedFaceId = id;
                return;
            }
        });
    }

    triggerRegenerate() {
        this.faces.forEach((face) => {
            const faceId = getNumberFromString(face.elem.id);

            if (faceId === this.lastClickedFaceId) {
                this.regenerateFace(face);
                return;
            }
        });
    }

    async swapFace(face, features) {
        const loader = new Loader("swapping");
        loader.show();

        const squareCanvas = face.cropToSquare(this.cv, face.cvBounds);
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

        await emulateLoader(500);
        let output = invertColors(squareCanvas);
        loader.hide();
        return output;

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

    async regenerateFace(face) {
        console.log("from regenerateFace: ", face);

        const prototype = Object.getPrototypeOf(face);

        face.faceImage;
        face.maskImage;

        const loader = new Loader("swapping");
        loader.show();

        let output = invertColors(face.squareCanvas);
        console.log("face.squareCanvas: ", face.squareCanvas);
        loader.hide();

        console.log("output", output);

        prototype.setSwappedFace.call(this, output);

        return output;

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

        prototype.setSwappedFace.call(result);
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

        // console.log("result: ", result);
        console.log("link: ", link);

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
