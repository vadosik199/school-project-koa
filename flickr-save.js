const Flicker = require('flickrapi');
const config = require('./config');

module.exports.upload = (uploadOptions) => {
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
                        resolve({
                            id: photoId[0],
                            src: result.sizes.size[result.sizes.size.length - 1].source
                        });
                    }
                });
            });
        });
    });
}

module.exports.getAlbumsList = () => {
    return new Promise((resolve, reject) => {
        Flicker.authenticate(config.flickrOption, (err, flickr) => {
            if(err) reject(err);
            let searchOption = {
                api_key: config.flickrOption.api_key,
                user_id: config.flickrOption.user_id
            };
            let albums = flickr.photosets.getList(searchOption, (err, albums) => {
                if(err) reject(err);
                let {photoset} = albums.photosets;
                let arr = [];
                let count = 0;
                for(let i = 0; i < photoset.length; i++) {
                    let photoDetails = {
                        secret: config.flickrOption.access_token_secret,
                        photo_id: photoset[i].primary
                    };
                    flickr.photos.getSizes(photoDetails, (err, photo) => {
                        let albumDetails = {
                            id: photoset[i].id,
                            created: photoset[i].date_create,
                            farm: photoset[i].farm,
                            secret: photoset[i].secret,
                            server: photoset[i].server,
                            title: photoset[i].title._content,
                            description: photoset[i].description._content,
                            primary: photo.sizes.size[photo.sizes.size.length - 1].source
                        };
                        arr.push(albumDetails);
                        count++;
                        if(count == photoset.length) {
                            resolve(arr);
                        }
                    });
                }
                //resolve(arr);
            });
        });
    });
}

module.exports.getPhotosFormHome = () => {
    return new Promise((resolve, reject) => {
        Flicker.authenticate(config.flickrOption, (err, flickr) => {
            if(err) reject(err);
            let option = {
                api_key: config.flickrOption.api_key,
                user_id: config.flickrOption.user_id,
                per_page: 4,
                extras: 'original_format'
            };
            flickr.photos.search(option, (err, photos) => {
                if(err) reject(err);
                let arr = [];
                let counter = 0;
                for(let i = 0; i < photos.photos.photo.length; i++) {
                    let searchOption = {
                        secret: config.flickrOption.access_token_secret,
                        photo_id: photos.photos.photo[i].id
                    };
                    flickr.photos.getSizes(searchOption, (err, photo) => {
                        if(err) reject(err);
                        arr.push(photo.sizes.size[photo.sizes.size.length - 1].source);
                        counter++;
                        if(counter == photos.photos.photo.length) {
                            resolve(arr);
                        }
                    });
                }
            });
        }); 
    });
}

module.exports.addToAlbum = async (photoId, albumId) => {
    return new Promise((resolve, reject) => {
        Flicker.authenticate(config.flickrOption, (err, flickr) => {
            if(err) reject(err);
            flickr.photosets.addPhoto({
                api_key: config.flickrOption.api_key,
                photo_id: photoId,
                photoset_id: albumId
            }, (err, result) => {
                if(err) reject(err);
                resolve(result);
            });
        });
    });
}

module.exports.getPhotos = (albumId) => {
    return new Promise((resolve, reject) => {
        let searchOption = {
            user_id: config.flickrOption.user_id,
            photoset_id: albumId
        };
        Flicker.authenticate(config.flickrOption, (err, flickr) => {
            if(err) reject(err);
            flickr.photosets.getPhotos(searchOption, (err, photos) => {
                if(err) reject(err);
                let result = {
                    title: photos.photoset.title
                };
                let arr = [];
                let counter = 0;
                let photoPrimatyDetails = {
                    secret: config.flickrOption.access_token_secret,
                    photo_id: photos.photoset.primary
                };
                flickr.photos.getSizes(photoPrimatyDetails, (err, primaryResult) => {
                    if(err) reject(err);
                    result.primary = primaryResult.sizes.size[primaryResult.sizes.size.length - 1].source;
                    for(let i = 0; i < photos.photoset.photo.length; i++) {
                        let photDetails = {
                            secret: config.flickrOption.access_token_secret,
                            photo_id: photos.photoset.photo[i].id
                        };
                        flickr.photos.getSizes(photDetails, (err, photo) => {
                            if(err) reject(err);
                            arr.push(photo.sizes.size[photo.sizes.size.length - 1].source);
                            counter++;
                            if(counter == photos.photoset.photo.length) {
                                result.photos = arr;
                                resolve(result);
                            }
                        });
                    }
                });
            });
        });
    });
}