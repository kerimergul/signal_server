import { Image } from '../../../../models/index.js';

export default async (req, res) => {
    let img = req.body.img;
    let status = true;

    const image = new Image({
        data: JSON.stringify(img),
    })
    await image.save().catch((err) => {
        console.log(err);
        status = false;
    })

    return res.status(200).json({
        resultMessage: { en: getText('en', '00089'), tr: getText('tr', '00089') },
        resultCode: '00089',
        status: status,
    });

};
