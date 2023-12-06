import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://blackmoon202234:Haikyuu@cluster0.gvlztzx.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a Mongoose schema
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});

// Create a Mongoose model
const User = mongoose.model('User', UserSchema);

// Configure Passport
passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) return done(err);
      if (!user) return done(null, false, { message: 'Incorrect username.' });
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) return done(err);
        if (!result) return done(null, false, { message: 'Incorrect password.' });
        return done(null, user);
      });
    });
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// Middleware
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
    });
    await user.save();
    res.send('User registered successfully!');
  } catch (error) {
    res.status(500).send('Error registering user.');
  }
});

app.post('/login', passport.authenticate('local'), (req, res) => {
  res.send('Login successful!');
});

app.get('/logout', (req, res) => {
  req.logout();
  res.send('Logout successful!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
