import { Image } from '../../../../models/index.js';

export default async (req, res) => {
    let skip = req.body.skip;
    let status = true;

    const list = await Image.find().skip(skip).limit(5).catch((err) => {
        console.log(err);
        status = false;
    });

    return res.status(200).json({
        resultMessage: { en: getText('en', '00089'), tr: getText('tr', '00089') },
        resultCode: '00089',
        status: status,
        img: list
    });

};
