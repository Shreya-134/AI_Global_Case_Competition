import { InterestChip } from "../../../components/ui";
import { addCustomEntry, toggleId } from "../../../profile/profileLogic.js";
import Choice from "../components/Choice";
import CustomOptionField from "../components/CustomOptionField";

export default function ProfessionalInterestsStep({ config, value, onChange }) {
  const copy = config.interests;
  const addTopic = (input) => {
    const result = addCustomEntry(input, copy.topics, value.customTopics, "topic");
    if (!result.error) onChange({ ...value, customTopics: result.entries });
    return result.error;
  };

  return (
    <div className="step-stack">
      <fieldset className="profile-fieldset">
        <legend>{copy.topicHeading}</legend>
        <div className="choice-grid choice-grid--compact">
          {copy.topics.map((option) => (
            <Choice key={option.id} checked={value.topicIds.includes(option.id)} label={option.label} onChange={() => onChange({ ...value, topicIds: toggleId(value.topicIds, option.id) })} value={option.id} />
          ))}
        </div>
      </fieldset>

      <CustomOptionField buttonLabel={config.buttons.add} errorMessages={{ empty: config.copy.customEmpty, duplicate: config.copy.customDuplicate }} label={copy.customTopicLabel} onAdd={addTopic} placeholder={copy.customTopicPlaceholder} />

      {value.customTopics.length ? (
        <div className="selected-custom-list" aria-label="Custom topics">
          {value.customTopics.map((topic) => (
            <InterestChip key={topic.id} onClick={() => onChange({ ...value, customTopics: value.customTopics.filter((item) => item.id !== topic.id) })} selected>
              ✓ {topic.label} <span aria-hidden="true">×</span>
            </InterestChip>
          ))}
        </div>
      ) : null}

      <fieldset className="profile-fieldset">
        <legend>{copy.eventTypeHeading}</legend>
        <div className="choice-grid choice-grid--compact">
          {copy.eventTypes.map((option) => (
            <Choice key={option.id} checked={value.eventTypeIds.includes(option.id)} label={option.label} onChange={() => onChange({ ...value, eventTypeIds: toggleId(value.eventTypeIds, option.id) })} value={option.id} />
          ))}
        </div>
      </fieldset>
    </div>
  );
}

