import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [activities, setActivities] = useState([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("work");

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await axios.get(
        "https://activity-tracker-ht6l.onrender.com/activities"
      );
      setActivities(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const addActivity = async () => {
    try {
      await axios.post(
        "https://activity-tracker-ht6l.onrender.com/activity",
        { type, title }
      );
      setTitle("");
      fetchActivities();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <nav className="sidebar">
        <div className="logo">⚡</div>
      </nav>

      {/* Main */}
      <main className="main">
        <header className="header">
          <div className="greeting">
            <div className="date">{new Date().toDateString()}</div>
            <h1>
              Good day, <span>Yathish</span> 👋
            </h1>
          </div>
        </header>

        {/* Add Activity Card */}
        <div className="chart-area">
          <div className="section-title">Add Activity</div>

          <div style={{ display: "flex", gap: "10px" }}>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="work">Work</option>
              <option value="workout">Workout</option>
              <option value="meal">Meal</option>
              <option value="water">Water</option>
            </select>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Activity details"
            />

            <button onClick={addActivity}>Add</button>
          </div>
        </div>

        {/* Logs */}
        <div className="section-title">Recent Logs</div>

        <div className="workouts-row">
          {activities.map((a) => (
            <div key={a.id} className="workout-card">
              <div className="workout-icon">🔥</div>
              <div className="workout-info">
                <div className="workout-name">{a.type}</div>
                <div className="workout-meta">
                  {new Date(a.timestamp).toLocaleString()}
                </div>
              </div>
              <div className="workout-stats">
                <div className="workout-cal">{a.title}</div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Right Panel */}
      <aside className="panel">
        <div className="panel-section">
          <div className="section-title">Summary</div>
          <p>Total Activities: {activities.length}</p>
        </div>
      </aside>
    </div>
  );
}
