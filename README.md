AI-Based Weekly Employee Well-Being Pulse System

📌 Project Overview

The AI-Based Weekly Employee Well-Being Pulse System is a web-based application designed to monitor and analyze the mental well-being, stress levels, and overall work experience of front-line employees (such as sales staff, customer service representatives, and support agents).

The system collects structured feedback from employees on a weekly basis (Monday–Friday summary) and uses simple AI techniques to generate meaningful insights for both employees and managers. The goal is to identify stress patterns early, prevent burnout, and improve workplace productivity and employee satisfaction.


🎯 Purpose of the Project

In many organizations, front-line employees face high pressure due to:

- Continuous customer interaction
- High workload
- Performance targets
- Irregular work schedules

However, companies often lack real-time visibility into employee well-being. Problems like stress and burnout are usually identified too late.

This project aims to:

- Provide a systematic way to monitor employee well-being weekly
- Use AI-based analysis to interpret feedback
- Enable early detection of stress and burnout risks
- Support data-driven decision-making for managers

---

⚙️ How the System Works

1. Weekly Feedback Collection

Employees submit feedback once a week (typically on Friday) summarizing their experience over the past five working days.

The feedback includes:

- Emotional state during the week
- Stress level
- Workload intensity
- Customer interaction difficulty
- Written feedback describing their experience

---

2. Data Processing and Analysis

Once the feedback is submitted, the system processes the data using:

a. Structured Data Analysis

Each input (stress, workload, etc.) is converted into numerical values to calculate:

- Overall stress score
- Performance indicators

b. AI-Based Sentiment Analysis

The textual feedback is analyzed using Natural Language Processing (NLP) techniques to determine:

- Positive sentiment
- Neutral sentiment
- Negative sentiment

---

3. Burnout Risk Detection

The system evaluates multiple factors such as:

- High stress levels
- Negative sentiment
- Heavy workload

Based on these, it classifies employees into:

- Low Risk
- Moderate Risk
- High Risk

This helps in identifying employees who may need immediate attention.

---

4. Report Generation

a. Employee Reports

Each employee receives a personalized report that includes:

- Weekly emotional and stress summary
- Performance score
- Burnout risk level
- AI-generated insights and suggestions

This helps employees understand their own well-being and take corrective actions.

---

b. Manager Reports

Managers receive aggregated insights such as:

- Overall team stress levels
- Distribution of employee well-being
- Number of employees at burnout risk
- Weekly trends and patterns

This enables managers to:

- Identify problem areas
- Take preventive actions
- Improve team management

---

🔁 System Workflow

1. Employee logs into the system
2. Submits weekly feedback (Friday)
3. System processes input data
4. AI analyzes feedback text
5. Burnout risk and scores are calculated
6. Data is stored in the database
7. Reports are generated:
   - Personal report for employee
   - Team analytics for manager

---

🧠 Key Functionalities

- Weekly feedback collection system
- AI-based sentiment analysis
- Burnout risk prediction
- Role-based dashboards (Employee & Manager)
- Data visualization using charts and reports
- Historical data tracking for trends

---

🎯 Expected Outcomes

- Early detection of employee stress and burnout
- Improved employee awareness of their well-being
- Better decision-making for managers
- Enhanced workplace productivity and satisfaction

---

💡 Conclusion

The AI-Based Weekly Employee Well-Being Pulse System provides a structured and intelligent approach to understanding employee mental health and work conditions. By combining regular feedback with AI-driven analysis, the system bridges the gap between employees and management, enabling proactive interventions and a healthier work environment.

---

## Local Development

Run the backend and frontend in separate terminals:

```powershell
cd server
npm install
npm start
```

```powershell
cd client
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and uses the backend at `http://localhost:5000` by default. The backend health check is available at `http://localhost:5000/api/health`.

## Deployment

Deploy the backend as a Node.js web service using `server/` as its root directory and `npm start` as its start command. The service listens on the platform-provided `PORT` (with `5000` as its local fallback). Configure `CLIENT_ORIGIN` to the exact public origin of the deployed frontend, for example `https://your-frontend.example.com`; if it is unset, the backend retains permissive CORS for local development.

Deploy `client/` as a static Vite site. Use `npm install` as the install command and `npm run build` as the build command; publish the generated `dist/` directory. Set the frontend build environment variable `VITE_API_URL` to the backend's public origin, without a trailing `/api` (for example, `https://your-backend.example.com`). The existing `/api/...` paths are appended automatically. The `public/_redirects` file provides SPA fallback for static hosts that support the redirects-file convention, including direct loads and refreshes of `/login`, `/employee`, and `/manager`.

Copy `client/.env.example` and `server/.env.example` for local reference. `.env.example` files are templates only; configure environment variables in the hosting platform for production. Do not put credentials or secrets in frontend environment variables.

### Data persistence limitation

Feedback and demo users are stored in JSON files in `server/data/`. This works for a demonstration on a writable local filesystem, but the feedback file may reset on restart or redeployment when the backend host uses an ephemeral filesystem. Multiple service instances may also have separate copies, and writes will fail if the filesystem is read-only. This deployment setup does not add persistent storage; use a host with a persistent disk if retaining submitted data is required.
