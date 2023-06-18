import * as faceapi from "face-api.js";
import { emulateLoader, loadImage, random } from "./utils";
import { Face } from "./internal";
import { Loader } from "./UI";
import { canvasToViewport, createMaskCanvas, invertColors } from "./drawUtils";
import eventBus from "./EventBus";
import { states, changeState } from "./state";
import { inPaint } from "./replicate";

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
        this.cv = canvas;
        this.c = canvas.getContext("2d");
        this.img = null;
        this.editMode = false;

        eventBus.subscribe("fileSelected", this.getFaces.bind(this));
    }

    async getFaces(src) {
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

        this.faces = await Promise.all(
            faces.map(async (faceObj) => {
                const { bounds, features } = faceObj;
                console.log("faceObj: ", faceObj);
                const face = new Face(bounds, features, this.photoView, this);

                const result = await this.swapFace(face);
                face.setSwappedFace(result);

                face.refreshCanvas = () => this.render();

                return face;
            })
        );

        this.setEditMode(this.editMode);
    }

    async swapFace(face) {
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

        document.body.appendChild(scaledSquareCanvas);
        document.body.appendChild(scaledMaskCanvas);

        // return scaledSquareCanvas;

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

    render() {
        this.cv.width = this.img.width;
        this.cv.height = this.img.height;
        this.c.drawImage(this.img, 0, 0);

        this.faces.forEach((face) => {
            face.render(this.c);
        });
    }
}
