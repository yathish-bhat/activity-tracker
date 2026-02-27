import { useEffect, useState } from "react";
import api from "../services/api";
import Link from "next/link";

const EMOJIS = {
  work: "💻",
  workout: "🏋️",
  meal: "🍽",
  water: "💧",
  study: "📚",
  sleep: "😴"
};

export default function Overview() {
  const [activities, setActivities] = useState([]);
  const [overview, setOverview] = useState({});
  const [type, setType] = useState("work");
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");

  const fetchAll = async () => {
    const a = await api.get("/activities/today");
    const o = await api.get("/report/overview");
    setActivities(a.data);
    setOverview(o.data);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const addActivity = async () => {
    await api.post("/activity", {
      type,
      title,
      emoji: EMOJIS[type],
      scheduled_time: time,
      date: new Date().toISOString().split("T")[0]
    });
    setTitle("");
    fetchAll();
  };

  const updateStatus = async (id, status) => {
    await api.put(`/activity/${id}/status`, { status });
    fetchAll();
  };

  return (
    <div className="app">
      <div className="sidebar">
        <Link href="/">⚡</Link>
        <Link href="/activity">📋</Link>
      </div>

      <div className="main">
        <h1>Overview</h1>

        <div className="card">
          <h3>Progress: {overview.progress || 0}%</h3>
          <p>
            Completed {overview.completed || 0} / {overview.total || 0}
          </p>
        </div>

        <div className="card">
          <h3>Schedule Activity</h3>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {Object.keys(EMOJIS).map((k) => (
              <option key={k} value={k}>
                {EMOJIS[k]} {k}
              </option>
            ))}
          </select>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Activity"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
          <button onClick={addActivity}>Add</button>
        </div>

        <div className="card">
          <h3>Today's Activities</h3>
          {activities.map((a) => (
            <div key={a.id} className="activity-row">
              <div>
                {a.emoji} {a.title} ({a.scheduled_time})
              </div>
              <div>
                <button onClick={() => updateStatus(a.id, "completed")}>
                  ✔
                </button>
                <button onClick={() => updateStatus(a.id, "skipped")}>
                  ✖
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h3>Stats</h3>
        <p>Total: {overview.total}</p>
        <p>Pending: {overview.pending}</p>
      </div>
    </div>
  );
}