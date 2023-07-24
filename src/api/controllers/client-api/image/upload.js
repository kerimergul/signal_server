import { Image } from '../../../../models/index.js';

export default async (req, res) => {
    let status = true;
    try {
        console.log(req.body);
        let img = req.body.img;
        const image = new Image({
            data: JSON.stringify(img),
        })
        console.log(image);
        await image.save().catch((err) => {
            console.log(err);
            status = false;
        })

    } catch (error) {
        status = false;
        console.log(error);
    }
    return res.status(200).json({
        status: status,
    });

};
