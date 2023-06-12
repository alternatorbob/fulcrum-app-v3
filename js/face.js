import { delay } from "./utils";

function randomColor() {
    return (
        "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
    );
}

export class Face {
    constructor(bounds, parent) {
        console.log(parent);
        this.cvBounds = bounds;
        this.elem = document.createElement("div");
        this.elem.className = "face";

        this.color = randomColor();
        this.editMode = false;

        this.elem.onclick = async () => {
            const enabled = this.toggleEnabled();

            if (enabled) {
                await this.regenerate();
            }
        };

        this.enabled = true;

        this.parent = parent;
        this.canvas = this.parent.querySelector("canvas");

        this.parent.appendChild(this.elem);
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

        // console.log(bounds.x, canvas.width);
        x *= xRatio;
        y *= yRatio;
        const widthScaled = width * xRatio;
        const heightScaled = height * yRatio;

        return { x, y, width: widthScaled, height: heightScaled };
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
    }

    refreshCanvas() {}

    render(ctx) {
        this.updateCSS(this.elem);

        if (this.enabled) {
            const { x, y, width, height } = this.cvBounds;
            ctx.fillStyle = this.color;
            ctx.fillRect(x, y, width, height);
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
