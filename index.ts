// cSpell:disable
import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import QueryBuilder from "./QueryBuilder";
import cors from "cors";
import bcrypt from "bcrypt";
require("dotenv").config();

const app = express();
const jwt = require("jsonwebtoken");

app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173", "https://task-manager-redux.surge.sh"], 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true 
}));

// Connect to MongoDB
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ruowzmj.mongodb.net/`);

app.get("/", (req, res)=>{
  res.send("Welcome to the Task Manager API!");
})

// Task Schema
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  priority: { type: String, enum: ["Low", "Medium", "High"], required: true },
  dueDate: { type: Date },
  isCompleted: { type: Boolean, default: false },
  assignedTo: { type: String, default: null },
  userId: { type: String, required: true}
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  photoURL: { type: String },
})

interface IUser {
  username: string;
  email: string;
}

// Pre-save hook to hash the password
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
  next();
});

const Task = mongoose.model("Task", taskSchema);
const User = mongoose.model("User", userSchema);


// JWT
app.post("/jwt", async (req: Request, res: Response) => {
  const user: IUser = req.body; 
  const token = jwt.sign(user, process.env.Access_Token_Secret as string, {
    expiresIn: "1h",
  });
  res.send({ token });
});

interface IDecodedToken {
  username: string;
  email: string;
  _id: string;
}

// middleware
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  // console.log("inside verify token", req.headers.authorization);
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }
  const token = req.headers.authorization.split(" ")[1];
  // console.log('checking token',token);
  const secret = process.env.Access_Token_Secret;
  // console.log('checking secret',secret);
  jwt.verify(token, secret, (err:any, decoded:any) => {
    if (err) {
      // console.error("Token verification error:", err);
      return res.status(401).send({ message: "Unauthorized Access" });
    }
    console.log("Decoded token:", decoded, req);
    // req.decoded = decoded;
    next();
  });
};


// User Related API
app.post("/api/users", async (req: Request, res: Response) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(201).json({ message: "User created successfully", user: savedUser });
  } catch (error) {
    // Narrow the error type
    if (error instanceof Error) {
      res.status(400).json({ message: "Error creating user", error: error.message });
    } else {
      res.status(400).json({ message: "Unknown error occurred" });
    }
  }
});

// user login
app.post("/api/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Create a JWT token
    const token = jwt.sign(
      { email: user.email, username: user.name, _id: user._id },  
      process.env.Access_Token_Secret as string,  
      { expiresIn: "1h" }  
    );

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// get all users
app.get("/api/users", async (req: Request, res: Response) => {
  try {
    // Retrieve all tasks from the database
    const users = await User.find();

    // Send the tasks as a response
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Error retrieving Users", error: error.message });
    } else {
      res.status(500).json({ message: "An unexpected error occurred." });
    }
  }
});

// Get all tasks

app.get("/api/allTasks", async (req: Request, res: Response) => {
  try {
    // Retrieve all tasks from the database
    const tasks = await Task.find();

    // Send the tasks as a response
    res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Error retrieving tasks", error: error.message });
    } else {
      res.status(500).json({ message: "An unexpected error occurred." });
    }
  }
});

// get task by query parameters
app.get("/api/tasks", async (req: Request, res: Response) => {
  try {
    const { userId } = req.query; 

    if (!userId) {
      return res.status(400).json({ message: "Email is required" });
    }
    const queryBuilder = new QueryBuilder<typeof Task>(Task.find({ userId }), req.query);

    // Add query builder methods to the query
    queryBuilder
      .search(["title"]) // You can add more searchable fields
      .filter()
      .sort()
      .paginate()
      .fields();

    // Execute the query
    const tasks = await queryBuilder.modelQuery;

    // Count total documents and calculate pagination info
    const pagination = await queryBuilder.countTotal();

    res.json({
      tasks,
      pagination,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Error retrieving tasks", error: error.message });
    } else {
      res.status(500).json({ message: "An unexpected error occurred." });
    }
  }
});



// Create new task
app.post("/api/tasks", async (req: Request, res: Response) => {
  const task = new Task(req.body);
  const savedTask = await task.save();
  res.status(201).json(savedTask);
});

// Update task by ID
app.patch("/api/tasks/:id", async (req: Request, res: Response) => {
  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updatedTask);
});

// Delete task by ID
app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Task deleted" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
