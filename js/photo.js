import * as faceapi from "face-api.js";
import { emulateLoader, loadImage, random } from "./utils";
import { Face } from "./internal";
import { Loader } from "./UI";
import { canvasToViewport, invertColors } from "./drawUtils";

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
    }

    async getFaces(src) {
        this.img = await loadImage(src);
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
            };

            faces.push(bounds);
        }

        // const facesBounds = await getDetections(this.img);

        this.faces = faces.map((bounds) => {
            console.log(bounds);
            const face = new Face(bounds, this.photoView);
            //crop square from og canvas to face.squareCanvas
            face.squareCanvas = face.cropToSquare(this.cv, bounds);
            // console.log("face.scaledBounds: ", face.scaledBounds);

            // console.log("face.squareCanvas", face.squareCanvas);

            face.refreshCanvas = () => this.render();

            return face;
        });

        this.setEditMode(this.editMode);
    }

    async swapFaces() {
        const loader = new Loader("swapping");
        loader.show();
        let output;

        this.faces.forEach(async (face) => {
            await emulateLoader(10, 500);

            output = invertColors(face.squareCanvas);
            console.log("output: ", output);
            document.body.appendChild(output);
        });

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

    render() {
        this.cv.width = this.img.width;
        this.cv.height = this.img.height;
        this.c.drawImage(this.img, 0, 0);

        this.faces.forEach((face) => {
            face.render(this.c);
        });
    }
}
