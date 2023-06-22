import { globalControls } from "../globalControls";
import { delay } from "./utils";
import { negative_prompt } from "./getPrompt";

export async function inPaint(canvas64, mask64, prompt, progressCB) {
    const formData = new FormData();

    const size = globalControls.resultResolution;

    formData.append("prompt", prompt);
    // formData.append("num_inference_steps integer", 1);
    formData.append("edit_image", canvas64);
    formData.append("mask", mask64);
    formData.append("negative_prompt", negative_prompt);
    formData.append("width", size);
    formData.append("height", size);

    // Post via axios or other transport method
    // fetch post formdata
    const { id } = await fetch("/api/inpaint", {
        method: "POST",
        body: formData,
    }).then((res) => res.json());

    let succeeded = false;
    let output;

    while (!succeeded) {
        const data = await fetch(`/api/${id}`).then((res) => res.json());

        // succeeded = true;
        if (data.status === "succeeded") {
            succeeded = true;
            output = data.output[0];

            break;
        } else {
            progressCB(data.logs);
        }

        await delay(750);
    }

    return output;
}
