export class IntroTransition {
    constructor() {
        this.logoDiv = document.getElementsByClassName("logo"); // Replace 'logo' with the ID of your logo div
        this.fadeDivId = "fade"; // ID of the fade div
        this.fadeDiv = null;

        this.accelerometerSupported = false;
        this.accelerationListener = null;
        this.transitionTimeout = null;

        this.init();
    }

    init() {
        if (
            typeof DeviceMotionEvent !== "undefined" &&
            typeof DeviceMotionEvent.requestPermission === "function"
        ) {
            DeviceMotionEvent.requestPermission().then((permissionState) => {
                if (permissionState === "granted") {
                    this.accelerometerSupported = true;
                    this.addAccelerometerListener();
                }
            });
        } else if (window.DeviceMotionEvent) {
            this.accelerometerSupported = true;
            this.addAccelerometerListener();
        }

        this.addAccelerometerListener();

        // Add an event listener to detect touch or mouse click
        document.addEventListener("click", this.startTransition.bind(this));
        document.addEventListener(
            "touchstart",
            this.startTransition.bind(this)
        );

        // // Create the fade div
        this.createFadeDiv();
    }

    createFadeDiv() {
        this.fadeDiv = document.createElement("div");
        this.fadeDiv.id = this.fadeDivId;
        document.body.appendChild(this.fadeDiv);
    }

    addAccelerometerListener() {
        this.accelerationListener = (event) => {
            const acceleration = event.accelerationIncludingGravity;

            // Calculate the total acceleration vector
            const accelerationMagnitude = Math.sqrt(
                acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2
            );

            // If the total acceleration exceeds the threshold, start the transition
            if (accelerationMagnitude > 1.5) {
                this.startTransition();
            }
        };

        window.addEventListener("devicemotion", this.accelerationListener);
    }

    removeAccelerometerListener() {
        if (this.accelerationListener) {
            window.removeEventListener(
                "devicemotion",
                this.accelerationListener
            );
            this.accelerationListener = null;
        }
    }

    startTransition() {
        // Remove the accelerometer listener and clear the transition timeout
        this.removeAccelerometerListener();
        clearTimeout(this.transitionTimeout);

        // Move the logo div to the top
        this.logoDiv.style.top = "0";

        // Fade out the logo and fade div
        this.logoDiv.style.opacity = "0";
        this.fadeDiv.style.opacity = "0";

        // Uncover the rest of the elements by fading in the fade div
        setTimeout(() => {
            this.fadeDiv.style.display = "none";
        }, 1000);
    }
}
