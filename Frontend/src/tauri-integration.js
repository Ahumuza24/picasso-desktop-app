// tauri-integration.js
// This file provides utility functions to interact with the Tauri backend

// Check if we're running in a Tauri app
export const isTauri = window.__TAURI__ !== undefined;

// Initialize Tauri API if available
let tauriApi = null;
if (isTauri) {
  const importTauri = async () => {
    tauriApi = await import('@tauri-apps/api');
  };
  importTauri();
}

// Function to check if backend is running
export async function checkBackendStatus() {
  if (!isTauri) return true; // If not in Tauri, assume backend is managed externally
  
  try {
    const { invoke } = await import('@tauri-apps/api');
    return await invoke('check_backend_status');
  } catch (error) {
    console.error('Failed to check backend status:', error);
    return false;
  }
}

// Function to start backend if not running
export async function startBackend() {
  if (!isTauri) return true; // If not in Tauri, assume backend is managed externally
  
  try {
    const { invoke } = await import('@tauri-apps/api');
    await invoke('start_backend');
    return true;
  } catch (error) {
    console.error('Failed to start backend:', error);
    return false;
  }
}

// Function to stop backend
export async function stopBackend() {
  if (!isTauri) return true; // If not in Tauri, no need to stop backend
  
  try {
    const { invoke } = await import('@tauri-apps/api');
    await invoke('stop_backend');
    return true;
  } catch (error) {
    console.error('Failed to stop backend:', error);
    return false;
  }
}

// Function to show a native message dialog
export async function showMessage(title, message, type = 'info') {
  if (!isTauri) {
    // Fallback to browser alert if not in Tauri
    alert(`${title}: ${message}`);
    return;
  }
  
  try {
    const { dialog } = await import('@tauri-apps/api');
    await dialog.message(message, { title, type });
  } catch (error) {
    console.error('Failed to show message dialog:', error);
    alert(`${title}: ${message}`); // Fallback to browser alert
  }
}

// Function to open external URLs in default browser
export async function openExternalUrl(url) {
  if (!isTauri) {
    window.open(url, '_blank');
    return;
  }
  
  try {
    const { shell } = await import('@tauri-apps/api');
    await shell.open(url);
  } catch (error) {
    console.error('Failed to open URL:', error);
    window.open(url, '_blank'); // Fallback to browser
  }
} 