// // server.js - Node.js Backend with Express and MongoDB
// const express = require('express');
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const cors = require('cors');
// const session = require('express-session');
// const MongoStore = require('connect-mongo');
// const path = require('path');
// require('dotenv').config();

// const app = express();

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// // Serve static files from the frontend directory
// app.use(express.static(path.join(__dirname, '../frontend')));
// // app.use(cors({
// //     origin: 'http://localhost:3000', // Your frontend URL
// //     credentials: true
// // }));

// app.use(cors({
//   origin: [
//     'http://localhost:3000',
//     'http://127.0.0.1:5500'
//   ],
//   credentials: true
// }));
// // Session Configuration
// app.use(session({
//     secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
//     resave: false,
//     saveUninitialized: false,
//     store: MongoStore.create({
//         mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/busbooking',
//         ttl: 24 * 60 * 60 // 1 day
//     }),
//     cookie: {
//         maxAge: 24 * 60 * 60 * 1000, // 1 day
//         httpOnly: true,
//         secure: false // Set to true in production with HTTPS
//     }
// }));

// // MongoDB Connection
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/busbooking', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })
// .then(() => console.log('✅ MongoDB Connected Successfully'))
// .catch(err => console.error('❌ MongoDB Connection Error:', err));

// // User Schema
// const userSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: [true, 'Name is required'],
//         trim: true,
//         minlength: [2, 'Name must be at least 2 characters']
//     },
//     email: {
//         type: String,
//         required: [true, 'Email is required'],
//         unique: true,
//         lowercase: true,
//         trim: true,
//         match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
//     },
//     password: {
//         type: String,
//         required: [true, 'Password is required'],
//         minlength: [6, 'Password must be at least 6 characters']
//     },
//     googleId: {
//         type: String,
//         sparse: true
//     },
//     profilePicture: {
//         type: String,
//         default: ''
//     },
//     isVerified: {
//         type: Boolean,
//         default: false
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     },
//     lastLogin: {
//         type: Date
//     }
// });

// // Hash password before saving
// userSchema.pre('save', async function(next) {
//     if (!this.isModified('password')) return next();
    
//     try {
//         const salt = await bcrypt.genSalt(10);
//         this.password = await bcrypt.hash(this.password, salt);
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

// // Method to compare passwords
// userSchema.methods.comparePassword = async function(candidatePassword) {
//     return await bcrypt.compare(candidatePassword, this.password);
// };

// // Method to generate JWT token
// userSchema.methods.generateAuthToken = function() {
//     const token = jwt.sign(
//         { _id: this._id, email: this.email, name: this.name },
//         process.env.JWT_SECRET || 'your-jwt-secret-change-in-production',
//         { expiresIn: '7d' }
//     );
//     return token;
// };

// const User = mongoose.model('User', userSchema);

// // Middleware to verify JWT token
// const authMiddleware = async (req, res, next) => {
//     try {
//         const token = req.header('Authorization')?.replace('Bearer ', '');
        
//         if (!token) {
//             return res.status(401).json({ message: 'Access denied. No token provided.' });
//         }

//         const decoded = jwt.verify(
//             token, 
//             process.env.JWT_SECRET || 'your-jwt-secret-change-in-production'
//         );
        
//         const user = await User.findById(decoded._id).select('-password');
        
//         if (!user) {
//             return res.status(401).json({ message: 'Invalid token.' });
//         }

//         req.user = user;
//         next();
//     } catch (error) {
//         res.status(401).json({ message: 'Invalid token.' });
//     }
// };

// // ==================== ROUTES ====================

// // Health Check
// app.get('/api/health', (req, res) => {
//     res.json({ 
//         status: 'OK', 
//         message: 'Server is running',
//         timestamp: new Date().toISOString()
//     });
// });

// // Register Route
// app.post('/api/auth/register', async (req, res) => {
//     try {
//         const { name, email, password } = req.body;

//         // Validation
//         if (!name || !email || !password) {
//             return res.status(400).json({ 
//                 message: 'All fields are required',
//                 success: false 
//             });
//         }

