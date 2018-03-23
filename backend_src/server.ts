import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as mongoose from 'mongoose';
import * as logger from 'morgan';

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
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(logger('dev'));

    // cors
    this.app.use(cors());
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials');
      res.header('Access-Control-Allow-Credentials', 'true');
      next();
    });
  }

  private routes(): void {
    let router: express.Router;
    router = express.Router();

    this.app.use('/', router);

    this.app.use('*', (req, res) => {
      res.status(404).json({ error: 'non existant' });
    });
  }
}

export default new Server().app;