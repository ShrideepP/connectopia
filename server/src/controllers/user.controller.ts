import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { PostModel } from '../models/post.model';
import { CommentModel } from '../models/comment.model';
import { uploader } from '../config/cloudinaryConfig';
import { Types } from 'mongoose';

export async function followOrUnfollowAccount(
  request: Request,
  response: Response,
) {
  try {
    const { userId, creatorId } = request.params;
    if (!userId || !creatorId)
      return response
        .status(400)
        .send('Creator Id or User Id either one was not sent in the params.');

    const userAccount = await UserModel.findOne({ _id: userId });
    if (!userAccount)
      return response.status(404).send(`User with Id ${userId} was not found.`);

    const creatorAccount = await UserModel.findOne({ _id: creatorId });
    if (!creatorAccount)
      return response
        .status(404)
        .send(`Creator with Id ${creatorId} was not found.`);

    if (
      userAccount.following.includes(new Types.ObjectId(creatorId)) &&
      creatorAccount.followers.includes(new Types.ObjectId(userId))
    ) {
      const updatedUserAccount = await UserModel.findByIdAndUpdate(
        userId,
        { $pull: { following: creatorId } },
        { new: true },
      );

      const updatedCreatorAccount = await UserModel.findByIdAndUpdate(
        creatorId,
        { $pull: { followers: userId } },
        { new: true },
      );

      if (!updatedUserAccount)
        return response.status(404).send('User account not found.');

      if (!updatedCreatorAccount)
        return response.status(404).send('Creator account not found.');

      await updatedUserAccount.save();
      await updatedCreatorAccount.save();
      return response
        .status(200)
        .send(
          `You have unfollwed ${
            creatorAccount.givenName + ' ' + creatorAccount.familyName
          }`,
        );
    }

    const updatedUserAccount = await UserModel.findByIdAndUpdate(
      userId,
      { $push: { following: creatorId } },
      { new: true },
    );

    const updatedCreatorAccount = await UserModel.findByIdAndUpdate(
      creatorId,
      { $push: { followers: userId } },
      { new: true },
    );

    if (!updatedUserAccount)
      return response.status(404).send('User account not found.');

    if (!updatedCreatorAccount)
      return response.status(404).send('Creator account not found.');

    await updatedUserAccount.save();
    await updatedCreatorAccount.save();
    response
      .status(200)
      .send(
        `You are now following ${
          creatorAccount.givenName + ' ' + creatorAccount.familyName
        }`,
      );
  } catch (error) {
    console.log('Error in the follow creator route.', error);
    response.status(500).send('Internal server error.');
  }
}

export async function deleteAccount(request: Request, response: Response) {
  try {
    const { userId } = request.params;
    if (!userId)
      return response.status(400).send('User Id not sent in the params.');

    const doesUserExist = await UserModel.findOne({ _id: userId });
    if (!doesUserExist)
      return response.status(404).send(`User with Id ${userId} not found.`);

    await PostModel.updateMany({ likes: userId }, { $pull: { likes: userId } });

    await CommentModel.updateMany(
      { likes: userId },
      { $pull: { likes: userId } },
    );

    const posts = await PostModel.find({ author: userId });
    if (posts) {
      const cloudinaryPublicURL = posts.map((post) => post.postPicture._id);

      cloudinaryPublicURL.forEach((_id) => {
        uploader.destroy(_id);
      });

      await PostModel.deleteMany({ author: userId });
    }

    await CommentModel.deleteMany({ author: userId });

    await UserModel.findByIdAndDelete(userId);

    response.status(204).end();
  } catch (error) {
    console.log('Error in the delete account route.', error);
    response.status(500).send('Internal server error.');
  }
}
