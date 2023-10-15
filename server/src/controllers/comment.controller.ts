import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { CommentModel } from '../models/comment.model';
import { Types } from 'mongoose';

export async function getComments(request: Request, response: Response) {
  try {
    const { postId } = request.params;
    if (!postId)
      return response.status(400).send('Post Id was not sent in params.');

    const comments = await CommentModel.find({ commentedPost: postId });
    response.status(200).json(comments);
  } catch (error) {
    console.log('Error while fetching comments.', error);
    response.status(500).send('Internal server error.');
  }
}

export async function addComment(request: Request, response: Response) {
  try {
    const { author, postId } = request.params;
    if (!author || !postId)
      return response
        .status(400)
        .send(
          'Author Id or Post Id either one of these was not sent in params.',
        );

    const existingUser = await UserModel.findOne({ _id: author });
    if (!existingUser)
      return response
        .status(404)
        .send(`Author with Id ${author} was not found.`);

    const { comment } = request.body;
    if (!comment)
      return response.status(400).send('Comment was not sent in the body');

    const newComment = new CommentModel({
      author,
      displayPicture: existingUser.displayPicture,
      commentedPost: postId,
      comment,
    });

    await newComment.save();
    response.status(201).json(newComment);
  } catch (error) {
    console.log('Error in add comment route.', error);
    response.status(500).send('Internal server error.');
  }
}

export async function editComment(request: Request, response: Response) {
  try {
    const { author, commentId } = request.params;
    const comment = request.body.comment;

    if (!author || !commentId)
      return response
        .status(400)
        .send(
          'User Id or Comment Id either one of these was not sent in params.',
        );

    if (!comment)
      return response.status(400).send('Please provide the comment to edit.');

    const existingComment = await CommentModel.findOne({ _id: commentId });
    if (!existingComment)
      return response
        .status(404)
        .send(`Comment with Id ${commentId} was not found.`);

    if (String(existingComment.author) !== author)
      return response
        .status(403)
        .send(
          `Author with Id ${author} is not allowed to edit comment with Id ${commentId}`,
        );

    const updatedComment = await CommentModel.findByIdAndUpdate(
      commentId,
      { comment },
      { new: true },
    );

    if (!updatedComment) return response.status(404).send('Comment not found.');

    await updatedComment.save();
    response.status(200).json(updatedComment);
  } catch (error) {
    console.log('Error in edit comment route.', error);
    response.status(500).send('Internal server error.');
  }
}

export async function likeOrUnlikeComment(
  request: Request,
  response: Response,
) {
  try {
    const { userId, commentId } = request.params;
    if (!userId || !commentId)
      return response
        .status(400)
        .send(
          'User Id or Comment Id either one of these was not sent in params.',
        );

    const doesUserExists = await UserModel.findOne({ _id: userId });
    if (!doesUserExists)
      return response.status(404).send(`User with Id ${userId} was not found.`);

    const existingComment = await CommentModel.findOne({ _id: commentId });
    if (!existingComment)
      return response
        .status(404)
        .send(`Comment with Id ${commentId} was not found.`);

    if (existingComment.likes.includes(new Types.ObjectId(commentId))) {
      const updatedComment = await CommentModel.findByIdAndUpdate(
        commentId,
        { $pull: { likes: userId } },
        { new: true },
      );

      if (!updatedComment)
        return response.status(404).send('Comment not found.');

      await updatedComment.save();
      return response.status(200).json(updatedComment);
    }

    const updatedComment = await CommentModel.findByIdAndUpdate(
      commentId,
      { $push: { likes: userId } },
      { new: true },
    );

    if (!updatedComment) return response.status(404).send('Comment not found.');

    await updatedComment.save();
    response.status(200).json(updatedComment);
  } catch (error) {
    console.log('Error in like comment route.', error);
    response.status(500).send('Internal server error.');
  }
}

export async function deleteComment(request: Request, response: Response) {
  try {
    const { author, commentId } = request.params;
    if (!commentId)
      return response.status(400).send('Comment Id was not sent in params.');

    const existingComment = await CommentModel.findOne({ _id: commentId });
    if (!existingComment)
      return response
        .status(404)
        .send(`Comment with Id ${commentId} was not found.`);

    if (String(existingComment.author) !== author)
      return response
        .status(403)
        .send(
          `Author with Id ${author} is not allowed to delete comment with Id ${commentId}`,
        );

    await CommentModel.findByIdAndDelete(commentId);
    response.status(204).end();
  } catch (error) {
    console.log('Error in delete comment route.', error);
    response.status(500).send('Internal server error.');
  }
}
