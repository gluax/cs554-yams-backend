import User, { IUser } from '../models/user.model';
import Chat, { IChat, IChatModel } from '../models/chat.model';
import { NextFunction, Request, Response, Router } from 'express';

export default class ChatRouter {
   public router: Router;

   constructor() {
      this.router = Router();
      this.routes();
   }

   private async createChat(req: Request, res: Response): Promise<void> {
      const cname: string = req.body.chatname;
      const img: string = req.body.img;
      const usernames: Array<string> = req.body.usernames;
      let gc = false;

      req.checkBody('chatname', 'Chat name is required').notEmpty();
      req.checkBody('usernames', 'Must add users to group chat').notEmpty();
      const errors: Record<string, any> = req.validationErrors();

      if (errors) {
         res.status(400).json({
            error: errors
         });
         return;
      }

      const existingChat = await Chat.findOne({ chatname: cname });
      if (existingChat) {
         res.status(400).json({
            error: `A chat called '${cname}' already exists.`
         });
         return;
      }

      let users: Array<IUser> = [];

      for (let usern of usernames) {
         const found = await User.findOne({ username: usern });
         if (!found) {
            res.status(400).json({
               error: [{ msg: `User ${usern} not found.` }]
            });
            return;
         }
         users.push(found);
      }

      let newChat: IChat = new Chat({
         chatname: cname,
         img: img || '',
         users: users,
         messages: []
      });

      await Chat.newChat(newChat, (err: Error, chat: IChat) => {
         if (err) {
            res.status(400).json({
               error: err
            });
            return;
         }

         res.status(201).json({
            chat: newChat
         });
      });
   }

   private async addUser(req: Request, res: Response): Promise<void> {
      const id = req.params.id;
      const username = req.body.username;

      req.checkBody('username', 'Must add at least one other user.').notEmpty();
      const errors: Record<string, any> = req.validationErrors();

      if (errors) {
         res.status(400).json({
            error: errors
         });
         return;
      }

      await Chat.addUser(id, username, (err: Error, chat: IChat) => {
         if (err) {
            res.status(400).json({
               error: err
            });
            return;
         }

         res.status(201).json({
            msg: `User ${username} added!`
         });
      });
   }

   private async removeUser(req: Request, res: Response): Promise<void> {
      const id = req.params.id;
      const username = req.body.user_name;

      req
         .checkBody('user_name', 'Must add at least one other user.')
         .notEmpty();
      const errors: Record<string, any> = req.validationErrors();

      if (errors) {
         res.status(400).json({
            error: errors
         });
         return;
      }

      await Chat.removeUser(id, username, (err: Error, chat: IChat) => {
         if (err) {
            res.status(400).json({
               error: err
            });
            return;
         }

         res.status(201).json({
            msg: `User ${username} added!`
         });
      });
   }

   private async chatInfo(req: Request, res: Response): Promise<void> {
      const id = req.params.id;
      const chatInfo = await Chat.findById(id).populate('users');
      if (!chatInfo) {
         res.status(404).json({
            error: `A chat with the id '${id}' could not be found.`
         });
         return;
      }
      res.json(chatInfo);
   }

   private routes(): void {
      this.router.post('/new', this.createChat);
      this.router.post('/add/:id', this.addUser);
      this.router.post('/remove/:id', this.removeUser);
      this.router.post('/:id/', this.chatInfo);
   }
}
