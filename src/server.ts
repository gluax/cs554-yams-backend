import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import expressValidator from 'express-validator';
import routes from './routes/';

class Server {
   public app: express.Application;

   constructor() {
      this.app = express();
      this.config();
      this.applyMiddleware();
      this.app.use(routes);
   }

   private applyMiddleware(): void {
      // Parsing POST Reqs
      this.app.use(express.json());
      this.app.use(express.urlencoded({ extended: true }));

      // Logging
      this.app.use(morgan('dev'));

      // Validation/Error Handling
      this.app.use(expressValidator());

      // Cors
      this.app.use(cors());
   }

   private config(): void {
      // Put any db init / redis / s3 configs here
      const MONGO_URI = process.env.MONGO || 'mongodb://localhost:27017/yams';
      (<any>mongoose).Promise = global.Promise;
      mongoose.connect(MONGO_URI).catch(err => {
         console.log('MongoDB error:' + err);
      });
   }
}

export default new Server().app;
