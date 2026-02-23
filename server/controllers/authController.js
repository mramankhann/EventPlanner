import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createLog } from './adminController.js';

const JWT_SECRET = 'your_jwt_secret_key_here'; // In production, use process.env.JWT_SECRET

export const register = async (req, res) => {
    const { name, email, password, role } = req.body;
    const adminId = req.headers['x-user-id'];
    const adminName = req.headers['x-user-name'] || 'Admin';

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'user'
        });

        await user.save();

        // Log activity
        await createLog(adminId || user._id, adminName, 'User created', name);

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

const generateDisplayCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if code needs rotation (only if invalid or expired)
        if (!user.displayCode || isCodeExpired(user.displayCodeCreatedAt)) {
            const displayCode = generateDisplayCode();
            user.displayCode = displayCode;
            user.displayCodeCreatedAt = new Date();
            await user.save();
        }

        // Log activity
        await createLog(user._id, user.name, 'Login', user.email);

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

        res.json({
            message: 'Login successful',
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, displayCode: user.displayCode }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

export const logout = async (req, res) => {
    const userId = req.headers['x-user-id'];
    const userName = req.headers['x-user-name'] || 'User';

    try {
        if (userId) {
            await createLog(userId, userName, 'Logout', userName);
        }
        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout Error:', error);
        res.status(500).json({ message: 'Server error during logout' });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (error) {
        console.error('Get Users Error:', error);
        res.status(500).json({ message: 'Server error fetching users' });
    }
};

export const updatePassword = async (req, res) => {
    const { userId, newPassword } = req.body;
    const adminId = req.headers['x-user-id'];
    const adminName = req.headers['x-user-name'] || 'Admin';

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        // Log activity
        await createLog(adminId || userId, adminName, 'Password changed', user.name);

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Update Password Error:', error);
        res.status(500).json({ message: 'Server error updating password' });
    }
};

export const deleteUser = async (req, res) => {
    const adminId = req.headers['x-user-id'];
    const adminName = req.headers['x-user-name'] || 'Admin';

    try {
        const user = await User.findById(req.params.id);
        if (user) {
            const userName = user.name;
            await User.findByIdAndDelete(req.params.id);
            // Log activity
            await createLog(adminId || 'system', adminName, 'User deleted', userName);
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ message: 'Server error deleting user' });
    }
};

export const updateRole = async (req, res) => {
    const { userId, role } = req.body;
    const adminId = req.headers['x-user-id'];
    const adminName = req.headers['x-user-name'] || 'Admin';

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role;
        await user.save();

        // Log activity
        await createLog(adminId || userId, adminName, 'Role updated', `${user.name} to ${role}`);

        res.json({ message: 'Role updated successfully' });
    } catch (error) {
        console.error('Update Role Error:', error);
        res.status(500).json({ message: 'Server error updating role' });
    }
};

export const regenerateDisplayCode = async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const newCode = generateDisplayCode();
        user.displayCode = newCode;
        user.displayCodeCreatedAt = new Date();
        await user.save();
        res.json({ displayCode: newCode });
    } catch (error) {
        console.error('Regenerate Code Error:', error);
        res.status(500).json({ message: 'Server error regenerating code' });
    }
};

const isCodeExpired = (createdAt) => {
    if (!createdAt) return true;
    const now = new Date();
    const created = new Date(createdAt);

    // Get most recent 00:30 UTC (which is 6:00 AM IST)
    const resetUTC = new Date(now);
    resetUTC.setUTCHours(0, 30, 0, 0);

    if (now < resetUTC) {
        resetUTC.setUTCDate(resetUTC.getUTCDate() - 1);
    }

    return created < resetUTC;
};

export const verifyDisplayCode = async (req, res) => {
    const { code } = req.body;
    try {
        const user = await User.findOne({ displayCode: code });
        if (!user) {
            return res.status(400).json({ message: 'Invalid display code' });
        }

        if (isCodeExpired(user.displayCodeCreatedAt)) {
            return res.status(400).json({ message: 'Display code has expired. Please check your dashboard for a new code.' });
        }

        res.json({ userId: user._id, userName: user.name });
    } catch (error) {
        console.error('Verify Display Code Error:', error);
        res.status(500).json({ message: 'Server error verifying code' });
    }
};

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check for rotation
        if (isCodeExpired(user.displayCodeCreatedAt)) {
            user.displayCode = generateDisplayCode();
            user.displayCodeCreatedAt = new Date();
            await user.save();
        }

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            displayCode: user.displayCode,
            displayCodeCreatedAt: user.displayCodeCreatedAt
        });
    } catch (error) {
        console.error('Get User Error:', error);
        res.status(500).json({ message: 'Server error fetching user' });
    }
};
