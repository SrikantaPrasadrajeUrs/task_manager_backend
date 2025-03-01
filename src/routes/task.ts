import { Router } from "express";
import { auth } from "../middleware/auth";
import { addTask, deleteTask, getTasks, syncTasks } from "../controllers/task";

const taskRouter = Router();
taskRouter.use(auth);
taskRouter.post("/",addTask);
taskRouter.get("/",getTasks);
taskRouter.delete("/:taskId",deleteTask);
taskRouter.post("/syncTasks",syncTasks);
export default taskRouter;