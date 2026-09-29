import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStorageRepository } from './storageRepository';

const repository = createStorageRepository(AsyncStorage);

export const loadProgress = repository.loadProgress;
export const saveProgress = repository.saveProgress;
export const clearProgress = repository.clearProgress;
export const clearAllLocalData = repository.clearAllLocalData;
export const loadFeedbackQueue = repository.loadFeedbackQueue;
export const saveFeedbackQueue = repository.saveFeedbackQueue;
export const loadFeedbackReceipts = repository.loadFeedbackReceipts;
export const saveFeedbackReceipts = repository.saveFeedbackReceipts;
