import AWS = require('aws-sdk');
AWS.config.region = 'us-east-2';

import User, { IUser } from '../models/user.model';
import Chat, { IChat, IChatModel } from '../models/chat.model';
import { NextFunction, Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import Message, { IMessage } from '../models/message.model';

export default class ChatRouter {
   public router: Router;
   private BUCKET_NAME: String;
   private S3: AWS.S3;

   constructor() {
      this.router = Router();
      this.routes();

      // aws config class dependent
      if(!process.env.AWS_KEY || !process.env.AWS_SECRET) {
        throw new Error('AWS_KEY and AWS_SECRET for s3 are required.');
      }
      AWS.config.accessKeyId = process.env.AWS_KEY;
      AWS.config.secretAccessKey = process.env.AWS_SECRET;
      if(!process.env.BUCKET_NAME) {
        throw new Error('BUCKET_NAME for s3 is required.');
      }
      this.BUCKET_NAME = process.env.BUCKET_NAME;
      this.S3 = new AWS.S3();
   }

   private async authReq(
      req: Request,
      res: Response,
      next: NextFunction
   ): Promise<void> {
      try {
         req.get('Authorization');
         const auth = req.get('Authorization');
         if (!auth) throw 'Authorization Required.';
         const tkn: any = await jwt.verify(
            auth.split(' ')[1],
            process.env.JWT_SECRET
         );
         const chat = await Chat.findById(req.params.id, {
            users: { $elemMatch: { username: tkn.username } }
         });
         if (!chat) throw `Specified chat '${req.params.id}' was not found.`;
         if (chat.users.length === 0)
            throw `User '${tkn.username}' is not verified for chat '${
               req.params.id
            }'`;
         res.locals.username = tkn.username;
         next();
      } catch (err) {
         res.status(403).json({
            error: [{ msg: err }]
         });
      }
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

   private async sendMessage(req: Request, res: Response): Promise<void> {
      const id = req.params.id;

      req.checkBody('content', 'Message must have content.').notEmpty();
      req.checkBody('media', 'Message must specify content.').notEmpty();

      const errors: Record<string, any> = req.validationErrors();

      if (errors) {
         res.status(400).json({
            error: errors
         });
         return;
      }

      let newMessage: IMessage = {
         sentBy: res.locals.username,
         content: req.body.content,
         media: false,
         ts: new Date()
      };

      Chat.findOneAndUpdate(
         { _id: id },
         { $push: { messages: { ...newMessage } } },
         (err: Error, chat: IChat) => {
            if (err) {
               res.status(400).json({
                  error: err
               });
               return;
            }

            res.status(200).json({
               msg: `Message '${newMessage.content}' sent!`
            });
         }
      );
   }

   private async uploadImage(req: Request, res: Response): Promise<void> {
     const id  = req.params.cname;
     const message = req.params.message;

     req.checkBody('message', 'Must submit a message.').notEmpty();

     await this.S3.putObject({
        Bucket: `${this.BUCKET_NAME}/cname`,
        Key: `${message.ts}`,
        Body: message.content,
        ContentType: 'application/json'
     },
     (err: Error, _: any) => {
       if(err) {
         res.status(500).json({
           error: err
         });
         return;
       }
     });

     res.status(201).json({
       id: `${message.ts}`
     });
   }

   private async getImages(req: Request, res: Response): Promise<void> {
     const cname = req.params.cname;

     await this.S3.listObjects({
       Bucket: `${this.BUCKET_NAME}`,
       Delimiter: `/${cname}`
     },
     (err: Error, data: any) => {
        if(err) {
         res.status(500).json({
           error: err
         });
         return;
       }

        res.status(200).json({
         messages: data
       });
     });
   }

   private async getImage(req: Request, res: Response): Promise<void> {
     const cname = req.params.cname;
     const ts = req.params.ts;

     await this.S3.getObject({
       Bucket: `${this.BUCKET_NAME}/cname`,
       Key: ts
     },
     (err: Error, data: any) => {
        if(err) {
         res.status(500).json({
           error: err
         });
         return;
       }

       res.status(200).json({
         image: data
       });
     })
   }

   private routes(): void {
      this.router.post('/new', this.createChat);
      this.router.post('/add/:id', this.authReq, this.addUser);
      this.router.post('/remove/:id', this.authReq, this.removeUser);
      this.router.post('/send/:id', this.authReq, this.sendMessage);
      this.router.get('/:id', this.authReq, this.chatInfo);
   }
}
