import * as faceapi from "face-api.js";
import eventBus from "../EventBus";
import { Loader } from "./Loader";
import { Face } from "../internal";
import { emulateLoader, loadImage, random } from "../utils";
import { canvasToViewport, createMaskCanvas, invertColors } from "../drawUtils";

export class Photo {
    constructor(parent) {
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
        // const loader = new Loader("uploading");
        // loader.show();

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
                x: _x,
                y: _y,
                width: _width,
                height: _height,
                points: det.landmarks.positions,
            };

            faces.push(bounds);
        }

        // const facesBounds = await getDetections(this.img);

        this.faces = faces.map((bounds) => {
            const face = new Face(bounds, this.photoView, this);
            //crop square from og canvas to face.squareCanvas

            console.log("this.cv: ", this.cv);

            // face.squareCanvas = face.cropToSquare(this.cv, face.cvBounds);
            // face.mask = createMaskCanvas(face.squareCanvas, bounds.points);
            // const output = this.swapFace(face);

            face.refreshCanvas = () => this.render();

            return face;
        });

        this.setEditMode(this.editMode);
        // loader.hide();
    }

    swapFace(face) {
        const loader = new Loader("swapping");
        loader.show();
        // let output = null;
        // console.log(this.c.canvas);
        // const test = document.createElement("canvas");
        // const ctx = test.getContext("2d");
        // ctx.fillRect(0, 0, test.width, test.height);

        //fix canvas bounds, too wide and too much left

        let output = invertColors(face.squareCanvas);
        face.setSwappedFace(output);
        // this.faces.forEach( (face) => {
        //     console.log("FACE",face)
        //     // await emulateLoader(10, 500);
        //     output = invertColors(face.squareCanvas);
        //     faceObject.setFakeFace(output);
        // });

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
            face.isShowing.detection = false;
        });
    }

    render() {
        console.log("Photo render was called");
        this.cv.width = this.img.width;
        this.cv.height = this.img.height;
        this.c.drawImage(this.img, 0, 0);

        // this.faces.forEach((face) => {
        //     face.render(this.c);
        // });
    }
}
