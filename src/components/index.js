/**
 * Centralized Component Barrel Index
 * Standard industry architecture: organized by domain and category.
 */

// Terminal & Intelligence Command Deck
export { default as BloombergTerminalView } from './terminal/BloombergTerminalView';
export { default as TerminalAsciiBootLoader } from './terminal/TerminalAsciiBootLoader';

// Backgrounds, Shaders & Canvas Engines
export { default as Balatro } from './backgrounds/Balatro';
export { default as MicroSlats } from './backgrounds/MicroSlats';
export { default as DreamcoreAsciiCanvas } from './backgrounds/DreamcoreAsciiCanvas';
export { default as MaleniaAsciiCanvas } from './backgrounds/MaleniaAsciiCanvas';
export { default as DitherBackground } from './DitherBackground';
export { default as CubesCanvas } from './CubesCanvas';
export { default as ShaderGradientCanvas } from './ShaderGradientCanvas';

// Core Dashboard & Prep Views
export { default as DashboardView } from './DashboardView';
export { default as DailyTrackerView } from './DailyTrackerView';
export { default as MockTrackerView } from './MockTrackerView';
export { default as StudyTimerView } from './StudyTimerView';
export { default as ProfileView } from './ProfileView';
export { default as SettingsView } from './SettingsView';
export { default as TimelineView } from './TimelineView';
export { default as ErrorLogView } from './ErrorLogView';
export { default as AchievementsView } from './AchievementsView';
export { default as BacklogRecoveryView } from './BacklogRecoveryView';
export { default as SanctuaryShopView } from './SanctuaryShopView';
export { default as StudyLounge } from './StudyLounge';

// Modals & Dialogue Systems
export { default as OnboardingWelcomeModal } from './OnboardingWelcomeModal';
export { default as SessionCompletionModal } from './SessionCompletionModal';
export { default as MistakeLogModal } from './MistakeLogModal';
export { default as DataSyncAuditModal } from './DataSyncAuditModal';
export { default as LevelUpModal } from './LevelUpModal';
export { default as AdaptiveWeekReviewModal } from './AdaptiveWeekReviewModal';
export { default as DailyQuotaCelebrationModal } from './DailyQuotaCelebrationModal';
export { default as JapaneseCatStampRallyModal } from './JapaneseCatStampRallyModal';
export { default as SadCatGuiltTripModal } from './SadCatGuiltTripModal';
export { default as SanctuaryBazaarModal } from './SanctuaryBazaarModal';
export { default as TermsAndPrivacyModal } from './TermsAndPrivacyModal';
export { default as ThemeRedeemModal } from './ThemeRedeemModal';
export { default as PatchNotesHubModal } from './PatchNotesHubModal';
export { default as EditSessionModal } from './EditSessionModal';
export { default as PeerInspectorModal } from './PeerInspectorModal';

// Reusable UI Primitives & Mascot Systems
export { default as CustomCursor } from './CustomCursor';
export { default as GooeyThemeSwitch } from './GooeyThemeSwitch';
export { default as ThemedDatePicker } from './ThemedDatePicker';
export { default as ThemeSelectorDropdown } from './ThemeSelectorDropdown';
export { default as ComicPeekingCatBuddy } from './ComicPeekingCatBuddy';
export { default as CatCompanionUtilities } from './CatCompanionUtilities';
export { default as AspirantProfileCard } from './AspirantProfileCard';
export { default as AuthScreen } from './AuthScreen';
