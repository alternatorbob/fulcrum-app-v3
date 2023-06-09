export const states = {
    EDIT: 'edit',
    IDLE: 'idle'
}

let currState = states.IDLE


export function changeState(newState) {
    currState = newState
}

export function isState(state) {
    return currState === state
}

export function getState() {
    return currState
}