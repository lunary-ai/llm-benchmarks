import sqlite3 from "sqlite3"
import { open } from "sqlite"

const getDB = async () => {
  const db = await open({
    filename: process.cwd() + "/run/database.db",
    driver: sqlite3.Database,
  })

  return db
}

export default getDB
