import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { User } from 'firebase/auth';
import { Preferences } from '@/store/preferencesStore';

export interface UserPreferences extends Preferences {
  updatedAt: Date;
}

export class UserPreferencesService {
  private static instance: UserPreferencesService;
  
  static getInstance(): UserPreferencesService {
    if (!UserPreferencesService.instance) {
      UserPreferencesService.instance = new UserPreferencesService();
    }
    return UserPreferencesService.instance;
  }

  async saveUserPreferences(user: User, preferences: Preferences): Promise<void> {
    try {
      const userPrefs: UserPreferences = {
        ...preferences,
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'userPreferences', user.uid), userPrefs, { merge: true });
      console.log('User preferences saved to Firebase');
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw error;
    }
  }

  async loadUserPreferences(user: User): Promise<Preferences | null> {
    try {
      const docRef = doc(db, 'userPreferences', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserPreferences;
        // Remove the updatedAt field when returning preferences
        const { updatedAt, ...preferences } = data;
        console.log('User preferences loaded from Firebase');
        return preferences;
      } else {
        console.log('No user preferences found in Firebase');
        return null;
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
      throw error;
    }
  }

  async deleteUserPreferences(user: User): Promise<void> {
    try {
      await setDoc(doc(db, 'userPreferences', user.uid), {}, { merge: false });
      console.log('User preferences deleted from Firebase');
    } catch (error) {
      console.error('Error deleting user preferences:', error);
      throw error;
    }
  }
} 