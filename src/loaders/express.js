import express from 'express'
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import helmet from 'helmet';
import { prefix } from './../config/index.js';
import routes from './../api/routes/index.js';
import { rateLimiter } from '../api/middlewares/index.js';
import { jwtSecretKey } from '../config/index.js';
import bodyParser from 'body-parser';
import NodeCache from "node-cache";
import { Image } from "../models/index.js";

export default (app) => {
  process.on('uncaughtException', async (error) => {
    // console.log(error);
  });

  process.on('unhandledRejection', async (ex) => {
    // console.log(ex);
  });

  if (!jwtSecretKey) {
    process.exit(1);
  }

  app.enable('trust proxy');
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(morgan('dev'));
  app.use(helmet());
  app.use(compression());
  app.use(express.static('public'));
  app.disable('x-powered-by');
  app.disable('etag');

  app.use(rateLimiter);
  // app.use(prefix, routes);
  const cache = new NodeCache({ stdTTL: 15, deleteOnExpire: false });


  const setCache = async () => {
    try {
      const list = await Image.find({});
      if (list.length > 0) {
        for (let i = 0; i < list.length; i++) {
          const image = list[i];
          cache.set(i, image);
        }
      }
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  const verifyCache = async (req, res, next) => {
    try {
      const countOf = await Image.countDocuments();
      if (req.body.skip >= countOf) {
        req.body.skip = req.body.skip % countOf;
      }
      if (cache.has(req.body.skip)) {
        return res.status(200).json({
          status: true,
          img: cache.get(req.body.skip),
        })
      }
      return next();
    } catch (err) {
      throw new Error(err);
    }
  };

  app.post("/api/image/getImage", verifyCache, async (req, res) => {
    let status = true;
    let list = [];
    try {
      let skip = req.body.skip;
      list = await Image.findOne().skip(skip).catch((err) => {
        console.log(err);
        status = false;
      });
      cache.set(skip, list);
    } catch (error) {
      console.log(error);
      status = false;
    }
    res.send({
      status: status,
      img: list
    });
    res.end();
    return;
  });

  app.post("/api/image/upload", verifyCache, async (req, res) => {
    let status = true;
    try {
      let img = req.body.img;
      const countOf = await Image.countDocuments();
      const image = new Image({
        data: img,
      })

      await image.save().catch((err) => {
        console.log(err);
        status = false;
      })

      cache.set(countOf + 1, image);

    } catch (error) {
      status = false;
      console.log(error);
    }
    res.send({
      status: status,
    });
    res.end();
    return;
  });


  app.get('/', (_req, res) => {
    return res.status(200).json({
      resultMessage: {
        en: 'Project is successfully working...',
        tr: 'Proje başarılı bir şekilde çalışıyor...'
      },
      resultCode: '00004'
    }).end();
  });

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Content-Security-Policy-Report-Only', 'default-src: https:');
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'PUT POST PATCH DELETE GET');
      return res.status(200).json({});
    }
    next();
  });

  // app.use((_req, _res, next) => {
  //   const error = new Error('Endpoint could not find!');
  //   error.status = 404;
  //   next(error);
  // });

  // app.use((error, req, res, _next) => {
  //   res.status(error.status || 500);
  //   let resultCode = '00015';
  //   let level = 'External Error';
  //   if (error.status === 500) {
  //     resultCode = '00013';
  //     level = 'Server Error';
  //   } else if (error.status === 404) {
  //     resultCode = '00014';
  //     level = 'Client Error';
  //   }
  //   return res.json({
  //     resultMessage: {
  //       en: error.message,
  //       tr: error.message
  //     },
  //     resultCode: resultCode,
  //   });

  // });
}

