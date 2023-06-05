import { handleViewChange } from "../main";
// import "../css/loader.css";
export let activeView = "home";

export function switchView(destination) {
    if (activeView == "edit-prompt") {
        document.querySelector(".popup-container").classList.remove("active");
    } else {
        let viewSelector = document.querySelector(`.${activeView}`);
        viewSelector.classList.add("hidden");
        viewSelector = document.querySelector(`.${destination}`);
        viewSelector.classList.remove("hidden");
    }
    activeView = destination;
    handleViewChange();
}

export function moveCanvasLayers(destination) {
    const photoContainer = document.querySelector("#photo--input--container");
    const containerParent = photoContainer.parentNode;
    const destinationDiv = document.querySelector(`.${destination}`);

    destinationDiv.appendChild(photoContainer);
    // containerParent.removeChild(photoContainer);
}

export class MessageDiv {
    constructor(message) {
        this.message = message;
        this.div = document.createElement("div");
        this.div.style.height = "100px";
        this.div.style.width = "100%";
        this.div.style.position = "fixed";
        this.div.style.top = "-100px";
        this.div.style.left = "0";
        this.div.style.display = "flex";
        this.div.style.justifyContent = "center";
        this.div.style.alignItems = "center";
        this.div.style.fontSize = "2em";
        this.div.style.opacity = "0";
        this.div.style.zIndex = "9999";
        this.div.style.pointerEvents = "none";
        this.div.style.userSelect = "none";
        this.div.innerText = this.message;
        document.body.appendChild(this.div);
    }

    show() {
        this.div.style.transition = "top 0.5s, opacity 0.5s";
        this.div.style.top = "0";
        this.div.style.opacity = "1";
    }

    hide() {
        this.div.style.transition = "top 0.5s, opacity 0.5s";
        this.div.style.top = "-100px";
        this.div.style.opacity = "0";
    }

    autoHide() {
        this.show();
        setTimeout(() => {
            this.hide();
        }, 1000);
    }
}

export class Loader {
    constructor(text) {
        this.text = "loading..";
        this.loaderElement = null;
    }

    generateHTML() {
        const loaderDiv = document.createElement("div");
        loaderDiv.className = "lds-spinner";

        for (let i = 0; i < 16; i++) {
            const loaderChild = document.createElement("div");
            loaderDiv.appendChild(loaderChild);
        }

        const textNode = document.createTextNode(this.text);
        loaderDiv.appendChild(textNode);

        this.loaderElement = loaderDiv;

        return loaderDiv;
    }

    show() {
        if (!this.loaderElement) {
            this.loaderElement = this.generateHTML();
            document.body.appendChild(this.loaderElement);
        }

        this.loaderElement.style.fontSize = "16px";
        this.loaderElement.style.opacity = "0";
        this.loaderElement.style.transform = "scale(0.6)";
        this.loaderElement.style.transition = "opacity 0.3s, transform 0.3s";
        this.loaderElement.style.pointerEvents = "none";
        this.loaderElement.style.position = "fixed";
        this.loaderElement.style.bottom = "80px";
        this.loaderElement.style.left = "47.55%";
        this.loaderElement.style.transform = "translateX(-50%) scale(0.6)";

        setTimeout(() => {
            this.loaderElement.style.opacity = "1";
            this.loaderElement.style.transform = "translateX(-50%) scale(1)";
        }, 10);
    }

    hide() {
        if (!this.loaderElement) {
            return;
        }

        this.loaderElement.style.opacity = "0";
        this.loaderElement.style.transform = "translateX(-50%) scale(0.6)";

        setTimeout(() => {
            if (this.loaderElement.parentNode) {
                this.loaderElement.parentNode.removeChild(this.loaderElement);
            }
        }, 300);
    }
}

// export class Loader {
//     constructor() {
//         this.loaderDiv = document.createElement("div");
//         this.loaderDiv.innerText = "Loading...";
//         this.loaderDiv.style = `
//         position: fixed;
//         top: 0;
//         left: 0;
//         width: 100%;
//         height: 100%;
//         background-color: rgba(0, 0, 0, 0.5);
//         display: flex;
//         justify-content: center;
//         align-items: center;
//         z-index: 9999;
//         color: white;
//         font-size: 24px;
//       `;
//         document.body.appendChild(this.loaderDiv);
//     }

//     show() {
//         this.loaderDiv.style.display = "flex";
//     }

//     hide() {
//         this.loaderDiv.style.display = "none";
//     }
// }

export class CircleAnimation {
    constructor(x, y) {
        // Create a canvas element
        this.canvas = document.querySelector("#detections--canvas");
        this.ctx = this.canvas.getContext("2d");

        this.x = x;
        this.y = y;

        // Animation ID for requestAnimationFrame
        this.animationId = null;
    }

    startAnimation() {
        // Start the animation loop
        this.animate();
    }

    stopAnimation() {
        // Stop the animation loop
        cancelAnimationFrame(this.animationId);

        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    animate() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw circles for each point

        // Calculate the radius based on a sine wave
        const radius = 20 + 10 * Math.sin(Date.now() / 200); // Adjust amplitude and frequency as desired

        // Calculate the center position
        const centerX = this._x;
        const centerY = this._y;

        // Draw the circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        this.ctx.strokeStyle = "black";
        this.ctx.fillStyle = "transparent";
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.closePath();

        // Request the next animation frame
        this.animationId = requestAnimationFrame(() => this.animate());
    }
}
