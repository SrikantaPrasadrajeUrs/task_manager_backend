import { Request, Response } from "express";
import { NewTask, tasks } from "../db/schema";
import { db } from "../db";
import { AuthRequest } from "../interfaces";
import { eq } from "drizzle-orm";

const addTask = async(req:AuthRequest,res:Response)=>{
    try {
        const newTask:NewTask = {...req.body,uid:req.user};
        
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
        const allTasks = await db.select().from(tasks);
    
       if(!allTasks){
            res.status(400).json({message:"No tasks found"});
            return;
       }
       res.status(200).json({message:"Task fetched successfully",taskData:allTasks});
    } catch (error) {
        res.status(500).json({message:"Some error occurred"});
    }
}

const deleteTask = async (req:Request,res:Response)=>{
    try {
        const {taskId} = req.params;
        if(!taskId){
            res.status(400).json({message:"TaskId cannot be empty"});
            return;
        }
        await db.delete(tasks).where(eq(tasks.id,taskId));
        res.status(200).json({message:"Task deleted successfully"})
    } catch (error) {
        res.status(500).json({message:"Error deleting task"});
    }
}

export {addTask, getTasks, deleteTask}