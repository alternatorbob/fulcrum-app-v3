export function createViews(states) {
    const appContainer = document.querySelector("#app");
    let isFirst = true; // Variable to track the first div

    for (let key in states) {
        const myDiv = document.createElement("div");
        myDiv.id = `${states[key]}`;
        if (!isFirst) {
            myDiv.classList.add("hidden"); // Add "hidden" class to all except the first div
        }
        isFirst = false; // Update the flag after the first div
        appContainer.appendChild(myDiv);
    }
}

export class Loader {
    constructor(text) {
        this.text = text;
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
        const textContainer = document.createElement("div");

        textContainer.style.position = "absolute";
        textContainer.style.zIndes = "1000";
        textContainer.style.pointerEvents = "none";
        textContainer.style.top = "65%";
        textContainer.style.left = "65%";
        textContainer.style.transform = "translate(-50%, -50%)";

        textContainer.appendChild(textNode);
        loaderDiv.appendChild(textContainer);

        this.loaderElement = loaderDiv;

        return loaderDiv;
    }

    show() {
        console.log("should show loader");
        if (!this.loaderElement) {
            this.loaderElement = this.generateHTML();
            document.body.appendChild(this.loaderElement);
        }

        this.loaderElement.style.fontSize = "10px";
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
