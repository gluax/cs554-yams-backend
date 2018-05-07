import { Router, Request, Response, NextFunction } from 'express';
import User, { createUser, UserModel } from '../models/user.model';

export let registerUser = async (req: Request, res: Response) => {
   req.checkBody('firstName', 'First name is required.').notEmpty();
   req.checkBody('lastName', 'Last name is required.').notEmpty();
   req.checkBody('email', 'Email is not valid.').isEmail();
   req.checkBody('username', 'Username is required.').notEmpty();
   req.checkBody('password', 'Password is required.').notEmpty();
   req
      .checkBody('passConfirm', 'Passwords must match.')
      .equals(req.body.password);
   const errors = req.validationErrors();
   if (errors) {
      res.status(400).json(errors);
      return;
   }
   const { firstName, lastName, email, username, password } = req.body;

   const matchUsername = await User.findOne({ username });
   if (matchUsername) {
      res.status(409).json({
         errors: [{ msg: `Username ${username} is already taken.` }]
      });
      return;
   }

   const matchEmail = await User.findOne({ email });
   if (matchEmail) {
      res.status(409).json({
         errors: [{ msg: `A user with email ${email} is already registered.` }]
      });
      return;
   }

   const newUser = new User({ firstName, lastName, email, username, password });
   try {
      await createUser(newUser);
   } catch {
      res.status(500).json({
         errors: [{ msg: `The user could not be created.` }]
      });
      return;
   }
   res.status(201).json({ newUser });
};
