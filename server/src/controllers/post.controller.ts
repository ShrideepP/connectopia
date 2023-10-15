import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { PostModel } from '../models/post.model';
import { uploader } from '../config/cloudinaryConfig';
import { dataUri } from '../middlewares/multerUpload';
import { Types } from 'mongoose';

export async function getAllPosts(request: Request, response: Response) {
  try {
    const posts = await PostModel.find({}).sort({ createdAt: -1 });
    response.status(200).json(posts);
  } catch (error) {
    console.log('Error while fetching all posts', error);
    response.status(500).send('Internal server error.');
  }
}

export async function getAuthorPosts(request: Request, response: Response) {
  try {
    const author = request.params.author;
    if (!author)
      return response.status(400).send('Author Id was not sent in params.');

    const doesUserExists = await UserModel.findOne({ _id: author });
    if (!doesUserExists)
      return response
        .status(404)
        .send(`Author with Id ${author} was not found.`);

    const authorPosts = await PostModel.find({ author });
    response.status(200).json(authorPosts);
  } catch (error) {
    console.log('Error while fetching author posts', error);
    response.status(500).send('Internal server error.');
  }
}

export async function getSavedPosts(request: Request, response: Response) {
  try {
    const userId = request.params.userId;
    if (!userId)
      return response.status(400).send('User Id was not sent in the params.');

    const existingUser = await UserModel.findOne({ _id: userId });
    if (!existingUser)
      return response.status(404).send(`User with Id ${userId} was not found.`);

    const savedPosts = await PostModel.find({
      _id: { $in: existingUser.savedPosts },
    });
    response.status(200).json(savedPosts);
  } catch (error) {
    console.log('Error while fetching saved posts', error);
    response.status(500).send('Internal server error.');
  }
}

export async function savePost(request: Request, response: Response) {
  try {
    const { userId, postId } = request.params;
    if (!userId || !postId)
      return response
        .status(400)
        .send(
          'Author Id or Post Id either one of these was not sent in params.',
        );

    const existingUser = await UserModel.findOne({ _id: userId });
    if (!existingUser)
      return response.status(404).send(`User with Id ${userId} was not found.`);

    const doesPostExist = await PostModel.findOne({ _id: postId });
    if (!doesPostExist)
      return response.status(404).send(`Post with Id ${postId} was not found.`);

    if (existingUser.savedPosts.includes(new Types.ObjectId(postId))) {
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { $pull: { savedPosts: postId } },
        { new: true },
      );

      if (!updatedUser) return response.status(404).send('User not found.');

      await updatedUser.save();
      return response.status(200).send('Post removed from saved posts.');
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $push: { savedPosts: postId } },
      { new: true },
    );

    if (!updatedUser) return response.status(404).send('User not found.');

    await updatedUser.save();
    response.status(200).send('Post saved successfully.');
  } catch (error) {
    console.log('Error in save post route.', error);
    response.status(500).send('Internal server error.');
  }
}

export async function createPost(request: Request, response: Response) {
  try {
    const author = request.params.author;
    if (!author)
      return response.status(400).send('Author Id was not sent in params.');

    const existingUser = await UserModel.findOne({ _id: author });
    if (!existingUser)
      return response
        .status(404)
        .send(`Author with Id ${author} was not found.`);

    const { caption } = request.body;
    if (!caption || !request.file)
      return response
        .status(400)
        .send('Caption or post picture either one was not sent in the body.');

    const file = dataUri(request);
    const cloudinaryResponse = await uploader.upload(file as string, {
      resource_type: 'image',
    });

    if (cloudinaryResponse.resource_type !== 'image')
      return response.status(405).send('Uploaded file is not an image.');

    const newPost = new PostModel({
      author,
      givenName: existingUser.givenName,
      familyName: existingUser.familyName,
      displayPicture: existingUser.displayPicture,
      postPicture: {
        _id: cloudinaryResponse.public_id,
        URL: cloudinaryResponse.secure_url,
      },
      caption,
    });

    await newPost.save();
    response.status(201).send('Post uploaded successfully.');
  } catch (error) {
    console.log('Error in post creation route.', error);
    response.status(500).send('Internal server error.');
  }
}

export async function editPost(request: Request, response: Response) {
  try {
    const { author, postId } = request.params;
    const caption = request.body.caption;

    if (!author || !postId)
      return response
        .status(400)
        .send(
          'Author Id or Post Id either one of these was not sent in params.',
        );

    if (!caption)
      return response.status(400).send('Please provide the caption to edit.');

    const existingPost = await PostModel.findOne({ _id: postId });
    if (!existingPost)
      return response.status(404).send(`Post with Id ${postId} was not found.`);

    if (String(existingPost.author) !== author)
      return response
        .status(403)
        .send(
          `Author with Id ${author} is not allowed to edit post with Id ${postId}`,
        );

    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      { caption },
      { new: true },
    );

    if (!updatedPost) return response.status(404).send('Post not found.');

    await updatedPost.save();
    response.status(200).send('Post updated successfully.');
  } catch (error) {
    console.log('Error in edit post route.', error);
    response.status(500).send('Internal server error.');
  }
}

export async function likeOrUnlikePost(request: Request, response: Response) {
  try {
    const { userId, postId } = request.params;
    if (!userId || !postId)
      return response
        .status(400)
        .send('User Id or Post Id either one of these was not sent in params.');

    const doesUserExists = await UserModel.findOne({ _id: userId });
    if (!doesUserExists)
      return response.status(404).send(`User with Id ${userId} was not found.`);

    const existingPost = await PostModel.findOne({ _id: postId });
    if (!existingPost)
      return response.status(404).send(`Post with Id ${postId} was not found.`);

    if (existingPost.likes.includes(new Types.ObjectId(userId))) {
      const updatedPost = await PostModel.findByIdAndUpdate(
        postId,
        { $pull: { likes: userId } },
        { new: true },
      );

      if (!updatedPost) return response.status(404).send('Post not found.');

      await updatedPost.save();
      return response.status(200).send('You unliked the post.');
    }

    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      { $push: { likes: userId } },
      { new: true },
    );

    if (!updatedPost) return response.status(404).send('Post not found.');

    await updatedPost.save();
    response.status(200).send('You liked the post.');
  } catch (error) {
    console.log('Error in the like post route.', error);
    response.status(500).send('Internal server error.');
  }
}

export async function deletePost(request: Request, response: Response) {
  try {
    const { author, postId } = request.params;
    if (!author || !postId)
      return response
        .status(400)
        .send(
          'Author Id or Post Id either one of these was not sent in params.',
        );

    const existingPost = await PostModel.findOne({ _id: postId });
    if (!existingPost)
      return response.status(404).send(`Post with Id ${postId} was not found.`);

    if (String(existingPost.author) !== author)
      return response
        .status(403)
        .send(
          `Author with Id ${author} is not allowed to delete post with Id ${postId}`,
        );

    if (existingPost.postPicture && existingPost.postPicture._id)
      uploader.destroy(existingPost.postPicture._id);

    await PostModel.findByIdAndDelete(postId);
    response.status(204).end();
  } catch (error) {
    console.log('Error in the delete post route.', error);
    response.status(500).send('Internal server error.');
  }
}
