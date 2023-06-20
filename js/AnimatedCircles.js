export class AnimatedCircles {
    constructor(parent, bounds) {
        this.container = parent;

        this.styles = `
        .circle {
          position: absolute;
          transform: translate(-50%, -50%);
        }
    
        .inner-circle {
          border-radius: 50%;
          background-color: blue;
        }
      `;

        this.styleElement = document.createElement("style");
        this.styleElement.innerHTML = this.styles;
        document.head.appendChild(this.styleElement);

        this.cvBounds = bounds;
        this.points = bounds.points._positions;

        this.circles = [];
        this.createCircles(bounds);
    }

    createCircles(bounds) {
        const faceX = this.cvBounds.x;
        const faceY = this.cvBounds.y;

        const shiftedPositions = [...this.cvBounds.points.positions];
        shiftedPositions.forEach((point) => {
            point._x -= faceX;
            point._y -= faceY;
        });

        shiftedPositions.forEach((object, index) => {
            const div = document.createElement("div");
            div.classList.add("circle");
            div.style.left = object.x + "px";
            div.style.top = object.y + "px";
            this.container.appendChild(div);

            const circle = document.createElement("div");
            circle.classList.add("inner-circle");
            div.appendChild(circle);

            this.circles.push({
                div,
                circle,
                startTime: performance.now(),
                interval: 500 + index * 200, // Adjust the interval based on the desired animation speed for each circle
            });
        });

        this.animateCircles();
    }

    animateCircles() {
        const animationFrame = () => {
            const currentTime = performance.now();

            this.circles.forEach(({ circle, startTime, interval }) => {
                const elapsedTime = currentTime - startTime;
                const size =
                    20 + Math.sin((elapsedTime / interval) * Math.PI * 2) * 10; // Adjust the size and amplitude of the sine wave as needed
                circle.style.width = size + "px";
                circle.style.height = size + "px";
            });

            requestAnimationFrame(animationFrame);
        };

        requestAnimationFrame(animationFrame);
    }

    show() {
        this.container.style.display = "block";
        this.circles.forEach(({ div }) => {
            div.style.display = "block";
        });
    }

    hide() {
        this.container.style.display = "none";
        this.circles.forEach(({ div }) => {
            div.style.display = "none";
        });
    }
}
