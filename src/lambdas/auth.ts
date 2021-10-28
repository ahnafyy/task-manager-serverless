import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Login from '../interfaces/login'
import { response, generatePolicy } from '../utils'
import { secret } from '../config/index'
import { DynamoDB } from 'aws-sdk'

const db = new DynamoDB.DocumentClient()
const userTable = process.env.USERS_TABLE || ''

// @route   POST api/auth/login
// @desc    Authenticate user
// @access  Public
export const login = async (event: any) => {
  const { body } = event
  const { username, password }: Login = JSON.parse(body)

  if (!username || !password) {
    return response(400, { msg: 'Invalid request body' })
  }

  try {
    const { Items } = await db
      .scan({
        TableName: userTable,
        FilterExpression: 'username = :username',
        ExpressionAttributeValues: {
          ':username': username
        },
        Limit: 1
      })
      .promise()

    if (!Items || Items.length === 0) {
      return response(401, { msg: 'Invalid login' })
    }

    const storedUser = Items[0]

    const isMatch = await bcrypt.compare(password, storedUser.password)
    if (!isMatch) {
      return response(401, { msg: 'Invalid login' })
    }

    const token = jwt.sign({ id: storedUser.id }, secret, {
      expiresIn: 3600
    })

    return response(200, {
      token,
      user: storedUser
    })
  } catch (e) {
    return response(500, { msg: e.error })
  }
}

export const authenticate = async (event: any) => {
  const { authorizationToken } = event
  if (!authorizationToken) {
    return response(401, { msg: 'Missing token' })
  }

  // Remove 'Bearer '
  const token = authorizationToken.substring(7, authorizationToken.length)
  try {
    const decoded = jwt.verify(token, secret)
    return generatePolicy(token.sub, 'Allow', event.methodArn)
  } catch (e) {
    return response(500, { msg: e.message })
  }
}
