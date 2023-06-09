import { delay } from '../js/utils';
import './main.css'
import { Photo } from "./photo";
import {changeState, states, getState} from './state.js'
const app = document.querySelector('#app');
const photoApp = new Photo(app);

photoApp.getFaces('./vertical.jpg').then(async () => {
    await delay(2000)
    changeState(states.EDIT)
    photoApp.setEditMode(getState())
})



