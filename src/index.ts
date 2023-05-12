import express from "express"
import { Request, Response } from "express"

const app = express()

app.get("/", (request: Request, response: Response) => {
    response.send("Hello World!")
})

app.listen(3000, () => {
    console.log(`Example app listening on port 3000`)
})
