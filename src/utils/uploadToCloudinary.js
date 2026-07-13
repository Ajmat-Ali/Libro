const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      },
    );

    const readableStream = Readable.from(buffer);
    readableStream.pipe(uploadStream);
  });
};

module.exports = uploadToCloudinary;
