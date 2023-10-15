import mongoose from 'mongoose';

interface IPost {
  author: mongoose.Types.ObjectId;
  displayPicture: string;
  postPicture: {
    _id: string;
    URL: string;
  };
  caption: string;
  likes: mongoose.Types.ObjectId[];
}

const PostSchema = new mongoose.Schema<IPost>(
  {
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    displayPicture: {
      type: String,
      required: true,
    },
    postPicture: {
      _id: {
        type: String,
        required: true,
      },
      URL: {
        type: String,
        required: true,
      },
    },
    caption: {
      type: String,
      required: true,
    },
    likes: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

export const PostModel = mongoose.model('Post', PostSchema);