//         // Check if user already exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ 
//                 message: 'Email already registered',
//                 success: false 
//             });
//         }

//         // Create new user
//         const user = new User({
//             name,
//             email,
//             password
//         });

//         await user.save();

//         // Generate token
//         const token = user.generateAuthToken();

//         // Update last login
//         user.lastLogin = new Date();
//         await user.save();

//         // Set session
//         req.session.userId = user._id;
//         req.session.userEmail = user.email;

//         res.status(201).json({
//             success: true,
//             message: 'Account created successfully',
//             token,
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email
//             }
//         });

//     } catch (error) {
//         console.error('Registration error:', error);
//         res.status(500).json({ 
//             message: 'Server error during registration',
//             success: false 
//         });
//     }
// });

// // Login Route
// app.post('/api/auth/login', async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Validation
//         if (!email || !password) {
//             return res.status(400).json({ 
//                 message: 'Email and password are required',
//                 success: false 
//             });
//         }

//         // Find user
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(401).json({ 
//                 message: 'Invalid email or password',
//                 success: false 
//             });
//         }

//         // Check password
//         const isMatch = await user.comparePassword(password);
//         if (!isMatch) {
//             return res.status(401).json({ 
//                 message: 'Invalid email or password',
//                 success: false 
//             });
//         }

//         // Generate token
//         const token = user.generateAuthToken();

//         // Update last login
//         user.lastLogin = new Date();
//         await user.save();

//         // Set session
//         req.session.userId = user._id;
//         req.session.userEmail = user.email;

//         res.json({
//             success: true,
//             message: 'Login successful',
//             token,
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email
//             }
//         });

//     } catch (error) {
//         console.error('Login error:', error);
//         res.status(500).json({ 
//             message: 'Server error during login',
//             success: false 
//         });
//     }
// });

// // Logout Route
// app.post('/api/auth/logout', (req, res) => {
//     req.session.destroy((err) => {
//         if (err) {
//             return res.status(500).json({ 
//                 message: 'Error logging out',
//                 success: false 
//             });
//         }
//         res.json({ 
//             message: 'Logged out successfully',
//             success: true 
//         });
//     });
// });

// // Get Current User (Protected Route)
// app.get('/api/auth/me', authMiddleware, async (req, res) => {
//     try {
//         res.json({
//             success: true,
//             user: req.user
//         });
//     } catch (error) {
//         res.status(500).json({ 
//             message: 'Error fetching user data',
//             success: false 
//         });
//     }
// });

// // Forgot Password Route (Simplified - In production, send email)
// app.post('/api/auth/forgot-password', async (req, res) => {
//     try {
//         const { email } = req.body;

//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ 
//                 message: 'No account found with this email',
//                 success: false 
//             });
//         }

//         // In production, generate reset token and send email
//         // For now, just return success
//         res.json({
//             success: true,
//             message: 'Password reset link sent to your email'
//         });

//     } catch (error) {
//         res.status(500).json({ 
//             message: 'Error processing password reset',
//             success: false 
//         });
//     }
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).json({ 
//         message: 'Something went wrong!',
//         success: false 
//     });
// });

// // Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
//     console.log(`📡 API available at http://localhost:${PORT}/api`);
// });




// // In server.js, update bookingSchema
// const bookingSchema = new mongoose.Schema({
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     from: {
//         type: String,
//         required: [true, 'Departure city is required']
//     },
//     to: {
//         type: String,
//         required: [true, 'Destination city is required']
//     },
//     travelDate: {
//         type: Date,
//         required: [true, 'Travel date is required']
//     },
//     busType: {
//         type: String,
//         required: true
//     },
//     seats: [{
//         seatNumber: String,
//         price: Number
//     }],
//     pickupPoint: {           // NEW
//         type: String,
//         required: true
//     },
//     dropPoint: {             // NEW
//         type: String,
//         required: true
//     },
//     totalPrice: {
//         type: Number,
//         required: true
//     },
//     baseFare: Number,        // NEW
//     gst: Number,             // NEW
//     serviceFee: Number,      // NEW
//     paymentMethod: String,   // NEW
//     passengerDetails: {
//         name: String,
//         email: String,
//         phone: String
//     },
//     bookingStatus: {
//         type: String,
//         enum: ['confirmed', 'cancelled', 'pending'],
//         default: 'confirmed'
//     },
//     bookingId: {
//         type: String,
//         unique: true
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }
// });


// // In server.js, update POST /api/bookings
// app.post('/api/bookings', authMiddleware, async (req, res) => {
//     try {
//         const { 
//             from, 
//             to, 
//             travelDate, 
//             busType, 
//             seats, 
//             pickupPoint,      // NEW
//             dropPoint,        // NEW
//             totalPrice, 
//             baseFare,         // NEW
//             gst,              // NEW
//             serviceFee,       // NEW
//             paymentMethod,    // NEW
//             passengerDetails 
//         } = req.body;

//         // Validation
//         if (!from || !to || !travelDate || !busType || !seats || !totalPrice || !pickupPoint || !dropPoint) {
//             return res.status(400).json({
//                 message: 'All booking fields are required',
//                 success: false
//             });
//         }

//         // Create booking with all details
//         const booking = new Booking({
//             userId: req.user._id,
//             from,
//             to,
//             travelDate,
//             busType,
//             seats,
//             pickupPoint,
//             dropPoint,
//             totalPrice,
//             baseFare,
//             gst,
//             serviceFee,
//             paymentMethod,
//             passengerDetails: passengerDetails || {
//                 name: req.user.name,
//                 email: req.user.email
//             }
//         });

//         await booking.save();

//         res.status(201).json({
//             success: true,
//             message: 'Booking created successfully',
//             booking: {
//                 bookingId: booking.bookingId,
//                 from: booking.from,
//                 to: booking.to,
//                 travelDate: booking.travelDate,
//                 pickupPoint: booking.pickupPoint,
//                 dropPoint: booking.dropPoint,
//                 totalPrice: booking.totalPrice,
//                 seats: booking.seats
//             }
//         });

//     } catch (error) {
//         console.error('Booking creation error:', error);
//         res.status(500).json({
//             message: 'Error creating booking',
//             success: false
//         });
//     }
// });

// // Catch-all route - serve index.html for any unmatched routes
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../frontend/index.html'));
// });


















// // server.js - Node.js Backend with Express and MongoDB
// const express = require('express');
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const cors = require('cors');
// const session = require('express-session');
// const MongoStore = require('connect-mongo');
// const path = require('path');
// require('dotenv').config();

// const app = express();

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Serve static files from the frontend directory
// app.use(express.static(path.join(__dirname, '../frontend')));

// // CORS Configuration
// app.use(cors({
//     origin: [
//         'http://localhost:3000',
//         'http://127.0.0.1:5500',
//         'http://localhost:5500'
//     ],
//     credentials: true
// }));

// // Session Configuration
// app.use(session({
//     secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
//     resave: false,
//     saveUninitialized: false,
//     store: MongoStore.create({
//         mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/busbooking',
//         ttl: 24 * 60 * 60 // 1 day
//     }),
//     cookie: {
//         maxAge: 24 * 60 * 60 * 1000, // 1 day
//         httpOnly: true,
//         secure: false // Set to true in production with HTTPS
//     }
// }));

// // MongoDB Connection
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/busbooking', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })
// .then(() => console.log('✅ MongoDB Connected Successfully'))
// .catch(err => console.error('❌ MongoDB Connection Error:', err));

// // ==================== SCHEMAS AND MODELS ====================

// // User Schema
// const userSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: [true, 'Name is required'],
//         trim: true,
//         minlength: [2, 'Name must be at least 2 characters']
//     },
//     email: {
//         type: String,
//         required: [true, 'Email is required'],
//         unique: true,
//         lowercase: true,
//         trim: true,
//         match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
//     },
//     password: {
//         type: String,
//         required: [true, 'Password is required'],
//         minlength: [6, 'Password must be at least 6 characters']
//     },
//     phone: {
//         type: String,
//         default: ''
//     },
//     googleId: {
//         type: String,
//         sparse: true
//     },
//     profilePicture: {
//         type: String,
//         default: ''
//     },
//     isVerified: {
//         type: Boolean,
//         default: false
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     },
//     lastLogin: {
//         type: Date
//     }
// });

// // Hash password before saving
// userSchema.pre('save', async function(next) {
//     if (!this.isModified('password')) return next();
    
//     try {
//         const salt = await bcrypt.genSalt(10);
//         this.password = await bcrypt.hash(this.password, salt);
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

// // Method to compare passwords
// userSchema.methods.comparePassword = async function(candidatePassword) {
//     return await bcrypt.compare(candidatePassword, this.password);
// };

// // Method to generate JWT token
// userSchema.methods.generateAuthToken = function() {
//     const token = jwt.sign(
//         { _id: this._id, email: this.email, name: this.name },
//         process.env.JWT_SECRET || 'your-jwt-secret-change-in-production',
//         { expiresIn: '7d' }
//     );
//     return token;
// };

// const User = mongoose.model('User', userSchema);

// // Booking Schema with ALL fields
// const bookingSchema = new mongoose.Schema({
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     bookingId: {
//         type: String,
//         unique: true,
//         required: true
//     },
//     // Route Information
//     from: {
//         type: String,
//         required: [true, 'Departure city is required']
//     },
//     to: {
//         type: String,
//         required: [true, 'Destination city is required']
//     },
//     travelDate: {
//         type: String,
//         required: [true, 'Travel date is required']
//     },
//     busType: {
//         type: String,
//         required: true,
//         default: 'AC Sleeper'
//     },
//     // Seat Information
//     seats: [{
//         seatNumber: String,
//         price: Number
//     }],
//     totalSeats: {
//         type: Number,
//         required: true
//     },
//     // Pickup and Drop Points
//     pickupPoint: {
//         type: String,
//         required: true
//     },
//     dropPoint: {
//         type: String,
//         required: true
//     },
//     // Passenger Details
//     passengers: {
//         type: mongoose.Schema.Types.Mixed, // Can be array of passenger objects or count
//         required: true
//     },
//     contactDetails: {
//         mobile: String,
//         email: String,
//         whatsappUpdates: Boolean
//     },
//     passengerDetails: {
//         name: String,
//         email: String,
//         phone: String
//     },
//     // Pricing Details
//     baseFare: {
//         type: Number,
//         required: true
//     },
//     gst: {
//         type: Number,
//         default: 0
//     },
//     serviceFee: {
//         type: Number,
//         default: 0
//     },
//     insurance: {
//         type: Number,
//         default: 0
//     },
//     totalPrice: {
//         type: Number,
//         required: true
//     },
//     // Payment Information
//     paymentMethod: {
//         type: String,
//         enum: ['upi', 'card', 'wallet', 'netbanking'],
//         default: 'upi'
//     },
//     paymentStatus: {
//         type: String,
//         enum: ['pending', 'completed', 'failed'],
//         default: 'completed'
//     },
//     // Booking Status
//     bookingStatus: {
//         type: String,
//         enum: ['confirmed', 'cancelled', 'pending'],
//         default: 'confirmed'
//     },
//     // Timestamps
//     bookingDate: {
//         type: Date,
//         default: Date.now
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     },
//     updatedAt: {
//         type: Date,
//         default: Date.now
//     }
// });

// // Generate unique booking ID before saving
// bookingSchema.pre('save', function(next) {
//     if (!this.bookingId) {
//         this.bookingId = 'BUS' + Date.now() + Math.floor(Math.random() * 1000);
//     }
//     this.updatedAt = Date.now();
//     next();
// });

// const Booking = mongoose.model('Booking', bookingSchema);

// // ==================== MIDDLEWARE ====================

// // Middleware to verify JWT token
// const authMiddleware = async (req, res, next) => {
//     try {
//         const token = req.header('Authorization')?.replace('Bearer ', '');
        
//         if (!token) {
//             return res.status(401).json({ message: 'Access denied. No token provided.' });
//         }

//         const decoded = jwt.verify(
//             token, 
//             process.env.JWT_SECRET || 'your-jwt-secret-change-in-production'
//         );
        
//         const user = await User.findById(decoded._id).select('-password');
        
//         if (!user) {
//             return res.status(401).json({ message: 'Invalid token.' });
//         }

//         req.user = user;
//         next();
//     } catch (error) {
//         res.status(401).json({ message: 'Invalid token.' });
//     }
// };

// // ==================== AUTHENTICATION ROUTES ====================

// // Health Check
// app.get('/api/health', (req, res) => {
//     res.json({ 
//         status: 'OK', 
//         message: 'Server is running',
//         timestamp: new Date().toISOString()
//     });
// });

// // Register Route
// app.post('/api/auth/register', async (req, res) => {
//     try {
//         const { name, email, password, phone } = req.body;

//         // Validation
//         if (!name || !email || !password) {
//             return res.status(400).json({ 
//                 message: 'All fields are required',
//                 success: false 
//             });
//         }

//         // Check if user already exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ 
//                 message: 'Email already registered',
//                 success: false 
//             });
//         }

//         // Create new user
//         const user = new User({
//             name,
//             email,
//             password,
//             phone: phone || ''
//         });

//         await user.save();

//         // Generate token
//         const token = user.generateAuthToken();

//         // Update last login
//         user.lastLogin = new Date();
//         await user.save();

//         // Set session
//         req.session.userId = user._id;
//         req.session.userEmail = user.email;

//         res.status(201).json({
//             success: true,
//             message: 'Account created successfully',
//             token,
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 phone: user.phone
//             }
//         });

//     } catch (error) {
//         console.error('Registration error:', error);
//         res.status(500).json({ 
//             message: 'Server error during registration',
//             success: false 
//         });
//     }
// });

// // Login Route
// app.post('/api/auth/login', async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Validation
//         if (!email || !password) {
//             return res.status(400).json({ 
//                 message: 'Email and password are required',
//                 success: false 
//             });
//         }

//         // Find user
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(401).json({ 
//                 message: 'Invalid email or password',
//                 success: false 
//             });
//         }

//         // Check password
//         const isMatch = await user.comparePassword(password);
//         if (!isMatch) {
//             return res.status(401).json({ 
//                 message: 'Invalid email or password',
//                 success: false 
//             });
//         }

//         // Generate token
//         const token = user.generateAuthToken();

//         // Update last login
//         user.lastLogin = new Date();
//         await user.save();

//         // Set session
//         req.session.userId = user._id;
//         req.session.userEmail = user.email;

//         res.json({
//             success: true,
//             message: 'Login successful',
//             token,
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 phone: user.phone
//             }
//         });

//     } catch (error) {
//         console.error('Login error:', error);
//         res.status(500).json({ 
//             message: 'Server error during login',
//             success: false 
//         });
//     }
// });

// // Logout Route
// app.post('/api/auth/logout', (req, res) => {
//     req.session.destroy((err) => {
//         if (err) {
//             return res.status(500).json({ 
//                 message: 'Error logging out',
//                 success: false 
//             });
//         }
//         res.json({ 
//             message: 'Logged out successfully',
//             success: true 
//         });
//     });
// });

// // Get Current User (Protected Route)
// app.get('/api/auth/me', authMiddleware, async (req, res) => {
//     try {
//         res.json({
//             success: true,
//             user: req.user
//         });
//     } catch (error) {
//         res.status(500).json({ 
//             message: 'Error fetching user data',
//             success: false 
//         });
//     }
// });

// // Forgot Password Route
// app.post('/api/auth/forgot-password', async (req, res) => {
//     try {
//         const { email } = req.body;

//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ 
//                 message: 'No account found with this email',
//                 success: false 
//             });
//         }

//         // In production, generate reset token and send email
//         res.json({
//             success: true,
//             message: 'Password reset link sent to your email'
//         });

//     } catch (error) {
//         res.status(500).json({ 
//             message: 'Error processing password reset',
//             success: false 
//         });
//     }
// });

// // ==================== BOOKING ROUTES ====================

// // Create Booking - COMPLETE VERSION with ALL fields
// app.post('/api/bookings', authMiddleware, async (req, res) => {
//     try {
//         console.log('📥 Received booking request:', req.body);
        
//         const { 
//             from, 
//             to, 
//             travelDate, 
//             busType, 
//             seats, 
//             pickupPoint,
//             dropPoint,
//             passengers,
//             contactDetails,
//             passengerDetails,
//             baseFare,
//             gst,
//             serviceFee,
//             insurance,
//             totalPrice,
//             paymentMethod
//         } = req.body;

//         // Validation
//         if (!from || !to || !travelDate || !seats || !totalPrice || !pickupPoint || !dropPoint) {
//             return res.status(400).json({
//                 message: 'Required fields: from, to, travelDate, seats, totalPrice, pickupPoint, dropPoint',
//                 success: false
//             });
//         }

//         // Calculate total seats
//         const totalSeats = Array.isArray(seats) ? seats.length : 1;

//         // Create booking with all details
//         const booking = new Booking({
//             userId: req.user._id,
//             from,
//             to,
//             travelDate,
//             busType: busType || 'AC Sleeper',
//             seats: Array.isArray(seats) ? seats : [{ seatNumber: seats, price: baseFare }],
//             totalSeats,
//             pickupPoint,
//             dropPoint,
//             passengers,
//             contactDetails: contactDetails || {},
//             passengerDetails: passengerDetails || {
//                 name: req.user.name,
//                 email: req.user.email,
//                 phone: req.user.phone
//             },
//             baseFare: baseFare || totalPrice,
//             gst: gst || 0,
//             serviceFee: serviceFee || 0,
//             insurance: insurance || 0,
//             totalPrice,
//             paymentMethod: paymentMethod || 'upi',
//             paymentStatus: 'completed',
//             bookingStatus: 'confirmed'
//         });

//         await booking.save();

//         console.log('✅ Booking saved successfully:', booking.bookingId);

//         res.status(201).json({
//             success: true,
//             message: 'Booking created successfully',
//             booking: {
//                 bookingId: booking.bookingId,
//                 from: booking.from,
//                 to: booking.to,
//                 travelDate: booking.travelDate,
//                 pickupPoint: booking.pickupPoint,
//                 dropPoint: booking.dropPoint,
//                 totalPrice: booking.totalPrice,
//                 seats: booking.seats,
//                 bookingStatus: booking.bookingStatus
//             }
//         });

//     } catch (error) {
//         console.error('❌ Booking creation error:', error);
//         res.status(500).json({
//             message: 'Error creating booking: ' + error.message,
//             success: false
//         });
//     }
// });

// // Get All Bookings for Current User
// app.get('/api/bookings', authMiddleware, async (req, res) => {
//     try {
//         const bookings = await Booking.find({ userId: req.user._id })
//             .sort({ createdAt: -1 })
//             .select('-__v');

//         res.json({
//             success: true,
//             count: bookings.length,
//             bookings
//         });

//     } catch (error) {
//         console.error('Error fetching bookings:', error);
//         res.status(500).json({
//             message: 'Error fetching bookings',
//             success: false
//         });
//     }
// });

// // Get Single Booking by ID
// app.get('/api/bookings/:bookingId', authMiddleware, async (req, res) => {
//     try {
//         const booking = await Booking.findOne({ 
//             bookingId: req.params.bookingId,
//             userId: req.user._id 
//         });

//         if (!booking) {
//             return res.status(404).json({
//                 message: 'Booking not found',
//                 success: false
//             });
//         }

//         res.json({
//             success: true,
//             booking
//         });

//     } catch (error) {
//         console.error('Error fetching booking:', error);
//         res.status(500).json({
//             message: 'Error fetching booking details',
//             success: false
//         });
//     }
// });

// // Cancel Booking
// app.patch('/api/bookings/:bookingId/cancel', authMiddleware, async (req, res) => {
//     try {
//         const booking = await Booking.findOne({ 
//             bookingId: req.params.bookingId,
//             userId: req.user._id 
//         });

//         if (!booking) {
//             return res.status(404).json({
//                 message: 'Booking not found',
//                 success: false
//             });
//         }

//         if (booking.bookingStatus === 'cancelled') {
//             return res.status(400).json({
//                 message: 'Booking is already cancelled',
//                 success: false
//             });
//         }

//         booking.bookingStatus = 'cancelled';
//         booking.updatedAt = Date.now();
//         await booking.save();

//         res.json({
//             success: true,
//             message: 'Booking cancelled successfully',
//             booking
//         });

//     } catch (error) {
//         console.error('Error cancelling booking:', error);
//         res.status(500).json({
//             message: 'Error cancelling booking',
//             success: false
//         });
//     }
// });

// // Get Booking Statistics (Admin/User Dashboard)
// app.get('/api/bookings/stats/summary', authMiddleware, async (req, res) => {
//     try {
//         const totalBookings = await Booking.countDocuments({ userId: req.user._id });
//         const confirmedBookings = await Booking.countDocuments({ 
//             userId: req.user._id, 
//             bookingStatus: 'confirmed' 
//         });
//         const cancelledBookings = await Booking.countDocuments({ 
//             userId: req.user._id, 
//             bookingStatus: 'cancelled' 
//         });

//         const totalSpent = await Booking.aggregate([
//             { $match: { userId: req.user._id, bookingStatus: 'confirmed' } },
//             { $group: { _id: null, total: { $sum: '$totalPrice' } } }
//         ]);

//         res.json({
//             success: true,
//             stats: {
//                 totalBookings,
//                 confirmedBookings,
//                 cancelledBookings,
//                 totalSpent: totalSpent[0]?.total || 0
//             }
//         });

//     } catch (error) {
//         console.error('Error fetching stats:', error);
//         res.status(500).json({
//             message: 'Error fetching statistics',
//             success: false
//         });
//     }
// });

// // ==================== ERROR HANDLING ====================

// // Error handling middleware
// app.use((err, req, res, next) => {
//     console.error('💥 Error:', err.stack);
//     res.status(500).json({ 
//         message: 'Something went wrong!',
//         error: process.env.NODE_ENV === 'development' ? err.message : undefined,
//         success: false 
//     });
// });

// // Catch-all route - serve index.html for any unmatched routes
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../frontend/index.html'));
// });

// // ==================== START SERVER ====================

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
//     console.log(`📡 API available at http://localhost:${PORT}/api`);
//     console.log(`📊 MongoDB: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/busbooking'}`);
// });

// server.js - Node.js Backend with Express and MongoDB
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));
// app.use(cors({
//     origin: 'http://localhost:3000', // Your frontend URL
//     credentials: true
// }));

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:5500'
  ],
  credentials: true
}));
// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/busbooking',
        ttl: 24 * 60 * 60 // 1 day
    }),
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        httpOnly: true,
        secure: false // Set to true in production with HTTPS
    }
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/busbooking', {
    // useNewUrlParser: true,  // Deprecated
    // useUnifiedTopology: true  // Deprecated
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    googleId: {
        type: String,
        sparse: true
    },
    profilePicture: {
        type: String,
        default: ''
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign(
        { _id: this._id, email: this.email, name: this.name },
        process.env.JWT_SECRET || 'your-jwt-secret-change-in-production',
        { expiresIn: '7d' }
    );
    return token;
};

