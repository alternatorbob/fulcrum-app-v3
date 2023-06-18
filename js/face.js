// import { adjustdetectionBoxes } from "./utils";
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
    constructor(bounds, parent, scope) {
        Face.instanceCount++;
        this.bounds = bounds;
        this.scope = scope;
        this.parent = parent;
        this.canvas = this.parent.querySelector("canvas");

        this.cvBounds = bounds;

        this.elem = document.createElement("div");
        this.elem.className = "face";
        this.elem.id = `face-${Face.instanceCount}`;

        this.squareCanvas;

        console.log(bounds);

        this.selectionBox = new Image();
        this.selectionBox.onload = () => {
            const scaledBounds = this.canvasToViewport(
                this.cvBounds,
                this.canvas,
                this.parent
            );

            this.elem.style.cssText = `top: ${scaledBounds.y}px; left: ${scaledBounds.x}px; width: ${scaledBounds.width}px; height: ${scaledBounds.height}px`;

            const { x, y, width, height } = this.cvBounds;
            this.selectionBox.width = scaledBounds.width;
            this.selectionBox.height = scaledBounds.height;
            this.selectionBox.style.cssText = `position:absolute; z-index:"999"`;
            this.elem.appendChild(this.selectionBox);
        };

        this.selectionBox.src = "icons/fulcrum_frame_new.svg";

        this.result = null;

        // this.color = randomColor();

        this.faceEnabled = true;
        this.editMode = false;

        this.isShowing = { selection: true, result: true };



        // this.parent = parent;
        // this.canvas = this.parent.querySelector("canvas");
        console.log(this.parent);
        this.parent.appendChild(this.elem);

        this.elem.onclick = async (e) => {
            switch (getState()) {
                case "result":
                    // this.faceEnabled = !this.faceEnabled;
                    this.toggleSelection()
                    this.toggleResult()
                    this.refreshCanvas()
                    break;
                case "edit":
                    this.scope.resetBoundingBoxes();

                    this.toggleSelection()
                    this.refreshCanvas();
                    break;
            }

            // if (getState() === "edit") {
            //     this.hide(this.selectionBox);
            //     this.isShowing.selection = !this.isShowing.selection;
            //     this.refreshCanvas();
            // }

            // const enabled = this.toggleEnabled();

            // if (enabled) {
            //     await this.regenerate();
            // }
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
        this.showFace(!this.faceShown())
    }

    faceShown() {
        return this.faceEnabled
    }

    showFace(enabled) {
        this.faceEnabled = enabled;
    }

    toggleSelection() {
        this.setSelection(!this.isSelected())
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

            if (!this.isResultShown()) this.showFace(false)

            this.setSelection(!this.editMode)
            this.showResult(true);
        } else {

            const active = this.faceShown()

            if(active) {
                this.setSelection(true);
                this.showResult(true);
                
            } else {
                this.setSelection(false);
                this.showResult(false);
            }

            this.showFace(true);
        }

    }

    setSwappedFace(canvas) {
        console.log("SET SWAPPED FACE", canvas);

        const scaledBounds = this.canvasToViewport(
            this.cvBounds,
            this.canvas,
            this.parent
        );

        const size = Math.max(scaledBounds.width, scaledBounds.height);
       
        canvas.style.cssText = `position: absolute; top:0; left: 0; width: ${size}px; height: ${size}px;`;

        this.result = canvas;
        this.elem.appendChild(canvas);
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

    autoSquare() {
        return this.cropToSquare(this.canvas, this.cvBounds);
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
            0,
            0,
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

        // if (this.editMode) {
        // }
        this.elem.classList.toggle("hidden", !this.faceEnabled);
        this.selectionBox.classList.toggle("hidden", !this.isShowing.selection);
        this.result.classList.toggle("hidden", !this.isShowing.result);

        elem.classList.toggle("edit", this.editMode);
        elem.style.cssText = `top: ${bounds.y}px; left: ${bounds.x}px; width: ${bounds.width}px; height: ${bounds.height}px`;

        return bounds;
    }

    refreshCanvas() { }

    render(ctx) {


        // if (getState() === "edit") {
        //     if (this.isShowing.selection) {
        //         this.hide(this.selectionBox);
        //     } else {
        //         this.show(this.selectionBox);
        //     }
        // }

        this.updateCSS(this.elem);

        // const scaledBounds = this.canvasToViewport(
        //     this.cvBounds,
        //     this.canvas,
        //     this.parent
        // );

        // if (this.enabled) {
        //     const { x, y, width, height } = this.cvBounds;

        //     this.selectionBox.width = scaledBounds.width;
        //     this.selectionBox.height = scaledBounds.height;
        //     this.elem.appendChild(this.selectionBox);
        // }
    }
}
