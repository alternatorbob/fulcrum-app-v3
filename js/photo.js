import * as faceapi from "face-api.js";
import { loadImage, random } from "./utils";
import { Face } from "./internal";

export class Photo {
    constructor(parent) {
        const photoView = document.createElement("div");
        photoView.classList.add("photo");
        parent.appendChild(photoView);

        const canvasContainer = document.createElement("div");
        canvasContainer.classList.add("canvasContainer");
        photoView.appendChild(canvasContainer);

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

        const facesBounds = await getFaces(this.img);

        this.faces = facesBounds.map((bounds) => {
            const face = new Face(bounds, this.parent);

            face.refreshCanvas = () => this.render();

            return face;
        });

        this.setEditMode(this.editMode);
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

async function getFaces(img) {
    const faces = [];

    let detections = await faceapi
        .detectAllFaces(img)
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

    return faces;
}
