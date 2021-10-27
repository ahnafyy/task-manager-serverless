import Comment from './comment'
export default interface Task {
  id: string
  title: string
  category: string
  description: string
  important: boolean
  date: number
  comments: Array<Comment>
}
