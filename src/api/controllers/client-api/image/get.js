import { Image } from '../../../../models/index.js';

export default async (req, res) => {
    let status = true;
    let list = [];
    try {
        let skip = req.body.skip;
        list = await Image.find().skip(skip).limit(5).catch((err) => {
            console.log(err);
            status = false;
        });
    } catch (error) {
        console.log(error);
        status = false;
    }
    return res.status(200).json({
        resultMessage: { en: getText('en', '00089'), tr: getText('tr', '00089') },
        resultCode: '00089',
        status: status,
        img: list
    });

};
