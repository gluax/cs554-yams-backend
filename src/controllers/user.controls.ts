import User, { IUser } from '../models/user.model';
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

  public async register(req: Request, res: Response): Promise<null> {
    const fname: string = req.body.first_name;
    const lname: string = req.body.last_name;
    const email: string = req.body.email;
    const username: string = req.body.username;
    const password: string = req.body.password;
    const passConfirm: string = req.body.passConfirm;

    /*req.checkBody('first_name', 'First name is required').notEmpty();
    req.checkBody('last_name', 'Last name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req
      .checkBody('passConfirm', 'Passwords must match')
      .equals(req.body.password);

    const errors: Error = req.validationErrors();

    if (errors) {
      res.status(400).json({
        error: errors
      });
      return;
    }*/

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

  public routes() {
    this.router.post('/register', this.register);
  }

}

const userRoutes = new UserRouter();
userRoutes.routes();

export default userRoutes.router;