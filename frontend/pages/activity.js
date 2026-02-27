import { useEffect, useState } from "react";
import api from "../services/api";
import Link from "next/link";

export default function Activity() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    api.get("/activities/all").then((res) => setActivities(res.data));
  }, []);

  return (
    <div className="app">
      <div className="sidebar">
        <Link href="/">⚡</Link>
        <Link href="/activity">📋</Link>
      </div>

      <div className="main">
        <h1>Activity History</h1>
        <table className="table">
          <thead>
            <tr>
              <th>Emoji</th>
              <th>Title</th>
              <th>Time</th>
              <th>Status</th>
              <th>Completed At</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((a) => (
              <tr key={a.id}>
                <td>{a.emoji}</td>
                <td>{a.title}</td>
                <td>{a.scheduled_time}</td>
                <td>{a.status}</td>
                <td>{a.completed_at || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <h3>Overview</h3>
        <p>All activity records shown here.</p>
      </div>
    </div>
  );
}