import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
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
      // Parsing
      this.app.use(express.json());
      this.app.use(express.urlencoded({ extended: true }));

      // Logging
      this.app.use(morgan('dev'));

      // Cors
      this.app.use(cors());
   }

   private config(): void {
      // Put any db init / redis / s3 configs here
      const MONGO_URI = 'mongodb://localhost:27017/yams';
   }
}

export default new Server().app;
