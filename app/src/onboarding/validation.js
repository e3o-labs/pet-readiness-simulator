const CHOICE_VALUES = {
  household: ['single', 'family'],
  home: ['apartment', 'house', 'other'],
  budget: ['low', 'medium', 'high'],
  experience: ['first', 'some'],
  preference: ['calm', 'active', 'senior'],
  confidence: ['careful', 'optimistic'],
};

export function validWeekdayHours(value) {
  if (typeof value !== 'string' || !/^\d+(?:\.\d+)?$/.test(value.trim())) return false;
  const hours = Number(value);
  return Number.isFinite(hours) && hours >= 0 && hours <= 24;
}

export function validOnboarding(onboarding) {
  return validWeekdayHours(onboarding?.weekdayHours)
    && Object.entries(CHOICE_VALUES).every(([key, values]) => values.includes(onboarding?.[key]));
}
