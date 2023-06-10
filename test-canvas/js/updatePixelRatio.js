let remove = null;

export const updatePixelRatio = () => {
    if (remove != null) {
        remove();
    }
    let mqString = `(resolution: ${window.devicePixelRatio}dppx)`;
    let media = matchMedia(mqString);
    media.addEventListener("change", updatePixelRatio);
    remove = function () {
        media.removeEventListener("change", updatePixelRatio);
    };

    console.log("devicePixelRatio: " + window.devicePixelRatio);
};
