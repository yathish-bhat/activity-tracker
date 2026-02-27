
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const cron = require('node-cron');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    title TEXT,
    emoji TEXT,
    scheduled_time TEXT,
    status TEXT DEFAULT 'pending',
    date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

app.get("/", (req,res)=>res.json({status:"Backend running"}));

app.post("/activity", (req,res)=>{
  const {type,title,emoji,scheduled_time,date} = req.body;
  db.run(
    `INSERT INTO activities (type,title,emoji,scheduled_time,date)
     VALUES (?,?,?,?,?)`,
    [type,title,emoji,scheduled_time,date],
    function(err){
      if(err) return res.status(500).json(err);
      res.json({id:this.lastID});
    }
  );
});

app.get("/activities",(req,res)=>{
  db.all(`SELECT * FROM activities ORDER BY created_at DESC`,[],(err,rows)=>{
    if(err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.put("/activity/:id/status",(req,res)=>{
  db.run(
    `UPDATE activities SET status=? WHERE id=?`,
    [req.body.status,req.params.id],
    function(err){
      if(err) return res.status(500).json(err);
      res.json({updated:true});
    }
  );
});

app.get("/report/today",(req,res)=>{
  const today = new Date().toISOString().split("T")[0];
  db.all(`SELECT * FROM activities WHERE date=?`,[today],(err,rows)=>{
    if(err) return res.status(500).json(err);
    const completed = rows.filter(r=>r.status==="completed").length;
    const skipped = rows.filter(r=>r.status==="skipped").length;
    const pending = rows.filter(r=>r.status==="pending").length;
    res.json({total:rows.length,completed,skipped,pending,activities:rows});
  });
});

cron.schedule("* * * * *",()=>{
  const now = new Date();
  const current = now.toTimeString().slice(0,5);
  const today = now.toISOString().split("T")[0];
  db.all(
    `SELECT * FROM activities WHERE scheduled_time=? AND date=? AND status='pending'`,
    [current,today],
    (err,rows)=>{
      rows.forEach(a=>{
        console.log("Reminder:",a.title,"at",a.scheduled_time);
      });
    }
  );
});

app.listen(5000,()=>console.log("Premium backend running"));
