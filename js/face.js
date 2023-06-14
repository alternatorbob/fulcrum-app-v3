import { adjustDetectionBoxes } from "./utils";
import eventBus from "./EventBus.js";
import { Loader } from "./UI";
import { delay } from "./utils";
import { getState } from "./state";

function randomColor() {
    return (
        "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
    );
}

export class Face {
    static instanceCount = 0;
    constructor(bounds, parent) {
        Face.instanceCount++;

        this.cvBounds = bounds;

        this.elem = document.createElement("div");
        this.elem.className = "face";
        this.elem.id = `face-${Face.instanceCount}`;

        this.squareCanvas;

        this.detectionBox = new Image();
        this.detectionBox.src = "icons/fulcrum_frame_new.svg";

        this.result = null;

        this.color = randomColor();
        this.editMode = false;

        this.enabled = true;
        this.isShowing = { detection: true, result: true };

        this.parent = parent;
        this.canvas = this.parent.querySelector("canvas");
        this.parent.appendChild(this.elem);

        this.elem.onclick = async (e) => {
            console.log(e.target.parentNode);

            switch (getState()) {
                case "result":
                    this.isShowing.detection = !this.isShowing.detection;
                    this.isShowing.result = !this.isShowing.result;
                    this.refreshCanvas();
                    break;
                case "edit":
                    this.hide(this.detectionBox);
                    this.isShowing.detection = !this.isShowing.detection;
                    this.refreshCanvas();
                    break;
            }

            if (getState() === "edit") {
                this.hide(this.detectionBox);
                this.isShowing.detection = !this.isShowing.detection;
                this.refreshCanvas();
            }

            const enabled = this.toggleEnabled();

            if (enabled) {
                await this.regenerate();
            }
        };

        eventBus.addEventListener("toggleEnable", () => {
            this.toggleEnabled();
        });
    }

    async regenerate() {
        await delay(1000);
        this.color = randomColor();

        this.refreshCanvas();
    }

    toggleEnabled() {
        this.enabled = !this.enabled;
        this.refreshCanvas();

        return this.enabled;
    }

    setEditMode(enabled) {
        this.editMode = enabled;
    }

    canvasToViewport(bounds, canvas, parent) {
        let { x, y, width, height } = bounds;

        const parentWidth = parent.offsetWidth;
        const parentHeight = parent.offsetHeight;

        const xRatio = parentWidth / canvas.width;
        const yRatio = parentHeight / canvas.height;

        x *= xRatio;
        y *= yRatio;
        const widthScaled = width * xRatio;
        const heightScaled = height * yRatio;

        return { x, y, width: widthScaled, height: heightScaled };
    }

    cropToSquare(canvas, bounds) {
        const { x, y, width, height } = bounds;

        const size = Math.max(width, height);

        const squareCanvas = document.createElement("canvas");
        squareCanvas.width = size;
        squareCanvas.height = size;

        const ctx = squareCanvas.getContext("2d");
        ctx.drawImage(
            canvas,
            x,
            y,
            width,
            height,
            (size - width) / 2,
            (size - height) / 2,
            width,
            height
        );

        // document.body.appendChild(canvas);

        return squareCanvas;
    }

    updateCSS(elem) {
        const bounds = this.canvasToViewport(
            this.cvBounds,
            this.canvas,
            this.parent
        );

        elem.classList.toggle("enabled", this.enabled);
        elem.classList.toggle("edit", this.editMode);
        elem.style.cssText = `top: ${bounds.y}px; left: ${bounds.x}px; width: ${bounds.width}px; height: ${bounds.height}px`;

        return bounds;
    }

    refreshCanvas() {}

    hide(div) {
        div.classList.add("hidden");
    }

    show(div) {
        div.classList.remove("hidden");
    }

    render(ctx) {
        if (getState() === "edit") {
            if (this.isShowing.detection) {
                this.hide(this.detectionBox);
            } else {
                this.show(this.detectionBox);
            }
        }

        this.updateCSS(this.elem);

        const scaledBounds = this.canvasToViewport(
            this.cvBounds,
            this.canvas,
            this.parent
        );

        if (this.enabled) {
            const { x, y, width, height } = this.cvBounds;

            this.detectionBox.width = scaledBounds.width;
            this.detectionBox.height = scaledBounds.height;
            this.elem.appendChild(this.detectionBox);
        }
    }
}

export async function drawDetectionBox(object) {
    if (!object.isShowing.detection) return;

    const { _x, _y, _width, _height } = object.detectionBox;
    const img = new Image();
    const photoContainer = document.querySelector("#photo--input--container");

    img.onload = () => {
        const frame = document.createElement("img");
        frame.classList.add("detection-frame");
        frame.id = `frame-${object.id}`;

        frame.src = "icons/fulcrum_frame_new.svg";
        frame.style.zIndex = "1000";
        frame.style.pointerEvents = "none";
        frame.style.position = "absolute";
        frame.style.left = `${_x}px`;
        frame.style.top = `${_y}px`;
        frame.style.width = `${_width}px`;
        frame.style.height = `${_height}px`;
        photoContainer.appendChild(frame);
    };

    img.src = "icons/fulcrum_frame_new.svg";
}
