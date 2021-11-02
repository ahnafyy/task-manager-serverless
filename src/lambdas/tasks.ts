import Task from '../interfaces/task'
import { response } from '../utils'
import { DynamoDB } from 'aws-sdk'
import { v4 as uuid } from 'uuid'

const db = new DynamoDB.DocumentClient()
const tasksTable = process.env.TASKS_TABLE || ''

// @route   GET api/tasks
// @desc    Get all tasks
// @access  Private
export const getTasks = async () => {
  try {
    const { Items } = await db
      .scan({
        TableName: tasksTable
      })
      .promise()
    return response(200, Items)
  } catch (e) {
    return response(500, { msg: e.message })
  }
}

// @route   POST api/tasks
// @desc    Create a task
// @access  Private
export const createTask = async (event: any) => {
  try {
    const { body } = event
    const { title, category, description, important, status, due, priority } =
      JSON.parse(body)

    if (!title || !category || !description || !status || !due || !priority) {
      return response(400, { msg: 'Invalid request body' })
    }

    const task: Task = {
      id: uuid(),
      title,
      category,
      description,
      important,
      createdOn: Date.now(),
      comments: [],
      status,
      due: new Date(due).getTime(),
      priority
    }

    await db
      .put({
        TableName: tasksTable,
        Item: task
      })
      .promise()
    return response(200, task)
  } catch (e) {
    return response(500, { msg: e.message })
  }
}

// @route   DELETE api/tasks
// @desc    Delete a task
// @access  Private
export const deleteTask = async (event: any) => {
  try {
    const { pathParameters } = event
    const { id } = pathParameters
    await db
      .delete({
        TableName: tasksTable,
        Key: {
          id
        }
      })
      .promise()
    return response(200)
  } catch (e) {
    return response(500, { msg: e.message })
  }
}
