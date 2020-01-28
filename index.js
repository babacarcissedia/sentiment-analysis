const express = require('express')
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
const sentimentHandler = require('./sentimentHandler')
app.post('/sentiment', sentimentHandler)
const PORT = process.env.PORT || 4001

app.listen(PORT, () => {
  console.log("%s running on %d", __dirname, PORT)
})