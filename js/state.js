export const states = {
    HOME: "home",
    DETECTIONS: "detections",
    RESULT: "result",
    EDIT: "edit",
    EDITSELECTED: "edit-selected",
    REGENERATED: "regenerated",
};

let currState = states.HOME;
let prevState = null;

export function changeState(newState) {
    document.body.dataset.state = newState;

    prevState = currState;
    currState = newState;
}

export function isState(state) {
    return currState === state;
}

export function getState() {
    return currState;
}

export function getPreviousState() {
    return prevState;
}
