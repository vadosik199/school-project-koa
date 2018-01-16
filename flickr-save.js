const Flicker = require('flickrapi');
const config = require('./config');

module.exports = (uploadOptions) => {
    return new Promise((resolve, reject) => {
        Flicker.authenticate(config.flickrOption, (err, flickr) => {
            if(err) reject(err);
            Flicker.upload(uploadOptions, config.flickrOption, (err, photoId) => {
                if(err) reject(err);
                flickr.photos.getSizes({
                    secret: config.flickrOption.access_token_secret,
                    photo_id: photoId[0]
                }, (err, result) => {
                    if(err) {
                        reject(err);
                    }
                    else {
                        resolve(result.sizes.size[result.sizes.size.length - 1].source);
                    }
                });
            });
        });
    });
}