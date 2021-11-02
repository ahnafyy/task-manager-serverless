import Comment from './comment'
import { Priority, Status } from './enums'
export default interface Task {
  id: string
  title: string
  category: string
  description: string
  important: boolean
  createdOn: number
  comments: Array<Comment>
  status: Status
  due: number
  priority: Priority
}
