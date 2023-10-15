import mongoose from 'mongoose';

interface IUser {
  givenName: string;
  familyName: string;
  displayPicture: string;
  bio: string;
  email: string;
  password: string;
  savedPosts: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    givenName: {
      type: String,
      required: true,
    },
    familyName: {
      type: String,
      required: true,
    },
    displayPicture: {
      type: String,
      default:
        'https://res.cloudinary.com/daqdfmbbo/image/upload/v1696683871/avatar.png',
    },
    bio: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    savedPosts: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: 'Post',
        },
      ],
      default: [],
    },
    followers: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
        },
      ],
      default: [],
    },
    following: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model('User', UserSchema);
