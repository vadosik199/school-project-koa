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