export default () => ({
    secret_key: process.env.SECRET_KEY,
    pp_upload_path: process.env.PP_UPLOAD_PATH,
    entry_image_path: process.env.ENTRY_IMAGE_PATH,
    dummy_pp_path: process.env.DUMMY_PICTURE_PATH,
    connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    },
    email_smtp_host: process.env.EMAIL_SMTP_HOST,
    email_adress_pwreset: process.env.EMAIL_ADDRESS_PWRESET,
    email_app_password: process.env.EMAIL_ADRESS_APP_PASSWORD
})