const User = mongoose.model('User', userSchema);

// Middleware to verify JWT token
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'your-jwt-secret-change-in-production'
        );
        
        const user = await User.findById(decoded._id).select('-password');
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid token.' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};

// ==================== ROUTES ====================

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Register Route
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ 
                message: 'All fields are required',
                success: false 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                message: 'Email already registered',
                success: false 
            });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password
        });

        await user.save();

        // Generate token
        const token = user.generateAuthToken();

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Set session
        req.session.userId = user._id;
        req.session.userEmail = user.email;

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Server error during registration',
            success: false 
        });
    }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email and password are required',
                success: false 
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                message: 'Invalid email or password',
                success: false 
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                message: 'Invalid email or password',
                success: false 
            });
        }

        // Generate token
        const token = user.generateAuthToken();

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Set session
        req.session.userId = user._id;
        req.session.userEmail = user.email;

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Server error during login',
            success: false 
        });
    }
});

// Logout Route
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ 
                message: 'Error logging out',
                success: false 
            });
        }
        res.json({ 
            message: 'Logged out successfully',
            success: true 
        });
    });
});

// Get Current User (Protected Route)
app.get('/api/auth/me', authMiddleware, async (req, res) => {
    try {
        res.json({
            success: true,
            user: req.user
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching user data',
            success: false 
        });
    }
});

