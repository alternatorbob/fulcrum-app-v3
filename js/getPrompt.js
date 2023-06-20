export function getPrompt(promptDetails) {
    const { gender, age, expression } = promptDetails;

    console.log(gender, age, expression);

    let myPrompt =
        gender === "male"
            ? `A photorealistic man's portrait, is looking ${expression}, eyes are open, he`
            : `A woman's face, is looking ${expression}, eyes are open, she`;

    myPrompt += ` is around ${Math.round(
        age
    )} years old, (((detailed faces))), (((detailed facial features))), ((highres)), RAW photo 8k uhd, dslr, 
    ::Shot on a Canon EOS 5D Mark IV with a 100mm f/1.4L IS USM lens, 
    capturing rich tonality, exceptional sharpness, good contrast,
     ::1 High-resolution ::Wallpaper ratio, high-resolution, 
     :: --ar 16:9 --q 5 --v 5 --s 750`;

    return myPrompt;
}

export const negative_prompt = `
    eyes closed, deformed iris, deformed pupils, deformed eyelids, crooked eyes,
    bad teeth, crooked teeth,
    nude, naked, NSFW,
    bad quality, low quality, poorly drawn face,
    worst quality, low quality, jpeg artifacts,
    ugly, duplicate, morbid, mutilated, poorly drawn face, mutation, deformed,
    blurry, dehydrated, crooked face,
    cloned face, disfigured,
    canvas frame, cartoon, ((multiple head)), ((bad art)), ((b&w)), weird colors,
    (((duplicate))), ((morbid)), ((mutilated)),
    ((poorly drawn face)), (((mutation))), (((deformed))), ((ugly)),
    (((bad proportions))), cloned face, (((disfigured))), 
`;
