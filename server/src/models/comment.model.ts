import mongoose from 'mongoose';

interface IComment {
  author: mongoose.Types.ObjectId;
  displayPicture: string;
  commentedPost: mongoose.Types.ObjectId;
  comment: string;
  likes: mongoose.Types.ObjectId[];
}

const CommentSchema = new mongoose.Schema<IComment>(
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
    commentedPost: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post',
    },
    comment: {
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

export const CommentModel = mongoose.model('Comment', CommentSchema);
