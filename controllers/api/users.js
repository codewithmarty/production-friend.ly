const User = require('../../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const fs = require('fs')
const path = require('path')
const aws = require('aws-sdk')

const s3Bucket = new aws.S3({ params: { Bucket: process.env.AWS_BUCKET}})
const BASE_URL = `https://${process.env.AWS_BUCKET}.s3.ca-central-1.amazonaws.com`
const SALT_ROUNDS = 6; 

aws.config.update({ accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY})

module.exports = {
  create,
  login,
  updateProfile,
  getCurrentUser,
  uploadImage
}

async function create(req, res) {
  try {
    const hashedPassword = bcrypt.hashSync(req.body.password, SALT_ROUNDS)
    const user = await User.create({name: req.body.name, email: req.body.email, password: hashedPassword })
    const token = jwt.sign({ user }, process.env.SECRET,{ expiresIn: '24h' })
    res.status(200).json(token)
  } catch (err) {
    res.status(400).json(err)
  }
}

async function login(req, res) {
  try {
    const user = await User.findOne({ email: req.body.email })
    if (!(await bcrypt.compare(req.body.password, user.password))) throw new Error()
    const token = jwt.sign({ user }, process.env.SECRET,{ expiresIn: '24h' })
    res.status(200).json(token)
  } catch (err) {
    res.status(400).json('Bad Credentials')
  }
}

async function updateProfile(req, res) {
  try {
    const user = await User.findOne({ email: req.user.email })
    for (let key in req.body) user[key] = req.body[key]
    user.save()
    res.status(200).json(user)
  } catch (err) {
    res.status(400).json(err)
  }
}

async function getCurrentUser(req, res) {
  try {
    const user = await User.findOne({ email: req.params.email })
    res.status(200).json(user)
  } catch (err) {
    res.status(400).json(err)
  }
}

async function uploadImage(req, res) {
  try {
    const user = await User.findById(req.params.userId)
    user.imageUrl = `${BASE_URL}/${req.file.filename}.jpeg`
    user.save()
    uploadFileOnS3(`${req.file.filename}.jpeg`, fs.readFileSync(req.file.path), res, user)
    deleteUploads()
  } catch (err) {
    console.log(err)
    res.status(400).json(err)
  }
}

function uploadFileOnS3(fileName, fileData, resp, user) {
  var params = {
    Key: fileName,
    Body: fileData,
  };
  s3Bucket.upload(params, function (err, res) {
    if (err) {
      console.log("Error in uploading file on s3 due to " + err);
    } else {
      console.log(`${fileName} successfully uploaded on Amazon S3`)
      deleteUploads()
      resp.status(200).json(user)
    }
  });
}

function deleteUploads() {
  const directory = "uploads/";
  fs.readdir(directory, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      fs.unlink(path.join(directory, file), (err) => {
        if (err) throw err;
      });
    }
  });
}