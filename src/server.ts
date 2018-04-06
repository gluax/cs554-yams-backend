import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

class Server {
   public app: express.Application;

   constructor() {
      this.app = express();
      this.config();
      this.routes();
   }

   private config(): void {
      // connect mongoose
      const MONGO_URI = '';

      // configuration
      this.app.use(express.json());
      this.app.use(express.urlencoded({ extended: true }));
      this.app.use(morgan('dev'));

      // cors
      this.app.use(cors());
      this.app.use(
         (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
         ) => {
            res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
            res.header(
               'Access-Control-Allow-Methods',
               'GET, POST, PUT, DELETE, OPTIONS'
            );
            res.header(
               'Access-Control-Allow-Headers',
               'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials'
            );
            res.header('Access-Control-Allow-Credentials', 'true');
            next();
         }
      );
   }

   private routes(): void {
      let router: express.Router;
      router = express.Router();

      this.app.use('/', router);

      this.app.use('*', (req: express.Request, res: express.Response) => {
         res
            .status(418)
            .json({ error: `i'm a teapot`, meme: 'https://http.cat/418' });
      });
   }
}

export default new Server().app;
