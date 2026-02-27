
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  const [activities, setActivities] = useState([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("work");

  const fetchActivities = async () => {
    const res = await axios.get("https://activity-tracker-ht6l.onrender.com/activities");
    setActivities(res.data);
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const addActivity = async () => {
    await axios.post("https://activity-tracker-ht6l.onrender.com", { type, title });
    setTitle("");
    fetchActivities();
  };

  return (
    <div style={{padding:20}}>
      <h1>Personal Activity Tracker (PWA)</h1>
      <select value={type} onChange={(e)=>setType(e.target.value)}>
        <option value="work">Work</option>
        <option value="workout">Workout</option>
        <option value="meal">Meal</option>
        <option value="water">Water</option>
      </select>
      <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Activity details"/>
      <button onClick={addActivity}>Add</button>

      <h2>Logs</h2>
      <ul>
        {activities.map(a => (
          <li key={a.id}>{a.type} - {a.title} - {a.timestamp}</li>
        ))}
      </ul>
    </div>
  );
}
