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

      let users: Array<any> = [];

      for (let usern of usernames) {
         const found = await User.findOne({ username: usern });
         if (!found) {
            res.status(400).json({
               error: [{ msg: `User '${usern}' not found.` }]
            });
            return;
         }
         users.push({ username: usern, user: found });
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

      const validUser = await User.findOne({ username });
      if (!validUser) {
         res.status(400).json({
            error: [{ msg: `User '${username}' not found.` }]
         });
         return;
      }

      const chat = await Chat.findById(req.params.id, {
         users: { $elemMatch: { username: username } }
      });

      if (!chat) {
         res.status(400).json({
            error: [{ msg: `Chat '${id}' was not found.` }]
         });
         return;
      }

      if (chat.users.length) {
         res.status(400).json({
            error: `The user '${username}' is already in the chat.`
         });
         return;
      }

      const user = await User.findOne({ username });

      Chat.findOneAndUpdate(
         { _id: id },
         { $push: { users: { username, user } } },
         (err: Error, chat: IChat) => {
            if (err) {
               res.status(400).json({
                  error: err
               });
               return;
            }

            res.status(201).json({
               msg: `User '${username}' added!`
            });
         }
      );
   }

   private async removeUser(req: Request, res: Response): Promise<void> {
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

      const validUser = await User.findOne({ username });
      if (!validUser) {
         res.status(400).json({
            error: [{ msg: `User '${username}' not found.` }]
         });
         return;
      }

      const chat = await Chat.findById(req.params.id, {
         users: { $elemMatch: { username: username } }
      });

      if (!chat) {
         res.status(400).json({
            error: [{ msg: `Chat '${id}' was not found.` }]
         });
         return;
      }

      if (chat.users.length === 0) {
         res.status(400).json({
            error: `The user '${username}' is not in the chat.`
         });
         return;
      }

      Chat.findOneAndUpdate(
         { _id: id },
         { $pull: { users: { username } } },
         (err: Error, chat: IChat) => {
            if (err) {
               res.status(400).json({
                  error: err
               });
               return;
            }

            res.status(200).json({
               msg: `User ${username} removed!`
            });
         }
      );
   }

   private async chatInfo(req: Request, res: Response): Promise<void> {
      const id = req.params.id;
      const chatInfo = await Chat.findById(id).populate('users.user');
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
      this.router.get('/:id/', this.chatInfo);
   }
}
