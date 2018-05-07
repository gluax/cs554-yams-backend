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

   private async register(req: Request, res: Response): Promise<void> {
      req.checkBody('firstName', 'First name is required').notEmpty();
      req.checkBody('lastName', 'Last name is required').notEmpty();
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
      const username: string = req.body.username;
      res.status(200).json({
         msg: 'login success'
      });
   }

   private logout(req: Request, res: Response): void {
      req.logout();
      res.status(200).json({
         msg: 'logout success'
      });
   }

   private isAuthUser(req: Request, res: Response, next: NextFunction): void {
      if (req.isAuthenticated()) {
         return next();
      } else {
         res.status(403).json({
            error: [{ msg: 'Not authenticated' }]
         });
      }
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
      this.router.post(
         '/login',
         passport.authenticate('local', { failWithError: true }),
         (req: Request, res: Response, next: NextFunction) => {
            // handle success
            this.login(req, res);
         },
         (err: Error, req: Request, res: Response, next: NextFunction) => {
            // handle error
            if (err) {
               res.status(409).json({
                  error: [{ msg: 'Invalid Username or Password' }]
               });
            }
         }
      );
      this.router.post('/update', this.isAuthUser, this.updateUser);
      this.router.get('/about', this.isAuthUser, this.aboutUser);
      this.router.get('/logout', this.isAuthUser, this.logout);
   }
}

passport.use(
   new LocalStrategy((username: string, password: string, done: any) => {
      User.getUserByUsername(username, (err: Error, user: IUser) => {
         if (err) throw err;
         if (!user) {
            return done(null, false, { error: [{ msg: 'Unknown User' }] });
         }

         User.comparePassword(
            password,
            user.password,
            (err: Error, match: boolean) => {
               if (err) throw err;
               if (match) {
                  return done(null, user);
               } else {
                  return done(null, false, {
                     error: [{ msg: 'Invalid password' }]
                  });
               }
            }
         );
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
