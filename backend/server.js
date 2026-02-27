
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./database.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    title TEXT,
    emoji TEXT,
    scheduled_time TEXT,
    status TEXT DEFAULT 'pending',
    date TEXT
  )`);
});

app.get("/activities",(req,res)=>{
  db.all("SELECT * FROM activities ORDER BY id DESC",[],(err,rows)=>{
    if(err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.post("/activity",(req,res)=>{
  const {type,title,emoji,scheduled_time,date} = req.body;
  db.run("INSERT INTO activities (type,title,emoji,scheduled_time,date) VALUES (?,?,?,?,?)",
  [type,title,emoji,scheduled_time,date],
  function(err){
    if(err) return res.status(500).json(err);
    res.json({id:this.lastID});
  });
});

app.put("/activity/:id/status",(req,res)=>{
  db.run("UPDATE activities SET status=? WHERE id=?",
  [req.body.status,req.params.id],
  function(err){
    if(err) return res.status(500).json(err);
    res.json({updated:true});
  });
});

app.listen(5000,()=>console.log("Backend running"));
