import * as faceapi from "face-api.js";
import { emulateLoader, loadImage, random } from "./utils";
import { Face } from "./internal";
import { Loader } from "./UI";
import { canvasToViewport, createMaskCanvas, invertColors } from "./drawUtils";
import eventBus from "./EventBus";
import { states, changeState } from "./state";

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
        // this.img = await loadImage(src);
        this.img = src;

        const faces = [];

        let detections = await faceapi
            .detectAllFaces(this.img)
            .withFaceLandmarks()
            .withAgeAndGender();

        detections = detections.filter(({ detection }) => {
            return detection._score > 0.6;
        });

        for (const det of detections) {
            const { _x, _y, _width, _height } = det.alignedRect.box;
            const bounds = {
                x: Math.round(_x),
                y: Math.round(_y),
                width: Math.round(_width),
                height: Math.round(_height),
                points: det.landmarks,
            };

            faces.push(bounds);
        }

        // const facesBounds = await getDetections(this.img);

        changeState(states.DETECTIONS);
        this.switchActiveView();

        this.faces = faces.map((bounds) => {
            const face = new Face(bounds, this.photoView, this);

            const output = this.swapFace(face);

            face.refreshCanvas = () => this.render();

            return face;
        });

        this.setEditMode(this.editMode);
    }

    swapFace(faceObject) {
        const loader = new Loader("swapping");
        loader.show();

        const squareCanvas = faceObject.cropToSquare(
            this.cv,
            faceObject.cvBounds
        );
        const maskCanvas = createMaskCanvas(faceObject, squareCanvas);

        const faceImage = squareCanvas.toDataURL();
        const maskImage = maskCanvas.toDataURL();

        console.log({ faceImage, maskImage });

        let output = invertColors(squareCanvas);

        faceObject.setSwappedFace(output);

        loader.hide();

        return output;
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
