import User from '../models/user';
import { Request, Response, Router } from 'express';
import uuidv4 from 'uuid/v4';
import passport from 'passport';
import passportLocal from 'passport-local';

const LocalStrategy = passportLocal.Strategy;

class UserRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  public async register(req: Request, res: Response): void {
    const fname: string = req.body.first_name;
    const lname: string = req.body.last_name;
    const email: string = req.body.email;
    const username: string = req.body.username;
    const password: string = req.body.password;
    const passConfirm: string = req.body.passConfirm;

    req.checkBody('first_name', 'First name is required').notEmpty();
    req.checkBody('last_name', 'Last name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req
      .checkBody('passConfirm', 'Passwords must match')
      .equals(req.body.password);

    const errors: Error = req.validationErrors();
  }

  public routes() {

  }

}

const userRoutes = new UserRouter();
userRouter.routes();

export default userRoutes.router;