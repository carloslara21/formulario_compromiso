import './NavigationButtons.css'

function NavigationButtons({ 
  currentStep, 
  totalSteps, 
  onBack, 
  onNext, 
  canGoBack = true, 
  canGoNext = true,
  nextLabel = 'Siguiente',
  backLabel = 'Atrás'
}) {
  const hasOnlyNext = !canGoBack && canGoNext
  
  return (
    <div className={`navigation-buttons ${hasOnlyNext ? 'single-button' : ''}`}>
      {canGoBack && (
        <button 
          type="button" 
          className="btn btn-back" 
          onClick={onBack}
        >
          {backLabel}
        </button>
      )}
      {canGoNext && (
        <button 
          type="button" 
          className="btn btn-next" 
          onClick={onNext}
        >
          {nextLabel}
        </button>
      )}
    </div>
  )
}

export default NavigationButtons

