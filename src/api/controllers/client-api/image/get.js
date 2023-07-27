import { Image } from '../../../../models/index.js';

export default async (req, res) => {
    let status = true;
    let list = [];
    try {
        let skip = req.body.skip;
        console.time('countOf')
        const countOf = await Image.countDocuments();
        if (skip >= countOf) {
            skip = 0;
        }
        console.timeEnd('countOf')

        console.time('image')
        list = await Image.findOne().sort({ createdAt: -1 }).skip(skip).catch((err) => {
            console.log(err);
            status = false;
        });
        console.timeEnd('image')
    } catch (error) {
        console.log(error);
        status = false;
    }
    return res.status(200).json({
        status: status,
        img: list
    });

};
