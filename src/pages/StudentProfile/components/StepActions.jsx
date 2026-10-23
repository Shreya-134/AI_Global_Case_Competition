import { Button } from "../../../components/ui";

export default function StepActions({ config, canGoBack, isReviewNext, returnToReview, onBack, onContinue, onSkip }) {
  return (
    <div className="step-actions">
      <div>{canGoBack ? <Button onClick={onBack} variant="secondary">{config.buttons.back}</Button> : null}</div>
      <div className="step-actions__forward">
        <Button onClick={onSkip} variant="secondary">{config.buttons.skip}</Button>
        <Button onClick={onContinue}>
          {returnToReview ? config.buttons.returnToReview : isReviewNext ? config.buttons.review : config.buttons.continue}
        </Button>
      </div>
    </div>
  );
}

