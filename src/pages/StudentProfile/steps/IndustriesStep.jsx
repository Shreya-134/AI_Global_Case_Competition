import { InterestChip } from "../../../components/ui";
import { addCustomEntry, selectIndustry, selectStillExploring } from "../../../profile/profileLogic.js";
import Choice from "../components/Choice";
import CustomOptionField from "../components/CustomOptionField";

export default function IndustriesStep({ config, value, onChange }) {
  const copy = config.industries;
  const addIndustry = (input) => {
    const result = addCustomEntry(input, copy.options, value.customIndustries, "industry");
    if (!result.error) onChange({ ...value, stillExploring: false, customIndustries: result.entries });
    return result.error;
  };

  return (
    <div className="step-stack">
      <div className="choice-grid">
        {copy.options.map((option) => (
          <Choice key={option.id} checked={value.industryIds.includes(option.id)} label={option.label} onChange={() => onChange(selectIndustry(value, option.id))} value={option.id} />
        ))}
      </div>
      <Choice checked={value.stillExploring} label={copy.stillExploringLabel} onChange={() => onChange(selectStillExploring(value))} value="still-exploring" />
      <CustomOptionField buttonLabel={config.buttons.add} errorMessages={{ empty: config.copy.customEmpty, duplicate: config.copy.customDuplicate }} label={copy.customLabel} onAdd={addIndustry} placeholder={copy.customPlaceholder} />
      {value.customIndustries.length ? (
        <div className="selected-custom-list" aria-label="Custom industries">
          {value.customIndustries.map((industry) => (
            <InterestChip key={industry.id} onClick={() => onChange({ ...value, customIndustries: value.customIndustries.filter((item) => item.id !== industry.id) })} selected>
              ✓ {industry.label} <span aria-hidden="true">×</span>
            </InterestChip>
          ))}
        </div>
      ) : null}
    </div>
  );
}