// Forgot Password Route (Simplified - In production, send email)
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ 
                message: 'No account found with this email',
                success: false 
            });
        }

        // In production, generate reset token and send email
        // For now, just return success
        res.json({
            success: true,
            message: 'Password reset link sent to your email'
        });

    } catch (error) {
        res.status(500).json({ 
            message: 'Error processing password reset',
            success: false 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!',
        success: false 
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
});




// In server.js, update bookingSchema
const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    from: {
        type: String,
        required: [true, 'Departure city is required']
    },
    to: {
        type: String,
        required: [true, 'Destination city is required']
    },
    travelDate: {
        type: String,  // Changed to accept "29/1/2026" format
        required: [true, 'Travel date is required']
    },
    busType: {
        type: String,
        required: true
    },
    seats: [{
        seatNumber: String,
        price: Number
    }],
    pickupPoint: {           // NEW
        type: String,
        required: true
    },
    dropPoint: {             // NEW
        type: String,
        required: true
    },
    passengers: mongoose.Schema.Types.Mixed,
    contactDetails: {
        mobile: String,
        email: String,
        whatsappUpdates: Boolean  
    },
    insurance: {
        type: Number,
        default: 0
    },
    totalPrice: {
        type: Number,
        required: true
    },
    baseFare: Number,        // NEW
    gst: Number,             // NEW
    serviceFee: Number,      // NEW
    paymentMethod: String,   // NEW
    passengerDetails: {
        name: String,
        email: String,
        phone: String
    },
    bookingStatus: {
        type: String,
        enum: ['confirmed', 'cancelled', 'pending'],
        default: 'confirmed'
    },
    bookingId: {
        type: String,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Generate booking ID before saving
bookingSchema.pre('save', function(next) {
    if (!this.bookingId) {
        this.bookingId = 'BUS' + Date.now() + Math.floor(Math.random() * 1000);
    }
    next();
});

// Create Booking model
const Booking = mongoose.model('Booking', bookingSchema);


// In server.js, update POST /api/bookings
app.post('/api/bookings', authMiddleware, async (req, res) => {
    try {
        const { 
            from, 
            to, 
            travelDate, 
            busType, 
            seats, 
            pickupPoint,      // NEW
            dropPoint,        // NEW
            totalPrice, 
            baseFare,         // NEW
            gst,              // NEW
            serviceFee,       // NEW
            paymentMethod,    // NEW
            passengerDetails 
        } = req.body;

        // Validation
        if (!from || !to || !travelDate || !busType || !seats || !totalPrice || !pickupPoint || !dropPoint) {
            return res.status(400).json({
                message: 'All booking fields are required',
                success: false
            });
        }

        // Create booking with all details
        const booking = new Booking({
            userId: req.user._id,
            from,
            to,
            travelDate,
            busType,
            seats,
            pickupPoint,
            dropPoint,
            totalPrice,
            baseFare,
            gst,
            serviceFee,
            paymentMethod,
            passengerDetails: passengerDetails || {
                name: req.user.name,
                email: req.user.email
            }
        });

        await booking.save();

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: {
                bookingId: booking.bookingId,
                from: booking.from,
                to: booking.to,
                travelDate: booking.travelDate,
                pickupPoint: booking.pickupPoint,
                dropPoint: booking.dropPoint,
                totalPrice: booking.totalPrice,
                seats: booking.seats
            }
        });

    } catch (error) {
        console.error('Booking creation error:', error);
        res.status(500).json({
            message: 'Error creating booking',
            success: false
        });
    }
});

// Catch-all route - serve index.html for any unmatched routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});