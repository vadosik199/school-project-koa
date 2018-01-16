module.exports = {
    authorisation: {
        secret: 'myroslavka'
    },
    database: {
        user: 'vadosik9',
        pass: 'vadim1976111SZ',
        host: 'ds046047.mlab.com',
        port: 46047,
        database: 'school'
    },
    flickrOption: {
        api_key: "d512ae93f6c3d79b50256a0c40f42eeb",
        secret: "ecdba42b006ccf34",
        access_token:"72157689471861172-ec348a4f19707d85",
        access_token_secret:"d6dd6065a56d4a7d",
        oauth_callback: "http://localhost:3030/",
        permissions: "delete",
        user_id: "142336453@N03"
    },
    flickrUrl: "http://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg",
    nodemailer: {
        user: 'vadosik.chumack@gmail.com',
        pass: 'vadim1976111SZ'
    },
    roles: [
        {
            value: 'Admin',
            title: 'Адміністратор'
        },
        {
            value: 'Teacher',
            title: 'Вчитель'
        },
        {
            value: 'Student',
            title: 'Учень'
        }]
}