import express, { Request, Response, NextFunction } from "express"
import { Pool } from "pg"
import { randomUUID, randomBytes, pbkdf2Sync } from "node:crypto"

const app = express()

app.use(express.json())

const pool = new Pool({
    connectionString: "postgresql://postgres:postgres@localhost:5432/postgres",
})

const userTableSQL = `
CREATE TABLE IF NOT EXISTS "users2" (
    "id"            uuid NOT NULL,
    username        varchar(50) NOT NULL,
    email           varchar(255) NOT NULL,
    hashed_password bytea NOT NULL,
    salt            bytea NOT NULL,
    created_at      timestamp NOT NULL,
    updated_at      timestamp NOT NULL,
    CONSTRAINT PK_3 PRIMARY KEY ( "id" )
);
`

pool.query(userTableSQL)
    .then(() => console.log("Table created"))
    .catch((err) => console.error("Error executing query", err.stack))

type User = {
    id: string
    username: string
    email: string
    hashed_password: Buffer
    salt: Buffer
    createdAt: Date
    updatedAt: Date
}

type UserInput = {
    email: string
    username: string
    password: string
}

interface HttpRequest<T> extends Request {
    body: T
}

app.post(
    "/signup",
    async (req: HttpRequest<UserInput>, res: Response): Promise<Response> => {
        const { email, username, password } = req.body
        const id = randomUUID()
        const salt = randomBytes(16)
        const hashedPassword = pbkdf2Sync(password, salt, 100000, 64, "sha512")
        const currentDate = new Date().toISOString()

        const query =
            "INSERT INTO users2(id, username, email, hashed_password, salt, created_at, updated_at)  VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *;"

        const values = [
            id,
            username,
            email,
            hashedPassword,
            salt,
            currentDate,
            currentDate,
        ]

        try {
            const result = await pool.query(query, values)
            console.log(result.rows[0])
            await pool.end()
        } catch (err) {
            console.log(err.stack)
        }

        return res.json({ ...req.body })
    }
)

app.get("/", (request: Request, response: Response) => {
    response.send("Hello World!")
})

app.listen(3000, () => {
    console.log(`Example app listening on port 3000`)
})
