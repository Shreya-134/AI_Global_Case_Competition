
import "./Dashboard.css";

// DEMO DATA: networking hours by day
const networkingData = [
  { day: "Mon", hours: 2 },
  { day: "Tue", hours: 0 },
  { day: "Wed", hours: 1 },
  { day: "Thu", hours: 0 },
  { day: "Fri", hours: 2 },
  { day: "Sat", hours: 0 },
  { day: "Sun", hours: 0 },
];

// DEMO DATA: weekly time allocation
// Change these hours to update the pie chart.
const weeklyActivities = [
  {
    name: "Classes",
    hours: 16,
    color: "#210B2C",
  },
  {
    name: "Assignments",
    hours: 12,
    color: "#BC96E6",
  },
  {
    name: "Career Events",
    hours: 8,
    color: "#FFD166",
  },
  {
    name: "Other Activities",
    hours: 4,
    color: "#675773",
  },
];

const weeklyTarget = 8;

export default function Dashboard() {
  // Networking calculations
  const totalNetworkingHours = networkingData.reduce(
    (sum, item) => sum + item.hours,
    0
  );

  const networkingDays = networkingData.filter(
    (item) => item.hours > 0
  ).length;

  const avgNetworkingHours = networkingDays > 0
    ? totalNetworkingHours / networkingDays
    : 0;

  const progress = weeklyTarget > 0
    ? Math.min(
        (totalNetworkingHours / weeklyTarget) * 100,
        100
      )
    : 0;

  const remainingHours = Math.max(
    weeklyTarget - totalNetworkingHours,
    0
  );

  // Weekly time allocation calculations
  const totalWeeklyHours = weeklyActivities.reduce(
    (sum, item) => sum + item.hours,
    0
  );

  const activeActivities = weeklyActivities.filter(
    (item) => item.hours > 0
  );

  let currentPercentage = 0;

  const pieSegments = activeActivities.map((item) => {
    const percentage =
      (item.hours / totalWeeklyHours) * 100;

    const start = currentPercentage;
    currentPercentage += percentage;

    return {
      ...item,
      percentage,
      start,
      end: currentPercentage,
    };
  });

  const pieGradient = pieSegments.length > 0
    ? `conic-gradient(${pieSegments
        .map(
          (item) =>
            `${item.color} ${item.start}% ${item.end}%`
        )
        .join(", ")})`
    : "#E3D7EE";

  return (
    <main className="dashboard">
      <div className="dashboard-container">

        {/* Header */}
        <header className="dashboard-header">
          <span className="dashboard-eyebrow">
            USC MSBA · STUDENT INSIGHTS
          </span>

          <h1>Student Networking Insights</h1>

          <p>
            Your weekly networking and time overview
          </p>
        </header>

        {/* Networking statistics */}
        <section className="stats-grid">
          <div className="stat-card">
            <p>Weekly Target</p>
            <h2>{weeklyTarget} hrs</h2>
          </div>

          <div className="stat-card">
            <p>Scheduled Networking</p>
            <h2>{totalNetworkingHours} hrs</h2>
          </div>

          <div className="stat-card">
            <p>Networking Days</p>
            <h2>{networkingDays} days</h2>
          </div>

          <div className="stat-card">
            <p>Avg. Hours / Active Day</p>
            <h2>
              {avgNetworkingHours.toFixed(1)} hrs
            </h2>
          </div>
        </section>

        {/* Weekly networking goal */}
        <section className="chart-card">
          <div className="section-heading">
            <h3>Weekly Goal Progress</h3>
            <span>{progress.toFixed(1)}%</span>
          </div>

          <div
            className="progress-track"
            role="progressbar"
            aria-label="Weekly networking goal progress"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="progress-description">
            {remainingHours > 0
              ? `${remainingHours} more hours to reach your weekly goal`
              : "Weekly goal achieved!"}
          </p>
        </section>

        {/* Weekly time allocation pie chart */}
        <section className="chart-card">
          <div className="section-heading">
            <div>
              <h3>Weekly Student Time Allocation</h3>
              <p className="section-subtitle">
                How students spend their scheduled
                hours each week
              </p>
            </div>
          </div>

          <div className="pie-layout">
            <div
              className="pie-chart"
              style={{ background: pieGradient }}
              role="img"
              aria-label={
                totalWeeklyHours > 0
                  ? `Weekly time allocation: ${activeActivities
                      .map(
                        (item) =>
                          `${item.name} ${item.hours} hours`
                      )
                      .join(", ")}`
                  : "No scheduled activities"
              }
            >
              <div className="pie-center">
                <strong>{totalWeeklyHours} hrs</strong>
                <span>Weekly Total</span>
              </div>
            </div>

            <div className="pie-legend">
              {weeklyActivities.map((item) => {
                const percentage =
                  totalWeeklyHours > 0
                    ? (item.hours / totalWeeklyHours) * 100
                    : 0;

                return (
                  <div
                    className="legend-item"
                    key={item.name}
                  >
                    <span
                      className="legend-color"
                      style={{
                        background: item.color,
                      }}
                    />

                    <div className="legend-details">
                      <strong>{item.name}</strong>
                      <p>
                        {item.hours} hrs ·{" "}
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <p className="dashboard-footer">
          Demo data · Weekly time allocation is
          based on scheduled activities, not the
          full 168-hour week.
        </p>

      </div>
    </main>
  );
}
