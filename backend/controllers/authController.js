 const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/emailService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Input validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    if (username.length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters long' });
    }

    const normalizedEmail = email.toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists?.isVerified) {
      return res.status(400).json({ message: 'Email already registered. Please try logging in.' });
    }

    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    const user = userExists || new User({ email: normalizedEmail });
    user.name = username.trim();
    user.password = password;
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    res.status(201).json({
      message: 'Account created. Your verification code is being sent to your email.',
      userId: user._id,
      email: user.email
    });

    const message = `Your OTP for verification is: ${otp}\n\nThis OTP is valid for 10 minutes.`;
    sendEmail({
      email: user.email,
      subject: 'Email Verification OTP - AI Cold Mail Generator',
      message
    }).catch(error => console.error('Registration OTP email failed:', error));
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { userId, email, otp } = req.body;
    const identifier = email || userId;

    if (!identifier || !otp) {
      return res.status(400).json({ message: 'User ID or email and OTP are required' });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: 'OTP must be a 6-digit number' });
    }

    const isObjectId = typeof identifier === 'string' && /^[a-f\d]{24}$/i.test(identifier);
    const isEmail = typeof identifier === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    if (!isObjectId && !isEmail) {
      return res.status(400).json({ message: 'Provide a valid user ID or email address' });
    }

    const user = isObjectId
      ? await User.findById(identifier)
      : await User.findOne({ email: identifier.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified. Please login.' });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: 'No OTP found. Please register again.' });
    }

    if (Date.now() > user.otpExpiry.getTime()) {
      return res.status(400).json({ message: 'OTP has expired. Please register again.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
      message: 'Email verified successfully!'
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { userId, email } = req.body;
    const identifier = email || userId;

    if (!identifier) {
      return res.status(400).json({ message: 'User ID or email is required' });
    }

    const isObjectId = typeof identifier === 'string' && /^[a-f\d]{24}$/i.test(identifier);
    const isEmail = typeof identifier === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const user = isObjectId
      ? await User.findById(identifier)
      : isEmail
        ? await User.findOne({ email: identifier.trim().toLowerCase() })
        : null;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'Email Verification OTP - AI Cold Mail Generator',
      message: `Your OTP for verification is: ${otp}\n\nThis OTP is valid for 10 minutes.`
    });

    res.status(200).json({ message: 'A new verification code has been sent to your email.' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Could not resend the verification code', error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ 
        message: 'Please verify your email first',
        userId: user._id
      });
    }

    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
      message: 'Login successful!'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};