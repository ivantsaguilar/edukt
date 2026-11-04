export type Step = 'ACTIVIDAD_PRINCIPAL' | 'TEORIA' | 'REFUERZO' | 'TEORIA_REPASO' | 'REFUERZO_ALTERNATIVO' | 'COMPLETADO';
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

  // Si el alumno ya completó el temario, no permite hacer nada más
  if (currentState.status === 'COMPLETADO') {
    throw new Error('El temario ya ha sido completado.');
  }

  // Reglas 1 y 4: Respuesta correcta en Principal o Refuerzo -> Siguiente tema o finalizar
  if ((currentStep === 'ACTIVIDAD_PRINCIPAL' || currentStep === 'REFUERZO' || currentStep === 'REFUERZO_ALTERNATIVO') && isCorrect) {
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
    return { currentTopicId, currentStep: 'TEORIA_REPASO', status: 'EN_PROGRESO' };
  }

  // Desafio OA-1: Incorrecto en Refuerzo -> Regresar a Teoría
  // Avance desde Teoría de Repaso -> Ir al Refuerzo Alternativo (R1_ALT)
  if (currentStep === 'TEORIA_REPASO') {
    return { currentTopicId, currentStep: 'REFUERZO_ALTERNATIVO', status: 'EN_PROGRESO' };
  }

  if (currentStep === 'REFUERZO_ALTERNATIVO' && !isCorrect) {
    return { currentTopicId, currentStep: 'TEORIA_REPASO', status: 'EN_PROGRESO' };
  }

  return currentState;
}