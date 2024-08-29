import express, { Application } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import connectDatabase from './src/config/db';
import userRoutes from './src/routes/userRoutes';

dotenv.config();

const app: Application = express();

// Connect to MongoDB
connectDatabase();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/api', userRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to our E-commerce-nodejs');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
