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
