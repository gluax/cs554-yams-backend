import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import expressValidator from 'express-validator';
import passport from 'passport';


import UserRouter from './routers/user.router';

class Server {
   public app: express.Application;
   private _userRouter = new UserRouter();

   constructor() {
      this.app = express();
      this.config();
      this.applyMiddleware();
      this.app.use(routes);
   }

   private config(): void {
      // connect mongoose
      const MONGO_URI = 'mongodb://localhost:27017/yams';
      mongoose.connect(MONGO_URI || process.env.MONGODB_URI);

      // configuration
      this.app.use(express.json());
      this.app.use(express.urlencoded({ extended: true }));
      this.app.use(compression());
      this.app.use(morgan('dev'));

      //passport init
      this.app.use(passport.initialize());
      this.app.use(passport.session());

      //validation
      this.app.use(
        expressValidator({
          errorFormatter: (param: string, msg: string, value: string) => {
            let namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

            while (namespace.length) {
              formParam += '[' + namespace.shift() + ']';
            }
            return {
              param: formParam,
              msg: msg,
              value: value
            };
          }
        })
      );
   }

   private routes(): void {
      const router: express.Router = express.Router();
      this.app.use('/', router);

      this.app.use('/api/v1/user', this._userRouter.router);

      this.app.use('*', (req: express.Request, res: express.Response) => {
         res
            .status(418)
            .json({ error: `i'm a teapot`, meme: 'https://http.cat/418' });
   }
}

export default new Server().app;
