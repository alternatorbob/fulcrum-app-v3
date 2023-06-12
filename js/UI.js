export function createViews(states) {
    console.log(states);
    const appContainer = document.querySelector("#app");
    let isFirst = true; // Variable to track the first div

    for (let key in states) {
        const myDiv = document.createElement("div");
        myDiv.id = `${states[key]}`;
        if (!isFirst) {
            myDiv.classList.add("hidden"); // Add "hidden" class to all except the first div
        }
        isFirst = false; // Update the flag after the first div
        appContainer.appendChild(myDiv);
    }
}
