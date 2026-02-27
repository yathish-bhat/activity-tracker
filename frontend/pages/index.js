
import {useEffect,useState} from "react";
import api from "../services/api";
import "../styles/pulse.css";

const EMOJIS={
  workout:"🏋️",
  meal:"🍽",
  water:"💧",
  work:"💻",
  study:"📚",
  meditation:"🧘",
  sleep:"😴"
};

export default function Home(){
  const [activities,setActivities]=useState([]);
  const [type,setType]=useState("work");
  const [title,setTitle]=useState("");
  const [time,setTime]=useState("");

  const fetchData=async()=>{
    const res=await api.get("/activities");
    setActivities(res.data);
  };

  useEffect(()=>{fetchData();},[]);

  const addActivity=async()=>{
    await api.post("/activity",{
      type,
      title,
      emoji:EMOJIS[type],
      scheduled_time:time,
      date:new Date().toISOString().split("T")[0]
    });
    setTitle("");
    fetchData();
  };

  const updateStatus=async(id,status)=>{
    await api.put(`/activity/${id}/status`,{status});
    fetchData();
  };

  return(
    <div className="app">
      <div className="sidebar">⚡ 📊 🏃 🛌</div>

      <div className="main">
        <div className="greeting">
          <h1>Good morning, Yathish 👋 <span className="streak">🔥 14 day streak</span></h1>
        </div>

        <div className="stats">
          <div className="stat-card">Steps<br/><h2>8,420</h2></div>
          <div className="stat-card">Calories<br/><h2>1,840</h2></div>
          <div className="stat-card">Distance<br/><h2>5.8 km</h2></div>
          <div className="stat-card">Sleep<br/><h2>7.2 hr</h2></div>
        </div>

        <div className="weekly">
          Weekly Activity
          <div className="bars">
            <div className="bar" style={{height:"60px"}}/>
            <div className="bar" style={{height:"90px"}}/>
            <div className="bar" style={{height:"70px"}}/>
            <div className="bar" style={{height:"100px"}}/>
            <div className="bar" style={{height:"80px"}}/>
          </div>
        </div>

        <div className="scheduler">
          <h3>Schedule Activity</h3>
          <select value={type} onChange={e=>setType(e.target.value)}>
            {Object.keys(EMOJIS).map(k=>
              <option key={k} value={k}>{EMOJIS[k]} {k}</option>
            )}
          </select>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Activity"/>
          <input type="time" value={time} onChange={e=>setTime(e.target.value)}/>
          <button onClick={addActivity}>Add</button>

          <div className="activities">
            {activities.map(a=>
              <div key={a.id} className="activity-card">
                <div>{a.emoji} {a.title} ({a.scheduled_time})</div>
                <div>
                  <button onClick={()=>updateStatus(a.id,"completed")}>✅</button>
                  <button onClick={()=>updateStatus(a.id,"skipped")}>❌</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="panel">
        <h3>Daily Goals</h3>
        <p>Overall Progress: 83%</p>
      </div>
    </div>
  );
}
