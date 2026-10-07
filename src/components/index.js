/**
 * Centralized Component Barrel Index
 * Cleanly categorized: views, modals, ui, backgrounds, terminal, auth, common
 */

// Views & Screens
export { default as DashboardView } from './views/DashboardView';
export { default as DailyTrackerView } from './views/DailyTrackerView';
export { default as MockTrackerView } from './views/MockTrackerView';
export { default as StudyTimerView } from './views/StudyTimerView';
export { default as ProfileView } from './views/ProfileView';
export { default as SettingsView } from './views/SettingsView';
export { default as TimelineView } from './views/TimelineView';
export { default as ErrorLogView } from './views/ErrorLogView';
export { default as AchievementsView } from './views/AchievementsView';
export { default as BacklogRecoveryView } from './views/BacklogRecoveryView';
export { default as SanctuaryShopView } from './views/SanctuaryShopView';
export { default as StudyLounge } from './views/StudyLounge';
export { default as LeaderboardComingSoonView } from './views/LeaderboardComingSoonView';
export { default as BloombergTerminalView } from './terminal/BloombergTerminalView';

// Modals & Dialogue Systems
export { default as AdaptiveWeekReviewModal } from './modals/AdaptiveWeekReviewModal';
export { default as DailyQuotaCelebrationModal } from './modals/DailyQuotaCelebrationModal';
export { default as DataSyncAuditModal } from './modals/DataSyncAuditModal';
export { default as EditSessionModal } from './modals/EditSessionModal';
export { default as EncryptedBackupModal } from './modals/EncryptedBackupModal';
export { default as LevelUpModal } from './modals/LevelUpModal';
export { default as MistakeLogModal } from './modals/MistakeLogModal';
export { default as OnboardingWelcomeModal } from './modals/OnboardingWelcomeModal';
export { default as PatchNotesHubModal } from './modals/PatchNotesHubModal';
export { default as PeerInspectorModal } from './modals/PeerInspectorModal';
export { default as SadCatGuiltTripModal } from './modals/SadCatGuiltTripModal';
export { default as SanctuaryBazaarModal } from './modals/SanctuaryBazaarModal';
export { default as SessionCompletionModal } from './modals/SessionCompletionModal';
export { default as TermsAndPrivacyModal } from './modals/TermsAndPrivacyModal';
export { default as ThemeRedeemModal } from './modals/ThemeRedeemModal';

// Auth
export { default as AuthScreen } from './auth/AuthScreen';

// Common
export { default as ErrorBoundary } from './common/ErrorBoundary';

// Backgrounds & Canvas Engines
export { default as Balatro } from './backgrounds/Balatro';
export { default as MicroSlats } from './backgrounds/MicroSlats';
export { default as DreamcoreAsciiCanvas } from './backgrounds/DreamcoreAsciiCanvas';
export { default as MaleniaAsciiCanvas } from './backgrounds/MaleniaAsciiCanvas';
export { default as DitherBackground } from './backgrounds/DitherBackground';
export { default as CubesCanvas } from './backgrounds/CubesCanvas';
export { default as ShaderGradientCanvas } from './backgrounds/ShaderGradientCanvas';

// Terminal
export { default as TerminalAsciiBootLoader } from './terminal/TerminalAsciiBootLoader';

// UI Widgets & Mascot Systems
export { default as CustomCursor } from './ui/CustomCursor';
export { default as GooeyThemeSwitch } from './ui/GooeyThemeSwitch';
export { default as ThemedDatePicker } from './ui/ThemedDatePicker';
export { default as ThemeSelectorDropdown } from './ui/ThemeSelectorDropdown';
export { default as ThemeSwitchToast } from './ui/ThemeSwitchToast';
export { default as UpdateNotificationToast } from './ui/UpdateNotificationToast';
export { default as ActivityNotificationToast } from './ui/ActivityNotificationToast';
export { default as ComicPeekingCatBuddy } from './ui/ComicPeekingCatBuddy';
export { default as CatCompanionUtilities } from './ui/CatCompanionUtilities';
export { default as AspirantProfileCard } from './ui/AspirantProfileCard';
export { default as CookieConsentBanner } from './ui/CookieConsentBanner';
export { default as FloatingTimerWidget } from './ui/FloatingTimerWidget';
export { default as FocusTransitionPortal } from './ui/FocusTransitionPortal';
export { default as AnimatedStreakBadge } from './ui/AnimatedStreakBadge';
export { default as AnimatedChip } from './ui/AnimatedChip';
export { default as AnimatedCombatIcons } from './ui/AnimatedCombatIcons';
export { default as AnimatedInputBar } from './ui/AnimatedInputBar';
export { default as AnimatedUiIcons } from './ui/AnimatedUiIcons';
export { default as AsciiMascot } from './ui/AsciiMascot';
export { default as AspirantIcons } from './ui/AspirantIcons';
export { default as AvatarRenderer } from './ui/AvatarRenderer';
export { default as CosmeticFrameSvg } from './ui/CosmeticFrameSvg';
export { default as GamifiedStatusBorderOverlay } from './ui/GamifiedStatusBorderOverlay';
export { default as GlareHoverCard } from './ui/GlareHoverCard';
export { default as HeaderProfileDropdown } from './ui/HeaderProfileDropdown';
export { default as LiquidIntroLoader } from './ui/LiquidIntroLoader';
export { default as LiquidMetalLogo } from './ui/LiquidMetalLogo';
export { default as PrestigeBadgeEmblem } from './ui/PrestigeBadgeEmblem';
export { default as RoadmapTimelineGraph } from './ui/RoadmapTimelineGraph';
export { default as SanctuaryDeskDecor } from './ui/SanctuaryDeskDecor';
export { default as StackedChips } from './ui/StackedChips';
export { default as StudyCompanionEntity } from './ui/StudyCompanionEntity';
export { default as StudyContributionHeatmap } from './ui/StudyContributionHeatmap';
export { default as WeekContributionHeatmap } from './ui/WeekContributionHeatmap';
