# CS554-YAMS

YAMS: Yet Another Messaging Service

# Implementation Plan

Group Name: **Webpackers**

Group Members:

*  Rob Herley
*  Jonathan Pavlik
*  Albert Tang
*  Aimal Wajihuddin

## Functional/General Overview:

Hello, we are **Webpackers** and our goal for this final project is to create our own personal cross platform chat client. Functionally, our end goal is to design a chat client. The client will be cross platform between Linux, macOS and Windows, which will be done through the use of a library known as Proton Native. A person will be able to create a chat (in which the user who made the chat is the admin), and be able to invite other users by username. Mongo will store chat logs to a group chat. Messages will be dynamically sent from one user to the others in a chat via sockets. We will allow users to send each other files, which would be stored in a s3 bucket folder specific to that chat.

Overall the end goal is to create a simple yet useful chat client. It would have an intuitive UI that lets you switch between chats and ability to create new ones as well as manage users (if you are an admin). In addition, users will be able to select different themes to make the UI more comfortable to the user&#39;s preference. Each message will have a datetime stamp, as well as the user who sent it. There will also be simple user pages containing some information. The end product will be known as 🍠 **YAMS** , otherwise known as **Y** et **A** nother **M** essaging **S** ervice.

## Technologies:

*  Independent:
   *  ~~Proton Native~~ Electron wins this time
      *  Transpiles react syntax to python qt
      *  Used to build cross platform ui for non-mobile operating systems
      *  Less overhead than electron
   *  Typescript
      *  For a more type-strict JS project
      *  Guarantee efficiency with data flow of work
   *  Amazon S3
      *  Simple/fast file storage
   *  JSON Web Tokens (and LocalStorage)
      *  Auth for Sockets & Routes!
*  Course:
   *  React
      *  Our component library to manage different parts of the UI
   *  Redux
      *  For better predictable state management use with React
   *  Socket.io
      *  To allow multiple users to connect to a chat at a time, faster/easier async data flow
   *  Mongodb
      *  To store user information
      *  To store chat logs
   *  Mongoose
      *  For better model control with Mongodb
   *  Express
      *  Underlying server and api for the chat client
   *  SASS
      *  Styling of UI components

## Stretch Goals

*  Chat Bot
   *  Users can create custom commands for a bot to return simple regex matching bot responses
   *  Bot will have tie-in to Canvas API for information about class due dates, announcements, etc
*  Message Encryption
   *  End-to-End Encryption
   *  MTProto 2.0 Secret Chats
*  Location Sending
   *  Send a user a location for meetups
   *  Uses Google Maps API
