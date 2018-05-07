import { Document, model, Model, Schema } from 'mongoose';

export interface IMessage {
  sentBy: string;
  content: string;
  media: boolean;
  ts: Date;
}

export default class Message implements IMessage {
  sentBy: string;
  content: string;
  media: boolean;
  ts: Date;

  constructor(s: string, c: string, m: boolean) {
    this.sentBy = s;
    this.content = c;
    this.media = m;
    this.ts = new Date();
  }
};