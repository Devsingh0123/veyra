/**
 * Order State Machine (FSM)
 * Strictly enforces legal lifecycle transitions and audits every change.
 */

export const ORDER_TRANSITIONS = {
  PENDING: ['PAYMENT_PENDING', 'CONFIRMED', 'CANCELLED'],
  PAYMENT_PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['OUT_FOR_DELIVERY', 'RTO_INITIATED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'RTO_INITIATED'],
  DELIVERED: ['RETURN_REQUESTED'],
  RETURN_REQUESTED: ['RETURN_RECEIVED', 'DELIVERED'],
  RETURN_RECEIVED: ['REFUNDED'],
  RTO_INITIATED: ['RTO_DELIVERED'],
  RTO_DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: []
};

export const CANCELLABLE_STATES = ['PENDING', 'PAYMENT_PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED'];

export const fsmService = {
  canTransition(fromState, toState) {
    const allowed = ORDER_TRANSITIONS[fromState] || [];
    return allowed.includes(toState);
  },

  validateTransition(fromState, toState) {
    if (!ORDER_TRANSITIONS[fromState]) {
      throw new Error(`Unknown initial order state: "${fromState}"`);
    }

    if (!ORDER_TRANSITIONS[fromState].includes(toState)) {
      throw new Error(
        `Illegal state transition from "${fromState}" to "${toState}". Allowed transitions: [${ORDER_TRANSITIONS[fromState].join(', ')}]`
      );
    }
  },

  isCancellable(currentState) {
    return CANCELLABLE_STATES.includes(currentState);
  }
};
