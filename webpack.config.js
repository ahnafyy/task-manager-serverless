const path = require('path')
module.exports = {
  target: 'node',
  entry: {
    auth: './src/lambdas/auth.ts',
    comments: './src/lambdas/comments.ts',
    tasks: './src/lambdas/tasks.ts',
    users: './src/lambdas/users.ts'
  },
  mode: 'development',
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  }
}
