import { config, LoggerBase } from '@root/config';
import cloudinary from 'cloudinary';
class CloudinaryConnection extends LoggerBase {
    constructor() {
        super('cloudinaryConnection');
        cloudinary.v2.config({
            cloud_name: config.CLOUDINARY_CLOUD_NAME,
            api_key: config.CLOUDINARY_KEY,
            api_secret: config.CLOUDINARY_SECRET,
            secure: true,
        });
    }
    public async connect(): Promise<void> {
        cloudinary.v2.api.resources({ max_results: 1 }, (error, _) => {
            if (error) {
                this.log.error(error);
                process.exit(1);
            } else this.log.info('Successfully connected to Cloudinary');
        });
    }
}

export const cloudinaryConnection: CloudinaryConnection = new CloudinaryConnection();
