import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './models/User.js';

const MONGO_URI = 'mongodb+srv://manavp7:mvH6lgNcBaAW0vhV@cluster0.ctuoxpu.mongodb.net/Eventplanner';

async function seedAdmin() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const adminEmail = 'admin';
        const adminPassword = 'Netlink123#';

        // Check if user already exists
        let user = await User.findOne({ email: adminEmail });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        if (user) {
            console.log('Admin user already exists. Updating password...');
            user.password = hashedPassword;
            user.role = 'admin';
            user.name = 'Administrator';
            await user.save();
        } else {
            console.log('Creating new admin user...');
            user = new User({
                name: 'Administrator',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin'
            });
            await user.save();
        }

        console.log('Admin user seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();
