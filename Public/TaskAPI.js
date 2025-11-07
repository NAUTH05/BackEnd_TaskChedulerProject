import { Router } from 'express';
import { nanoid } from 'nanoid';
import { authenticateToken } from '../middleware/authMiddleware.js';
import Project from './models/Project.js';
import Task from './models/Task.js';
import User from './models/User.js';

const router = Router();

router.post('/tasks', authenticateToken, async (req, res) => {
    try {
        const { ProjectID, TaskName, TaskDescription, DueDate, Priority, Status, AssignedToUserID } = req.body;

        if (!ProjectID || !TaskName || !TaskDescription || !DueDate) {
            return res.status(400).json({
                message: 'Thiếu thông tin bắt buộc'
            });
        }

        const project = await Project.findById(ProjectID);
        if (!project) {
            return res.status(404).json({
                message: 'Không tìm thấy project'
            });
        }

        if (AssignedToUserID) {
            const user = await User.findById(AssignedToUserID);
            if (!user) {
                return res.status(404).json({
                    message: 'Không tìm thấy user'
                });
            }
        }

        const dueDate = new Date(DueDate);
        if (isNaN(dueDate.getTime())) {
            return res.status(400).json({
                message: 'Ngày không hợp lệ'
            });
        }

        const validPriorities = ['High', 'Medium', 'Low'];
        if (Priority && !validPriorities.includes(Priority)) {
            return res.status(400).json({
                message: 'Priority không hợp lệ'
            });
        }

        const validStatuses = ['To Do', 'In Progress', 'Done', 'Blocked'];
        if (Status && !validStatuses.includes(Status)) {
            return res.status(400).json({
                message: 'Status không hợp lệ'
            });
        }

        const newTaskID = nanoid(8);

        const newTask = new Task({
            TaskID: newTaskID,
            ProjectID,
            TaskName,
            TaskDescription,
            DueDate,
            Priority: Priority || 'Medium',
            Status: Status || 'To Do',
            AssignedToUserID: AssignedToUserID || null
        });

        await newTask.save();

        res.status(201).json({
            message: 'Tạo task thành công',
            taskId: newTask.TaskID,
            data: {
                TaskID: newTask.TaskID,
                ProjectID: newTask.ProjectID,
                TaskName: newTask.TaskName,
                TaskDescription: newTask.TaskDescription,
                DueDate: newTask.DueDate,
                Priority: newTask.Priority,
                Status: newTask.Status,
                AssignedToUserID: newTask.AssignedToUserID,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi server',
            error: error.message
        });
    }
});

router.get('/tasks', authenticateToken, async (req, res) => {
    try {
        const { ProjectID, AssignedToUserID, Status, Priority } = req.query;

        const query = {};
        if (ProjectID) query.ProjectID = ProjectID;
        if (AssignedToUserID) query.AssignedToUserID = AssignedToUserID;
        if (Status) query.Status = Status;
        if (Priority) query.Priority = Priority;

        const tasks = await Task.find(query);

        res.status(200).json({
            message: 'Lấy danh sách thành công',
            count: tasks.length,
            taskIds: tasks.map(t => t.TaskID),
            data: tasks
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi server',
            error: error.message
        });
    }
});

router.get('/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({
                message: 'Không tìm thấy task'
            });
        }

        res.status(200).json({
            message: 'Lấy thông tin thành công',
            taskId: task.TaskID,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi server',
            error: error.message
        });
    }
});

router.put('/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const existingTask = await Task.findById(id);
        if (!existingTask) {
            return res.status(404).json({
                message: 'Không tìm thấy task'
            });
        }

        if (updateData.DueDate) {
            const dueDate = new Date(updateData.DueDate);
            if (isNaN(dueDate.getTime())) {
                return res.status(400).json({
                    message: 'Ngày không hợp lệ'
                });
            }
        }

        if (updateData.Priority) {
            const validPriorities = ['High', 'Medium', 'Low'];
            if (!validPriorities.includes(updateData.Priority)) {
                return res.status(400).json({
                    message: 'Priority không hợp lệ'
                });
            }
        }

        if (updateData.Status) {
            const validStatuses = ['To Do', 'In Progress', 'Done', 'Blocked'];
            if (!validStatuses.includes(updateData.Status)) {
                return res.status(400).json({
                    message: 'Status không hợp lệ'
                });
            }
        }

        if (updateData.AssignedToUserID) {
            const user = await User.findById(updateData.AssignedToUserID);
            if (!user) {
                return res.status(404).json({
                    message: 'Không tìm thấy user'
                });
            }
        }

        delete updateData.TaskID;
        delete updateData.ProjectID;

        const updatedTask = await Task.findByIdAndUpdate(id, updateData, { new: true });

        res.status(200).json({
            message: 'Cập nhật thành công',
            taskId: id,
            data: updatedTask
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi server',
            error: error.message
        });
    }
});

router.delete('/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const existingTask = await Task.findById(id);
        if (!existingTask) {
            return res.status(404).json({
                message: 'Không tìm thấy task'
            });
        }

        await Task.findByIdAndDelete(id);

        res.status(200).json({
            message: 'Xóa thành công',
            taskId: id,
            deleted: true,
            data: { TaskID: id }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi server',
            error: error.message
        });
    }
});

export default router;
