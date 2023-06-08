export const objectModule = (() => {
    let myObject = null;

    function setObjectValue(newValue) {
        myObject = newValue;
    }

    function getObjectValue() {
        return myObject;
    }

    // Expose only the necessary functions
    return {
        setObjectValue,
        getObjectValue,
    };
})();

export const viewModule = (() => {
    let myView = null;

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
