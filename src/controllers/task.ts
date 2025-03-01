import { Request, Response } from "express";
import { NewTask, tasks } from "../db/schema";
import { db } from "../db";
import { AuthRequest } from "../interfaces";
import { eq } from "drizzle-orm";

const addTask = async(req:AuthRequest,res:Response)=>{
    try {
        const newTask:NewTask = {...req.body, dueAt: new Date(req.body.dueAt) ,uid:req.user};
        
       const [task]= await db.insert(tasks).values(newTask).returning();
    
       if(!task){
            res.status(400).json({message:"Task add failed"});
            return;
       }
       res.status(201).json({message:"Task added successfully",taskData:task});
    } catch (error) {
        res.status(500).json({message:"Some error occurred"});
    }
}

const getTasks = async(req:AuthRequest,res:Response)=>{
    try {
        const allTasks = await db.select().from(tasks).where(eq(tasks.uid,req.user as string));
    
       if(!allTasks){
            res.status(400).json({message:"No tasks found"});
            return;
       }
       res.status(200).json({message:"Task fetched successfully",taskData:allTasks});
    } catch (error) {
        res.status(500).json({message:"Some error occurred"});
    }
}

const deleteTask = async (req:AuthRequest,res:Response)=>{
    try {
        const {taskId} = req.params;
        if(!taskId){
            res.status(400).json({message:"TaskId cannot be empty"});
            return;
        }

        const task = await db.select().from(tasks).where(eq(tasks.id,taskId)).limit(1);
        
        if (!task.length) {
         res.status(404).json({ message: "Task not found" });
         return;
        }

        if (task[0].uid !== (req.user as string)) {
             res.status(403).json({ message: "Unauthorized to delete this task" });
             return;
        }

        await db.delete(tasks).where(eq(tasks.id, taskId));
        res.status(200).json({message:"Task deleted successfully"})
    } catch (error) {
        res.status(500).json({message:"Error deleting task"});
    }
}

const syncTasks = async(req:AuthRequest,res:Response)=>{
    try {
        const taskData = req.body; 
        if (!Array.isArray(taskData.tasks)) {
            res.status(400).json({ message: "Invalid request: taskList must be an array" });
            return;
        }
        const unSyncedTasks: NewTask[] = taskData.tasks.map((task:NewTask)=>{
            try {
                if (!task.title || !task.dueAt) {
                    throw new Error("Each task must have at least a title and dueAt field.");
                  }
            
                  return {
                    ...task,
                    dueAt: new Date(task.dueAt),
                    createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
                    updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date(),
                    uid: req.user!,
                  };
            } catch (e) {
                console.error("Error converting task dates:", e);
                throw new Error("Invalid date format in task data");
            }
        });
        const pushedTasks = await db.insert(tasks).values(unSyncedTasks).returning();
        console.log("hi",pushedTasks);
        res.status(201).json({mesaage:"All tasks synced",tasksData: pushedTasks});
    } catch (e) {
        res.status(500).json({mesaage: "error syncing tasks", error: e instanceof Error? e.message:e});
    }
}

export {addTask, getTasks, deleteTask, syncTasks}