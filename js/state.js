export const states = {
    HOME: "home",
    DETECTIONS: "detections",
    RESULT: "result",
    EDIT: "edit",
    EDITPROMPT: "edit-prompt",
};

let currState = states.HOME;

export function changeState(newState) {
    currState = newState;
}

export function isState(state) {
    return currState === state;
}

export function getState() {
    return currState;
}
