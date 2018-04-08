import User, { IUser, IUserModel } from '../models/user.model';
import { NextFunction, Request, Response, Router } from 'express';
import uuidv4 from 'uuid/v4';
import passport from 'passport';
import passportLocal from 'passport-local';

const LocalStrategy = passportLocal.Strategy;

export default class UserRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  public async register(req: Request, res: Response): Promise<null> {
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

    const errors: Record<string, any> = req.validationErrors();

    if(errors) {
      res.status(400).json({
        error: errors
      });
      return;
    }

    let newUser: IUser = new User({
      firstName: fname,
      lastName: lname,
      email: email,
      username: username,
      password: password
    });

    const matchUsername = await User.findOne({ username: newUser.username });

    if (matchUsername) {
      res.status(409).json({
        error: `Username ${newUser.username} is already taken.`
      });
      return;
    }

    const matchEmail = await User.findOne({ email: newUser.email });

    if (matchEmail) {
      res.status(409).json({
        error: `A user with email ${newUser.email} is already registered.`
      });
      return;
    }

    await User.newUser(newUser, (err: Error, user: IUser) => {
      if (err) {
        res.status(424).json({
          error: err
        });
        return;
      }

      res.status(201).json({
        user: newUser
      });
    });

  }

  public login(req: Request, res: Response) {
    const username = req.body.username;
    res.status(200).json({
      msg: 'login success'
    });
  };

  public logout(req: Request, res: Response) {
    req.logout();
    res.status(200).json({
      msg: 'logout success'
    });
  };

  public isAuthUser(req: Request, res: Response, next: NextFunction) {
    if(req.isAuthenticated()) {
      return next();
    } else {
      res.status(403).json({
        error: 'Not authenticated'
      });
    }
  };

  public async updateUser(req: Request, res: Response) {
    let update = {};
    const id: string = req.user.id;

    Object.keys(req.body).forEach(key => {
      if (key !== '_id') {
        update[key] = req.body[key];
      }
    });

    await User.updateUser({ _id: id }, update, (err: Error, user: IUser) => {
      if (err) {
        res.status(500).json({
          error: err
        });
        return;
      }

      res.status(202).json({
        user: user
      });
    });
  };

  public async aboutUser(req: Request, res: Response) {
    let update = {};
    const id = req.user.id;

    await User.findOne({ _id: id }, (err, user) => {
      if (err) {
        res.status(500).json({
          error: err
        });
        return;
      }

      res.status(200).json({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username
      });
    });
  };

  public routes() {
    this.router.post('/register', this.register);
  }

}