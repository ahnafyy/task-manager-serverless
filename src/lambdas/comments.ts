import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../interfaces/user'
import { secret } from '../config/index'
import { response } from '../utils'
import { DynamoDB } from 'aws-sdk'
import { v4 as uuid } from 'uuid'
import Comment from '../interfaces/comment'

const db = new DynamoDB.DocumentClient()
const taskTable = process.env.TASKS_TABLE || ''

// @route   POST api/comments/:taskId
// @desc    Create a user
// @access  Public
export const createComment = async (event: any) => {
  try {
    const { body } = event
    const { user, text } = JSON.parse(body)

    if (!user || !text) {
      return response(400, { msg: 'Invalid request body' })
    }

    const comment: Comment = {
      id: uuid(),
      user: user,
      text,
      createdOn: Date.now()
    }

    const { pathParameters } = event
    const { taskId } = pathParameters

    const data: any = await db
      .update({
        TableName: taskTable,
        Key: { id: taskId },
        UpdateExpression: 'set #comments = list_append(#comments, :comment)',
        ExpressionAttributeNames: {
          '#comments': 'comments'
        },
        ExpressionAttributeValues: {
          ':comment': [comment]
        },
        ReturnValues: 'UPDATED_NEW'
      })
      .promise()
    const {
      Attributes: { comments }
    } = data
    return response(200, { comments })
  } catch (e) {
    return response(500, { msg: e.message })
  }
}
