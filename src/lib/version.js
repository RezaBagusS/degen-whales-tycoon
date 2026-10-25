/**
 * Single Source of Truth for Application Versioning
 * Following Semantic Versioning 2.0.0 (https://semver.org/)
 *
 * Format: MAJOR.MINOR.PATCH
 * - MAJOR: Breaking changes in save state schema or engine architecture
 * - MINOR: New backward-compatible gameplay features (e.g., Multi-position perps, Ops Center)
 * - PATCH: Backward-compatible bug fixes and telemetry adjustments
 */

export const APP_VERSION = '1.5.0';
export const APP_DISPLAY_VERSION = `v${APP_VERSION}`;
export const APP_BUILD_NAME = 'Degen & Whale: Ops & Multi-Position Perps';
