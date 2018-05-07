import { Document, model, Model, Schema } from 'mongoose';
import uuidv4 from 'uuid/v4';

import User, { IUser, IUserModel } from './user.model';
import Message, { IMessage } from './message.model';

export interface IChat extends Document {
  _id: string,
  chatName: string,
  isGroupChat: boolean,
  img: string,
  users: Array<IUser>,
  messages: Array<IMessage>
}

const ChatSchema: Schema = new Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  chatName: {
    type: String,
    default: '',
    required: true,
  },
  isGroupChat: {
    type: Boolean,
    required: true
  },
  img: {
    type: String,
    default: '',
    required: false
  },
  users: {
    type: [User],
    default: [],
    required: true,
  },
  messages: {
    type: [Message],
    default: [],
    required: false
  }
});