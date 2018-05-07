import User, { IUser } from '../models/user.model';
import Chat, { IChat, IChatModel } from '../models/chat.model';
import { NextFunction, Request, Response, Router } from 'express';

export default class ChatRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  };

  private async createChat(req: Request, res: Response): Promise<void> {
    const cname: string = req.body.chat_name;
    const img: string = req.body.img;
    const userNames: Array<string> = req.body.user_names;
    let gc = false;

    req.checkBody('chat_name', 'Chat name is required').notEmpty();
    req.checkBody('user_names', 'Must add at least one other user.').notEmpty();
    const errors: Record<string, any> = req.validationErrors();

    if(errors) {
      res.status(400).json({
        error: errors
      });
      return;
    }

    if(userNames.length <= 0) {
      res.status(400).json({
        error: 'You must add at least one other user.'
      });
      return;
    }

    if(userNames.length > 1) {
      gc = true;
    }

    let users: Array<IUser> = [];

    userNames.forEach(async (user: string) => {
      const found: any = await User.getUserByUsername(user,  (err: Error, user: IUser) => {
        if (err) throw err;;
        if (!user) {
          return false;
        }
      });

      if(!found) {
        res.status(400).json({
          error: `User ${user} not found.`
        });

        return;
      }

      users.push(found);
    });

    let newChat: IChat = new Chat({
      chatName: cname,
      isGroupChat: gc,
      img: img || '',
      users: users,
      //messages: []
    });

    await Chat.newChat(newChat, (err: Error, user: IChat) => {
      if(err) {
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


  private routes(): void {
    this.router.post('/new', this.createChat);
  }
}