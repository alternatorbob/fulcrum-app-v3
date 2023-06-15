import eventBus from "../EventBus.js";
import { Loader } from "./Loader.js";
import { delay, adjustDetectionBoxes } from "../utils";
import { getState } from "../state";

function randomColor() {
    return (
        "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
    );
}

export class Face {
    static instanceCount = 0;
    constructor(bounds, parent, scope) {
        Face.instanceCount++;
        this.scope = scope;
        this.parent = parent;
        this.canvas = this.parent.querySelector("canvas");

        this.cvBounds = bounds;

        this.elem = document.createElement("div");
        this.elem.className = "face";
        this.elem.id = `face-${Face.instanceCount}`;

        this.squareCanvas;
        this.result = null;
        this.mask = null;
        this.prompt = null;

        this.scaledBounds = this.canvasToViewport(
            this.cvBounds,
            this.canvas,
            this.parent
        );

        this.detectionBox = new Image();
        this.detectionBox.onload = () => {
            this.elem.style.cssText = `top: ${this.scaledBounds.y}px; left: ${this.scaledBounds.x}px; width: ${this.scaledBounds.width}px; height: ${this.scaledBounds.height}px`;

            this.detectionBox.width = this.scaledBounds.width;
            this.detectionBox.height = this.scaledBounds.height;
            this.detectionBox.style.cssText = `position:fixed; z-index:"999"`;
            this.elem.appendChild(this.detectionBox);
        };

        this.detectionBox.src = "icons/fulcrum_frame_new.svg";

        // this.color = randomColor();
        this.editMode = false;

        this.enabled = true;
        //update result ishowing after api call
        this.isShowing = { detection: true, result: true };

        // this.parent = parent;
        // this.canvas = this.parent.querySelector("canvas");
        this.parent.appendChild(this.elem);

        this.elem.onclick = async (e) => {
            switch (getState()) {
                case "result":
                    this.isShowing.detection = !this.isShowing.detection;
                    this.isShowing.result = !this.isShowing.result;
                    this.refreshCanvas();
                    break;
                case "edit":
                    this.scope.resetBoundingBoxes();
                    this.isShowing.detection = !this.isShowing.detection;
                    this.refreshCanvas();
                    break;
            }

            // if (getState() === "edit") {
            //     this.hide(this.detectionBox);
            //     this.isShowing.detection = !this.isShowing.detection;
            //     this.refreshCanvas();
            // }

            // const enabled = this.toggleEnabled();

            // if (enabled) {
            //     await this.regenerate();
            // }
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
        this.isShowing = { detection: enabled ? false : true, result: true };
    }

    setSwappedFace(canvas) {
        //your swapped face is the canvas
        const scaledBounds = this.canvasToViewport(
            this.cvBounds,
            this.canvas,
            this.parent
        );

        canvas.style.cssText = `position: fixed; top: ${scaledBounds.y}px; left: ${scaledBounds.x}px; width: ${scaledBounds.width}px; height: ${scaledBounds.height}px`;

        this.result = canvas;

        this.elem.appendChild(canvas);
    }

    getScaledBounds() {
        return this.canvasToViewport(this.cvBounds, this.canvas, this.parent);
    }

    canvasToViewport(bounds, canvas, parent) {
        let { x, y, width, height, points } = bounds;

        const parentWidth = parent.offsetWidth;
        const parentHeight = parent.offsetHeight;

        const xRatio = parentWidth / canvas.width;
        const yRatio = parentHeight / canvas.height;

        x *= xRatio;
        y *= yRatio;
        const widthScaled = width * xRatio;
        const heightScaled = height * yRatio;

        // Adjusting points object
        points.forEach((point) => {
            point._x *= xRatio;
            point._y *= yRatio;
        });
        const { _x, _y } = bounds.points;

        return {
            x,
            y,
            width: widthScaled,
            height: heightScaled,
            points: points,
        };
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
        if (!this.isShowing.detection) {
            this.hide(this.detectionBox);
        } else {
            this.show(this.detectionBox);
        }

        if (!this.isShowing.result) {
            this.hide(this.result);
        } else {
            this.show(this.result);
        }

        // if (getState() === "edit") {
        //     if (this.isShowing.detection) {
        //         this.hide(this.detectionBox);
        //     } else {
        //         this.show(this.detectionBox);
        //     }
        // }

        // this.updateCSS(this.elem);

        // const scaledBounds = this.canvasToViewport(
        //     this.cvBounds,
        //     this.canvas,
        //     this.parent
        // );

        // if (this.enabled) {
        //     const { x, y, width, height } = this.cvBounds;

        //     this.detectionBox.width = scaledBounds.width;
        //     this.detectionBox.height = scaledBounds.height;
        //     this.elem.appendChild(this.detectionBox);
        // }
    }
}
