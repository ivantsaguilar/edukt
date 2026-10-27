export type Step = 'ACTIVIDAD_PRINCIPAL' | 'TEORIA' | 'REFUERZO' | 'COMPLETADO';
export type Status = 'EN_PROGRESO' | 'COMPLETADO';

export interface ProgressState {
  currentTopicId: number;
  currentStep: Step;
  status: Status;
}

export interface TransitionInput {
  currentState: ProgressState;
  isCorrect?: boolean;
  totalTopics: number;
}

export function computeNextState(input: TransitionInput): ProgressState {
  const { currentState, isCorrect, totalTopics } = input;
  const { currentTopicId, currentStep } = currentState;

  if (currentState.status === 'COMPLETADO') {
    throw new Error('El temario ya ha sido completado.');
  }

  // Reglas 1 y 4: Respuesta correcta en Principal o Refuerzo -> Siguiente tema o finalizar
  if ((currentStep === 'ACTIVIDAD_PRINCIPAL' || currentStep === 'REFUERZO') && isCorrect) {
    if (currentTopicId >= totalTopics) {
      return { currentTopicId, currentStep: 'COMPLETADO', status: 'COMPLETADO' };
    }
    return { currentTopicId: currentTopicId + 1, currentStep: 'ACTIVIDAD_PRINCIPAL', status: 'EN_PROGRESO' };
  }

  // Regla 2: Incorrecto en Actividad Principal -> Ir a Teoría
  if (currentStep === 'ACTIVIDAD_PRINCIPAL' && !isCorrect) {
    return { currentTopicId, currentStep: 'TEORIA', status: 'EN_PROGRESO' };
  }

  // Regla 3: Avance manual desde Teoría -> Ir a Refuerzo
  if (currentStep === 'TEORIA') {
    return { currentTopicId, currentStep: 'REFUERZO', status: 'EN_PROGRESO' };
  }

  // Reglas 5 y 6: Incorrecto en Refuerzo -> Regresar a Teoría
  if (currentStep === 'REFUERZO' && !isCorrect) {
    return { currentTopicId, currentStep: 'TEORIA', status: 'EN_PROGRESO' };
  }

  return currentState;
}