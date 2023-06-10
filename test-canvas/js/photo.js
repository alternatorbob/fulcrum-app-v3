import { loadImage, random } from "../../js/utils";
import { Face } from "./face";

export class Photo {
    constructor(parent) {
        const canvas = document.createElement("canvas");
        parent.appendChild(canvas);
        parent.className = "photoContainer";
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
        console.log(facesBounds);

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
    const { width, height } = img;

    for (let i = 0; i < 3; i++) {
        const bounds = {
            x: random(0, width),
            y: random(0, height),
            width: random(500, 1000),
            height: random(500, 1000),
        };
        faces.push(bounds);
    }

    return faces;
}
