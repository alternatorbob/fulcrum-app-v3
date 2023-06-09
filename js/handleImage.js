import { switchActiveView } from "../main";
import { getDetections } from "./faceDetectionSwap";
import { viewModule } from "./objectModule";
import { Loader, switchView } from "./ui";

export async function onImageUpload(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    const loader = new Loader("uploading");
    loader.show();

    reader.onload = (e) => {
        const img = new Image();
        img.onload = async () => {
            const canvas = document.querySelector("#image--canvas");
            const ctx = canvas.getContext("2d");
            const aspectRatio = img.width / img.height;

            // canvas.width = window.innerWidth;
            // canvas.height = canvas.width / aspectRatio;
            img.width = canvas.width = window.innerWidth;
            img.height = canvas.height = canvas.width / aspectRatio;
            ctx.save();
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            loader.hide();
        };
        img.src = e.target.result;
    };
    if (file) {
        reader.readAsDataURL(file);
        await getDetections(file);

        switchView("detections");
        viewModule.setValue("detections");
        switchActiveView();
    }
}
