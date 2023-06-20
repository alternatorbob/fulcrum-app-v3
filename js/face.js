// import { adjustdetectionBoxes } from "./utils";
import eventBus from "./EventBus.js";
import { Loader } from "./UI";
import {
    calculatePercentageChange,
    delay,
    getNumberFromString,
    scaleValueDown,
    scaleValueUp,
} from "./utils";
import { getState } from "./state";
import { getPrompt } from "./getPrompt.js";
import { featherEdges } from "./drawUtils.js";
import { globalControls } from "../globalControls.js";

export class Face {
    static instanceCount = 0;
    constructor(bounds, features, parent, scope) {
        this.offset = globalControls.faceFrameOffsetPercentage;

        Face.instanceCount++;
        this.scope = scope;
        this.parent = parent;
        this.canvas = this.parent.querySelector("canvas");

        this.cvBounds = bounds;

        this.features = features;

        this.elem = document.createElement("div");
        this.elem.className = "face";
        this.elem.id = `face-${Face.instanceCount}`;
        this.id = this.elem.id;

        this.scaledBounds = this.canvasToViewport(
            this.cvBounds,
            this.canvas,
            this.parent
        );

        this.squareCanvas;
        this.faceImage;
        this.faceImage;

        this.selectionBox = new Image();
        this.selectionBox.onload = () => {
            // const xyOffset = {
            //     x: scaleValueDown(this.scaledBounds.x, this.offset),
            //     y: scaleValueDown(this.scaledBounds.y, this.offset),
            // };

            // const whOffset = {
            //     w: scaleValueUp(this.scaledBounds.width, this.offset),
            //     h: scaleValueUp(this.scaledBounds.height, this.offset),
            // };

            // console.log(xyOffset, whOffset);

            this.elem.style.cssText = `top: ${this.scaledBounds.y}px; left: ${this.scaledBounds.x}px; width: ${this.scaledBounds.width}px; height: ${this.scaledBounds.height}px`;
            // this.elem.style.cssText = `top: ${xyOffset.y}px; left: ${xyOffset.x}px; width: ${whOffset.w}px; height: ${whOffset.h}px`;

            const { x, y, width, height } = this.cvBounds;
            this.selectionBox.width = this.scaledBounds.width;
            this.selectionBox.height = this.scaledBounds.height;
            this.selectionBox.style.cssText = `position:absolute; z-index:"999";`;
            this.elem.appendChild(this.selectionBox);
        };

        this.selectionBox.src = "icons/fulcrum_frame_new.svg";

        this.prompt = this.getPrompt(features);
        this.result = document.createElement("canvas");
        this.result.classList.add("result");

        this.faceEnabled = true;
        this.editMode = false;

        this.isShowing = { selection: true, result: true };

        this.parent.appendChild(this.elem);

        this.elem.onclick = async (e) => {
            switch (getState()) {
                case "result":
                    // this.faceEnabled = !this.faceEnabled;
                    this.toggleSelection();
                    this.toggleResult();
                    this.refreshCanvas();
                    break;
                case "edit":
                    this.scope.resetBoundingBoxes();

                    const id = e.target.id;
                    const number = getNumberFromString(id);

                    this.scope.setLastClickedFace(number);

                    this.toggleSelection();
                    this.refreshCanvas();
                    break;
            }
        };

        eventBus.addEventListener("toggleEnable", () => {
            this.refreshCanvas();
        });
    }

    async regenerate() {
        await delay(1000);
        this.color = randomColor();

        this.refreshCanvas();
    }

    setSelection(selected) {
        this.isShowing.selection = selected;
    }

    toggleFace() {
        this.showFace(!this.faceShown());
    }

    faceShown() {
        return this.faceEnabled;
    }

    showFace(enabled) {
        this.faceEnabled = enabled;
    }

    toggleSelection() {
        this.setSelection(!this.isSelected());
    }

    isSelected() {
        return this.isShowing.selection;
    }

    isResultShown() {
        return this.isShowing.result;
    }

    toggleResult() {
        this.showResult(!this.isResultShown());
    }

    showResult(shown) {
        this.isShowing.result = shown;
    }

    setEditMode(enabled) {
        this.editMode = enabled;

        if (enabled) {
            if (!this.isResultShown()) this.showFace(false);

            this.setSelection(!this.editMode);
            this.showResult(true);
        } else {
            const active = this.faceShown();

            if (active) {
                this.setSelection(true);
                this.showResult(true);
            } else {
                this.setSelection(false);
                this.showResult(false);
            }

            this.showFace(true);
        }
    }

    cropToSquare(canvas, bounds) {
        const { x, y, width, height } = bounds;

        const size = Math.max(width, height);

        const squareCanvas = document.createElement("canvas");
        squareCanvas.classList.add("squareCanvas");

        squareCanvas.width = size;
        squareCanvas.height = size;

        const ctx = squareCanvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(canvas, x, y, size, size, 0, 0, size, size);

        return squareCanvas;
    }

    createScaledCanvas(canvas) {
        const size = 512;
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = tempCanvas.height = size;

        const ctx = tempCanvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(canvas, 0, 0, size, size);

        return tempCanvas;
    }

    setRegeneratedFace(image) {
        console.log("SET RENGENERATED FACE", image);
    }

    setSwappedFace(image) {
        console.log("SET SWAPPED FACE", image);

        let size = Math.max(this.scaledBounds.width, this.scaledBounds.height);

        const percentage = calculatePercentageChange(
            this.scaledBounds.width,
            this.scaledBounds.height
        );

        const scaleFactor =
            (this.scaledBounds.width - this.scaledBounds.height) / 2;

        const scaledHeight = scaleValueDown(
            this.scaledBounds.height,
            percentage
        );

        // console.log("size before: ", size);
        // size = scaleValueDown(size, percentage);
        // console.log("size after: ", size);

        const ctx = this.result.getContext("2d");
        // ctx.imageSmoothingEnabled = true;

        this.result.id = `result-${Face.instanceCount}`;

        this.result.width = size;
        this.result.height = size;

        // this.result.style.cssText = `position: absolute; top: 0px; left: 0px; width: ${this.scaledBounds.width}px; height: ${this.scaledBounds.height}px;`;
        this.result.style.cssText = `position: absolute; top: 0px; left: 0px; width: ${size}px; height: ${size}px;`;

        // featherEdges(this.result);

        ctx.save();
        // ctx.globalCompositeOperation = "source-atop";

        ctx.drawImage(
            image,
            0,
            0,
            image.width,
            image.height,
            0,
            0,
            this.result.width,
            this.result.height
        );

        ctx.restore();

        this.result.crossOrigin = "anonymous";
        this.elem.insertBefore(this.result, this.elem.firstChild);
    }

    getPrompt(features) {
        return getPrompt(features);
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

    updateCSS(elem) {
        this.elem.classList.toggle("hidden", !this.faceEnabled);
        this.selectionBox.classList.toggle("hidden", !this.isShowing.selection);
        this.result.classList.toggle("hidden", !this.isShowing.result);

        elem.classList.toggle("edit", this.editMode);
        elem.style.cssText = `top: ${this.scaledBounds.y}px; left: ${this.scaledBounds.x}px; width: ${this.scaledBounds.width}px; height: ${this.scaledBounds.height}px`;

        return this.scaledBounds;
    }

    refreshCanvas() {}

    render(ctx) {
        this.updateCSS(this.elem);
    }
}
