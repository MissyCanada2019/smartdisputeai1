/**
 * Type declaration file for PayPal loader utility functions
 */

/**
 * Loads the PayPal hosted buttons SDK and renders the buttons
 * @param callback - Function to call when SDK is loaded
 */
export function loadHostedButtonsScript(callback?: () => void): void;

/**
 * Loads the PayPal subscription SDK and renders the buttons
 * @param callback - Function to call when SDK is loaded
 */
export function loadSubscriptionScript(callback?: () => void): void;

/**
 * Renders hosted PayPal buttons
 */
export function renderHostedButtons(): void;

/**
 * Renders subscription PayPal buttons
 */
export function renderSubscriptionButton(): void;

/**
 * Unload all PayPal scripts
 */
export function unloadPayPalScripts(): void;