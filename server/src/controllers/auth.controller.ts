import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { uploader } from '../config/cloudinaryConfig';
import { dataUri } from '../middlewares/multerUpload';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export async function signup(request: Request, response: Response) {
  try {
    const { givenName, familyName, email, password } = request.body;
    if (!givenName || !familyName || !email || !password)
      return response.status(400).send('Please fill all the details.');

    const doesUserExist = await UserModel.findOne({ email });
    if (doesUserExist)
      return response.status(409).send('Email has already been taken');

    let displayPicture = undefined;
    if (request.file) {
      const file = dataUri(request);
      const cloudinaryResponse = await uploader.upload(file as string, {
        resource_type: 'image',
      });
      displayPicture = cloudinaryResponse.secure_url;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({
      givenName,
      familyName,
      email,
      password: hashedPassword,
    });

    if (displayPicture !== undefined) newUser.displayPicture = displayPicture;
    await newUser.save();

    const accessToken = jwt.sign(
      { _id: newUser._id },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: 900000 },
    );
    const refreshToken = jwt.sign(
      { _id: newUser._id },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: '7d' },
    );

    response.status(201).json({
      _id: newUser._id,
      givenName,
      familyName,
      displayPicture: newUser.displayPicture,
      email,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.log('Error in signup route.', error);
    response.status(500).send('Internal server error.');
  }
}

export async function signin(request: Request, response: Response) {
  try {
    const { email, password } = request.body;
    if (!email || !password)
      return response.status(400).send('Please fill all the details.');

    const existingUser = await UserModel.findOne({ email });
    if (!existingUser)
      return response
        .status(401)
        .json({ message: 'Invalid email & password combination.' });

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!isPasswordValid)
      return response
        .status(401)
        .json({ message: 'Invalid email & password combination.' });

    const accessToken = jwt.sign(
      { _id: existingUser._id },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: 900000 },
    );
    const refreshToken = jwt.sign(
      { _id: existingUser._id },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: '7d' },
    );

    response.status(202).json({
      _id: existingUser._id,
      givenName: existingUser.givenName,
      familyName: existingUser.familyName,
      displayPicture: existingUser.displayPicture,
      email,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.log('Error while signin in', error);
    response.status(500).json({ message: 'Internal server error.' });
  }
}

export async function refreshToken(request: Request, response: Response) {
  try {
    const refreshToken = request.body.refreshToken;
    if (!refreshToken)
      return response
        .status(401)
        .send('Access denied, refresh token was not provided.');

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
    ) as JwtPayload;
    const accessToken = jwt.sign(
      { _id: decoded._id },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: 900000 },
    );

    response.status(200).json(accessToken);
  } catch (error) {
    console.log('Error in refresh route', error);
    response.status(500).send('Internal server error.');
  }
}
