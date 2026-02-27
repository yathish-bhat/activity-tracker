
import {useEffect,useState} from 'react';
import axios from 'axios';

const EMOJIS={
  workout:"🏋️",
  meal:"🍽",
  water:"💧",
  work:"💻",
  study:"📚",
  meditation:"🧘",
  sleep:"😴"
};

const API="http://localhost:5000";

export default function Home(){
  const [activities,setActivities]=useState([]);
  const [report,setReport]=useState(null);
  const [type,setType]=useState("work");
  const [title,setTitle]=useState("");
  const [time,setTime]=useState("");

  useEffect(()=>{fetchAll();},[]);

  const fetchAll=async()=>{
    const a=await axios.get(API+"/activities");
    const r=await axios.get(API+"/report/today");
    setActivities(a.data);
    setReport(r.data);
  };

  const addActivity=async()=>{
    await axios.post(API+"/activity",{
      type,
      title,
      emoji:EMOJIS[type],
      scheduled_time:time,
      date:new Date().toISOString().split("T")[0]
    });
    setTitle("");
    fetchAll();
  };

  const updateStatus=async(id,status)=>{
    await axios.put(API+`/activity/${id}/status`,{status});
    fetchAll();
  };

  return(
    <div className="app">
      <div className="main">
        <h1>Premium Activity Assistant</h1>

        <div className="card">
          <h3>Schedule Activity</h3>
          <select value={type} onChange={e=>setType(e.target.value)}>
            {Object.keys(EMOJIS).map(k=>
              <option key={k} value={k}>{EMOJIS[k]} {k}</option>
            )}
          </select>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Activity"/>
          <input type="time" value={time} onChange={e=>setTime(e.target.value)}/>
          <button onClick={addActivity}>Add</button>
        </div>

        <div className="card">
          <h3>Today's Plan</h3>
          {activities.map(a=>
            <div key={a.id} style={{marginBottom:10}}>
              {a.emoji} {a.title} ({a.scheduled_time}) - {a.status}
              <button onClick={()=>updateStatus(a.id,"completed")}>✅</button>
              <button onClick={()=>updateStatus(a.id,"skipped")}>❌</button>
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <h3>Daily Report</h3>
        {report && (
          <div>
            <p>Total: {report.total}</p>
            <p>Completed: {report.completed}</p>
            <p>Skipped: {report.skipped}</p>
            <p>Pending: {report.pending}</p>
          </div>
        )}
      </div>
    </div>
  );
}
