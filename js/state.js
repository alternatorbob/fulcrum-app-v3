export const states = {
    HOME: "home",
    DETECTIONS: "detections",
    RESULT: "result",
    EDIT: "edit",
    EDITSELECTED: "edit-selected",
    REGENERATED: "regenerated",
};

let currState = states.HOME;

export function changeState(newState) {
    document.body.dataset.state = newState;

    currState = newState;
}

export function isState(state) {
    return currState === state;
}

export function getState() {
    return currState;
}
