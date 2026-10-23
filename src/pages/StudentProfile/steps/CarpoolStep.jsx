import { Button, TextInput } from "../../../components/ui";
import Choice from "../components/Choice";

export default function CarpoolStep({ config, value, onChange }) {
  const copy = config.carpool;
  return (
    <div className="step-stack">
      <TextInput hint={copy.privacyHelper} label={copy.locationLabel} onChange={(event) => onChange({ ...value, startingPoint: event.target.value })} placeholder={copy.locationPlaceholder} value={value.startingPoint} />
      <Button className="suggestion-action" onClick={() => onChange({ ...value, startingPoint: copy.suggestionLabel })} variant="secondary">{copy.suggestionLabel}</Button>
      <fieldset className="profile-fieldset">
        <legend>{copy.distanceQuestion}</legend>
        <p className="field-helper">{copy.distanceHelper}</p>
        <div className="choice-grid choice-grid--compact">
          {copy.distances.map((distance) => (
            <Choice key={distance.id} checked={value.meetingDistanceId === distance.id} label={distance.label} name="meeting-distance" onChange={() => onChange({ ...value, meetingDistanceId: distance.id })} type="radio" value={distance.id} />
          ))}
        </div>
      </fieldset>
      {(value.startingPoint || value.meetingDistanceId) ? <Button onClick={() => onChange({ startingPoint: "", meetingDistanceId: null })} variant="secondary">{config.buttons.clearCarpool}</Button> : null}
    </div>
  );
}

