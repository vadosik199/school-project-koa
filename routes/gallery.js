const _ = require('koa-router')();
const flickr = require('../flickr-save');

_.get('/gallery', async (ctx) => {
    let albums = await flickr.getAlbumsList();
    ctx.render('gallery-albums', {
        albums: albums,
        css: "/css/thumbnail-gallery.css"
    });
});

_.get('/gallery/albums/id/:id', async (ctx) => {
    let albumId = ctx.params.id;
    let photos = await flickr.getPhotos(albumId);
    ctx.render('gallery-album-photos', {
        album: photos,
        css: "/css/fluid-gallery.css"
    });
});

_.post('/uploadimg', async (ctx) => {
    let {body, files} = ctx.request;
    let oldpath = files.file.path;
    let {id} = await flickr.upload({
        photos: [{
            title: 'school',
            photo: oldpath
        }]
    });
    let albumId = ctx.header.referer.split('/').pop();
    let result = await flickr.addToAlbum(id, albumId);
    ctx.body = files;
});

module.exports = _;