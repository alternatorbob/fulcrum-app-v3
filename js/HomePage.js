class DivComponent {
    constructor(tagName, classNames = [], attributes = {}) {
        this.element = document.createElement(tagName);
        this.element.classList.add(...classNames);
        this.setAttributes(attributes);
    }

    setAttributes(attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
            this.element.setAttribute(key, value);
        });
    }

    appendChild(child) {
        this.element.appendChild(child);
    }
}

class ImageComponent extends DivComponent {
    constructor(src, alt, style = {}) {
        super("img");
        this.element.src = src;
        this.element.alt = alt;
        this.setAttributes(style);
    }
}

class SpanComponent extends DivComponent {
    constructor(text, style = {}) {
        super("span");
        this.element.textContent = text;
        this.setAttributes(style);
    }
}

export class HomePage {
    constructor() {
        this.container = null;
    }

    createDivs() {
        // Create the 'home page' div
        const homePageDiv = new DivComponent("div", ["home"], {
            style: "display: flex; flex-direction: column; align-items: center; height: 100vh;",
        });

        // Create the 'logo' div
        const logoDiv = new DivComponent("div", ["logo"], {
            style: "margin-top: 60px",
        });

        const logoImg = new ImageComponent("/icons/fulcrum_logo.svg", "", {
            style: "width: 5em",
        });

        logoDiv.appendChild(logoImg.element);
        homePageDiv.appendChild(logoDiv.element);

        // Create the 'home-screen-buttons' div
        const buttonsDiv = new DivComponent("div", ["home-screen-buttons"], {});

        // Create the first 'camera-button' div
        const cameraButtonDiv1 = new DivComponent("div", ["camera-button"], {
            style: 'display: "flex"; flexDirection: "column"; alignItems: "center"; width: "38vw";',
        });

        const label1 = new DivComponent("label", ["upload-btn"], {
            for: "upload-input",
        });

        const uploadImg1 = new ImageComponent("icons/Upload_Icon.svg", "", {
            style: "height: 28px",
            class: "upload-button",
        });

        const input1 = new DivComponent("input", [], {
            id: "upload-input",
            type: "file",
            accept: "image/*",
            style: "display: none",
        });

        const span1 = new SpanComponent("Upload", {
            style: "margin-top: 6px; color: #8c8c8c; font-size: 0.8em",
        });

        label1.appendChild(uploadImg1.element);
        cameraButtonDiv1.appendChild(label1.element);
        cameraButtonDiv1.appendChild(input1.element);
        cameraButtonDiv1.appendChild(span1.element);
        buttonsDiv.appendChild(cameraButtonDiv1.element);

        // Create the second 'camera-button' div
        const cameraButtonDiv2 = new DivComponent("div", ["camera-button"], {
            style: 'display: "flex"; flex-direction: "column"; align-items: "center"; width: "38vw";',
        });

        const label2 = new DivComponent("label", ["upload-btn"], {
            for: "camera-input",
        });

        const uploadImg2 = new ImageComponent("icons/Camera_Icon.svg", "", {
            style: "height: 28px",
            class: "upload-button",
        });

        const input2 = new DivComponent("input", [], {
            id: "camera-input",
            type: "file",
            accept: "image/*",
            capture: "environment",
            style: "display: none",
        });

        const span2 = new SpanComponent("Camera", {
            style: "margin-top: 6px; color: #8c8c8c; font-size: 0.8em",
        });

        label2.appendChild(uploadImg2.element);
        cameraButtonDiv2.appendChild(label2.element);
        cameraButtonDiv2.appendChild(input2.element);
        cameraButtonDiv2.appendChild(span2.element);
        buttonsDiv.appendChild(cameraButtonDiv2.element);

        homePageDiv.appendChild(buttonsDiv.element);

        // Append the created divs to the page body
        this.container = document.querySelector("#app");
        this.container.appendChild(homePageDiv.element);
    }

    emptyInputFiles() {
        const uploadInput = document.getElementById("upload-input");
        const cameraInput = document.getElementById("camera-input");

        if (uploadInput) {
            uploadInput.value = "";
        }

        if (cameraInput) {
            cameraInput.value = "";
        }
    }

    inputChangeListeners() {
        const uploadInput = document.getElementById("upload-input");
        const cameraInput = document.getElementById("camera-input");

        const onImageUpload = async (file) => {
            // Perform the necessary actions when an image is uploaded
            // Example: Handle the file upload and processing
        };

        if (uploadInput) {
            uploadInput.addEventListener("change", async (event) => {
                const file = event.target.files[0];
                await onImageUpload(file);
            });
        }

        if (cameraInput) {
            cameraInput.addEventListener("change", async (event) => {
                const file = event.target.files[0];
                await onImageUpload(file);
            });
        }
    }
}
