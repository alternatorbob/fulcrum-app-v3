export const objectModule = (() => {
    let myObject = null;

    function setValue(newValue) {
        myObject = newValue;
    }

    function getValue() {
        return myObject;
    }

    // Expose only the necessary functions
    return {
        setValue,
        getValue,
    };
})();

export const viewModule = (() => {
    let myView = "home";

    function setValue(newValue) {
        myView = newValue;
    }

    function getValue() {
        return myView;
    }

    // Expose only the necessary functions
    return {
        setValue,
        getValue,
    };
})();
