import User, { IUser, IUserModel } from '../models/user.model';
import { NextFunction, Request, Response, Router } from 'express';
import uuidv4 from 'uuid/v4';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import passportJWT from 'passport-jwt';

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

const jwtOptions: passportJWT.StrategyOptions = {
   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
   secretOrKey: 'foobar'
};

export default class UserRouter {
   public router: Router;

   constructor() {
      this.router = Router();
      this.routes();
   }

   private async register(req: Request, res: Response): Promise<void> {
      req.checkBody('firstName', 'First Name is required').notEmpty();
      req.checkBody('lastName', 'Last Name is required').notEmpty();
      req.checkBody('email', 'Email is required').notEmpty();
      req.checkBody('email', 'Email is not valid').isEmail();
      req.checkBody('username', 'Username is required').notEmpty();
      req.checkBody('password', 'Password is required').notEmpty();
      req
         .checkBody('passConfirm', 'Passwords must match')
         .equals(req.body.password);

      const errors: Record<string, any> = req.validationErrors();

      if (errors) {
         res.status(400).json({
            error: errors
         });
         return;
      }

      const { firstName, lastName, email, username, password } = req.body;
      let newUser: IUser = new User({
         firstName,
         lastName,
         email,
         username,
         password
      });

      const matchUsername = await User.findOne({ username: newUser.username });

      if (matchUsername) {
         res.status(409).json({
            error: [{ msg: `Username ${newUser.username} is already taken.` }]
         });
         return;
      }

      const matchEmail = await User.findOne({ email: newUser.email });

      if (matchEmail) {
         res.status(409).json({
            error: [
               {
                  msg: `A user with email ${
                     newUser.email
                  } is already registered.`
               }
            ]
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

   private login(req: Request, res: Response): void {
      req.checkBody('username', 'Username is required').notEmpty();
      req.checkBody('password', 'Password is required').notEmpty();

      const errors: Record<string, any> = req.validationErrors();
      if (errors) {
         res.status(400).json({
            error: errors
         });
         return;
      }

      const { username, password } = req.body;
      User.getUserByUsername(username, (err: Error, user: IUser) => {
         if (err || !user) {
            res
               .status(404)
               .json({ error: [{ msg: `User '${username}' is not found.` }] });
            return;
         }
         User.comparePassword(
            password,
            user.password,
            (err: Error, match: boolean) => {
               if (err || !match) {
                  res.status(403).json({
                     error: [{ msg: `Incorrect username or password.` }]
                  });
                  return;
               }
               const payload = {
                  id: user._id,
                  username
               };
               const token = jwt.sign(payload, jwtOptions.secretOrKey);
               res.status(200).json({
                  msg: 'login success',
                  token
               });
            }
         );
      });
   }

   private logout(req: Request, res: Response): void {
      req.logout();
      res.status(200).json({
         msg: 'logout success'
      });
   }

   private async updateUser(req: Request, res: Response): Promise<void> {
      let update: any = {}; //need to write interface for this :c
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
   }

   private async aboutUser(req: Request, res: Response): Promise<void> {
      const id: string = req.user.id;
      await User.findOne({ _id: id }, (err, user) => {
         if (err) {
            res.status(500).json({
               error: [{ msg: err }]
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
   }

   private routes(): void {
      this.router.post('/register', this.register);
      this.router.post('/login', this.login);
      this.router.post(
         '/update',
         passport.authenticate('jwt', { session: false }),
         this.updateUser
      );
      this.router.get(
         '/about',
         passport.authenticate('jwt', { session: false }),
         this.aboutUser
      );
      this.router.get(
         '/logout',
         passport.authenticate('jwt', { session: false }),
         this.logout
      );
   }
}

passport.use(
   new JwtStrategy(jwtOptions, (payload, done) => {
      User.getUserById(payload.id, (err: Error, user: IUser) => {
         if (err) throw err;
         if (!user) {
            return done(null, false, { error: [{ msg: 'Unknown User' }] });
         } else {
            return done(null, user);
         }
      });
   })
);

passport.serializeUser(async (user: IUser, done: any) => {
   done(null, user.id);
});

passport.deserializeUser(async (id: string, done: any) => {
   User.getUserById(id, async (err: Error, user: IUser) => {
      done(err, user);
   });
});
