// tauri-integration.js
// This file provides utility functions to interact with the Tauri backend

// Check if we're running in a Tauri app
export const isTauri = window.__TAURI__ !== undefined;

// Store the current backend URL
let currentBackendUrl = process.env.REACT_APP_API_URL || "http://localhost:8081";

// Function to get the current backend URL
export function getBackendUrl() {
  return currentBackendUrl;
}

// Function to set the backend URL
export function setBackendUrl(url) {
  currentBackendUrl = url;
  console.log(`Backend URL set to: ${currentBackendUrl}`);
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
    const result = await invoke('start_backend');
    console.log('Backend start result:', result);
    
    // Try to find which port the backend is running on
    const ports = [8081, 8080, 8000, 3000];
    for (const port of ports) {
      const healthUrl = `http://localhost:${port}/api/health`;
      try {
        const response = await fetch(healthUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(2000)
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'ok') {
            const newUrl = `http://localhost:${port}`;
            setBackendUrl(newUrl);
            console.log(`Backend is running at: ${newUrl}`);
            return true;
          }
        }
      } catch (e) {
        console.log(`Port ${port} not available:`, e.message);
      }
    }
    
    console.error('Failed to detect running backend on any port');
    return false;
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

// Function to try multiple ports when connecting to backend
export const tryMultiplePorts = async (basePath = '/api/health', ports = [8081, 8080, 8000, 3000]) => {
  console.log(`Trying to connect to backend on multiple ports...`);
  
  for (const port of ports) {
    const baseUrl = `http://localhost:${port}`;
    const url = `${baseUrl}${basePath}`;
    console.log(`Attempting connection to: ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'include',
        signal: AbortSignal.timeout(2000) // 2 second timeout per attempt
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Successfully connected to backend at: ${baseUrl}`, data);
        setBackendUrl(baseUrl);
        return { success: true, port, url: baseUrl };
      }
    } catch (error) {
      console.log(`Failed to connect to ${url}: ${error.message}`);
    }
  }
  
  return { success: false };
} 