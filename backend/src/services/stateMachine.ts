export type Step = 'MAIN' | 'THEORY' | 'REINFORCEMENT' | 'COMPLETED';

export interface ProgressState {
  currentTopicId: number;
  currentStep: Step;
  status: 'IN_PROGRESS' | 'COMPLETED';
}

export interface TransitionInput {
  currentState: ProgressState;
  isCorrect?: boolean;
  totalTopics: number;
}

export function computeNextState(input: TransitionInput): ProgressState {
  const { currentState, isCorrect, totalTopics } = input;
  const { currentTopicId, currentStep } = currentState;

  if (currentState.status === 'COMPLETED') {
    throw new Error('El temario ya ha sido completado.');
  }

  // Regla 1 & 4: Respuesta correcta en Principal o Refuerzo
  if ((currentStep === 'MAIN' || currentStep === 'REINFORCEMENT') && isCorrect) {
    if (currentTopicId >= totalTopics) {
      return { currentTopicId, currentStep: 'COMPLETED', status: 'COMPLETED' };
    }
    return { currentTopicId: currentTopicId + 1, currentStep: 'MAIN', status: 'IN_PROGRESS' };
  }

  // Regla 2: Incorrecto en Actividad Principal -> Ir a Teoría
  if (currentStep === 'MAIN' && !isCorrect) {
    return { currentTopicId, currentStep: 'THEORY', status: 'IN_PROGRESS' };
  }

  // Regla 3: Avance manual desde Teoría -> Ir a Refuerzo
  if (currentStep === 'THEORY') {
    return { currentTopicId, currentStep: 'REINFORCEMENT', status: 'IN_PROGRESS' };
  }

  // Regla 5 & 6: Incorrecto en Refuerzo -> Regresar a Teoría
  if (currentStep === 'REINFORCEMENT' && !isCorrect) {
    return { currentTopicId, currentStep: 'THEORY', status: 'IN_PROGRESS' };
  }

  return currentState;
}