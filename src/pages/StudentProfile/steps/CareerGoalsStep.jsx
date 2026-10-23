import Choice from "../components/Choice";
import { toggleGoal } from "../../../profile/profileLogic.js";

export default function CareerGoalsStep({ config, value, onChange, error }) {
  const copy = config.career;
  const selectedGoals = copy.goals.filter((goal) => value.goalIds.includes(goal.id));
  return (
    <div className="step-stack">
      <fieldset className="profile-fieldset">
        <legend>{copy.goalsHeading}</legend>
        <div className="choice-grid">
          {copy.goals.map((goal) => (
            <Choice key={goal.id} checked={value.goalIds.includes(goal.id)} label={goal.label} onChange={() => onChange(toggleGoal(value, goal.id))} value={goal.id} />
          ))}
        </div>
      </fieldset>
      <fieldset className="profile-fieldset">
        <legend>{copy.priorityHeading}</legend>
        <p className="field-helper">{copy.priorityHelper}</p>
        {!selectedGoals.length ? <p className="empty-state">{copy.priorityEmpty}</p> : (
          <div className="choice-grid">
            {selectedGoals.map((goal) => (
              <Choice key={goal.id} badge={value.priorityGoalId === goal.id ? "★ Top priority" : null} checked={value.priorityGoalId === goal.id} label={goal.label} name="priority-goal" onChange={() => onChange({ ...value, priorityGoalId: goal.id })} type="radio" value={goal.id} />
            ))}
          </div>
        )}
        {error ? <p className="inline-error" role="alert">{copy.priorityError}</p> : null}
      </fieldset>
    </div>
  );
}

