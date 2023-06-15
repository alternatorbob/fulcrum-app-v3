export class Popup {
    constructor(switchActiveView) {
        this.switchActiveView = switchActiveView;
        this.navBar = new NavBar(switchActiveView);
        this.popup = document.createElement("div");
        this.textContainer = document.createElement("div");
        this.textArea = document.createElement("textarea");

        this.initialize();
    }

    initialize() {
        this.popup.style.position = "fixed";
        this.popup.style.left = "0";
        this.popup.style.top = "0";
        this.popup.style.width = "100%";
        this.popup.style.height = "100%";
        this.popup.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        this.popup.style.display = "none";
        this.popup.style.zIndex = "9999";
        this.popup.style.transition = "transform 0.3s ease-in-out";
        this.popup.style.transform = "translateY(100%)";

        this.textContainer.style.position = "absolute";
        this.textContainer.style.left = "0";
        this.textContainer.style.top = "0";
        this.textContainer.style.width = "100%";
        this.textContainer.style.height = "80%";
        this.textContainer.style.display = "flex";
        this.textContainer.style.alignItems = "center";
        this.textContainer.style.justifyContent = "center";

        this.textArea.style.width = "80%";
        this.textArea.style.height = "80%";
        this.textArea.value =
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

        this.popup.appendChild(this.navBar.element);
        this.textContainer.appendChild(this.textArea);
        this.popup.appendChild(this.textContainer);
        document.body.appendChild(this.popup);
    }

    open() {
        this.popup.style.display = "block";
        setTimeout(() => {
            this.popup.style.transform = "translateY(0)";
        }, 100);
    }

    close() {
        this.popup.style.transform = "translateY(100%)";
        setTimeout(() => {
            this.popup.style.display = "none";
        }, 300);
    }
}
