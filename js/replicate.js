import { delay } from "/js/utils";
import { negative_prompt } from "./getPrompt";

export async function inPaint(canvas64, mask64, prompt, progressCB) {
    const formData = new FormData();
    //prompt gets age and gender and is generated here

    const size = 128;

    formData.append("prompt", prompt);
    // formData.append("num_inference_steps integer", 1);
    formData.append("edit_image", canvas64);
    formData.append("mask", mask64);
    formData.append("negative_prompt", negative_prompt);
    formData.append("width", size);
    formData.append("height", size);

    // formData.append("width", "256");
    // formData.append("height", 256);
    // formData.append(
    //     "negative_prompt",
    //     `deformed iris, deformed pupils, semi-realistic, cgi, 3d, render, sketch, cartoon, drawing, anime:1.4), text, close up, cropped, out of frame, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck, multiple head, lowres, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, watermark, blurry, multiple girls, multiple faces, canvas frame, cartoon, ((multiple head)), ((bad art)), ((extra limbs)), ((b&w)), wierd colors, (((duplicate))), ((morbid)), ((mutilated)), extra fingers, mutated hands, ((poorly drawn hands)), ((poorly drawn face)), (((mutation))), (((deformed))), ((ugly)), ((bad anatomy)), (((bad proportions))), cloned face, (((disfigured))), out of frame, gross proportions, (malformed limbs), ((missing arms)), ((missing legs)), (((extra arms))), (((extra legs))), (fused fingers), (too many fingers), (((long neck))), video game, tiling, poorly drawn feet, mutated, cross-eye, body out of frame, Humpbacked, shadow, nude, naked, NSFW, bad quality, low quality, fused fingers, poorly drawn face, too many fingers`
    // );

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
