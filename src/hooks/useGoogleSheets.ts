import { useState } from 'react';
import { LocalProfile } from './useLocalProfiles';
import { ServiceProvider } from '../types';

const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID || '1paLi0tiSOHucsR4Ma_yrZgeoxVVKvluxjBH-ScDNjUc';
const LOCAL_SHEET_NAME = 'Local Profiles';
const PROVIDERS_SHEET_NAME = 'Service Providers';
const APPOINTMENTS_SHEET_NAME = 'Appointments';
const ANALYTICS_SHEET_NAME = 'Analytics';

// Google Sheets API requires OAuth2 for write operations
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

export function useGoogleSheets() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const isGoogleSheetsConfigured = () => {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    return !!(apiKey && clientId);
  };

  const initializeGoogleSheetsAPI = async () => {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!apiKey || !clientId) {
      throw new Error('Google Sheets integration is not configured. Please check your environment variables.');
    }

    // Load Google API
    if (!window.gapi) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load Google API script'));
        document.head.appendChild(script);
      });
    }

    // Load Google Identity Services
    if (!window.google?.accounts) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load Google Identity Services script'));
        document.head.appendChild(script);
      });
    }

    await new Promise((resolve) => {
      window.gapi.load('client:auth2', resolve);
    });

    await window.gapi.client.init({
      apiKey: apiKey,
      clientId: clientId,
      discoveryDocs: [DISCOVERY_DOC],
      scope: SCOPES
    });

    // Check if user is already signed in
    const authInstance = window.gapi.auth2.getAuthInstance();
    if (authInstance) {
      const isCurrentlySignedIn = authInstance.isSignedIn.get();
      setIsSignedIn(isCurrentlySignedIn);
      console.log('Google Sheets auth status:', isCurrentlySignedIn);
    }
  };

  const signIn = async () => {
    try {
      setError(null);
      setLoading(true);
      
      if (!isGoogleSheetsConfigured()) {
        throw new Error('Google Sheets integration is not configured. Please check your environment variables.');
      }

      await initializeGoogleSheetsAPI();
      const authInstance = window.gapi.auth2.getAuthInstance();
      
      if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn({
          prompt: 'consent'
        });
        setIsSignedIn(true);
        console.log('Successfully signed in to Google Sheets');
      }
    } catch (error: any) {
      console.error('Sign-in error:', error);
      
      // Handle specific OAuth errors with more user-friendly messages
      if (error?.error === 'idpiframe_initialization_failed') {
        const currentOrigin = window.location.origin;
        throw new Error(
          `Google Sheets integration requires proper OAuth configuration. ` +
          `Please ensure the OAuth client is configured for this domain: ${currentOrigin}`
        );
      } else if (error?.error === 'popup_blocked_by_browser') {
        throw new Error('Sign-in popup was blocked by your browser. Please allow popups for this site and try again.');
      } else if (error?.error === 'access_denied') {
        throw new Error('Google Sign-in was cancelled. You can still use the application - your data will be saved locally.');
      } else {
        throw new Error(`Google Sheets connection failed: ${error?.message || 'Unknown error'}. Your data will be saved locally instead.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const ensureAuthenticated = async () => {
    try {
      if (!isGoogleSheetsConfigured()) {
        console.log('Google Sheets not configured, skipping authentication');
        return false;
      }

      await initializeGoogleSheetsAPI();
      const authInstance = window.gapi.auth2.getAuthInstance();
      
      if (!authInstance.isSignedIn.get()) {
        console.log('Not signed in, attempting silent sign-in...');
        try {
          await authInstance.signIn({ prompt: 'none' });
          setIsSignedIn(true);
          console.log('Silent sign-in successful');
        } catch (silentError) {
          console.log('Silent sign-in failed, user interaction required');
          return false;
        }
      }
      return true;
    } catch (error) {
      console.warn('Authentication failed:', error);
      return false;
    }
  };

  const ensureSheetExists = async (sheetName: string, headers: string[]) => {
    try {
      const authenticated = await ensureAuthenticated();
      if (!authenticated) {
        console.log('Not authenticated, skipping sheet creation');
        return false;
      }
      
      // Check if sheet exists
      const response = await window.gapi.client.sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      });

      const sheets = response.result.sheets || [];
      const sheetExists = sheets.some((sheet: any) => sheet.properties.title === sheetName);

      if (!sheetExists) {
        console.log(`Creating sheet: ${sheetName}`);
        // Create the sheet
        await window.gapi.client.sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          resource: {
            requests: [{
              addSheet: {
                properties: {
                  title: sheetName
                }
              }
            }]
          }
        });

        // Add headers with formatting
        await window.gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `'${sheetName}'!A1:${String.fromCharCode(64 + headers.length)}1`,
          valueInputOption: 'RAW',
          resource: {
            values: [headers]
          }
        });

        // Format header row
        const newSheetId = sheets.length;
        await window.gapi.client.sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          resource: {
            requests: [{
              repeatCell: {
                range: {
                  sheetId: newSheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: headers.length
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
                    textFormat: { bold: true }
                  }
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat)'
              }
            }]
          }
        });
        console.log(`Sheet ${sheetName} created successfully`);
      }
      return true;
    } catch (error) {
      console.error('Error ensuring sheet exists:', error);
      return false;
    }
  };

  const setupAllSheets = async () => {
    try {
      setError(null);
      setLoading(true);
      
      if (!isGoogleSheetsConfigured()) {
        console.log('Google Sheets not configured, skipping setup');
        return false;
      }
      
      const authenticated = await ensureAuthenticated();
      if (!authenticated) {
        console.log('Not authenticated, skipping sheet setup');
        return false;
      }
      
      // Local Profiles Sheet
      const localProfileHeaders = [
        'ID', 'Full Name', 'Skill', 'Years Experience', 'Location', 
        'Contact', 'Availability', 'Status', 'Bio (AI)', 'Suggested Price (ZAR)', 
        'Created At', 'Profile Image', 'Portfolio Images Count', 'Customer Reviews Count'
      ];
      await ensureSheetExists(LOCAL_SHEET_NAME, localProfileHeaders);

      // Service Providers Sheet
      const serviceProviderHeaders = [
        'ID', 'Full Name', 'Service', 'Years Experience', 'Location', 
        'Phone', 'Email', 'WhatsApp', 'Website', 'Generated Bio', 
        'Suggested Price', 'Status', 'Is Business Owner', 'Business Name', 
        'Business Type', 'Business Description', 'Created At', 'Coordinates (Lat)', 
        'Coordinates (Lng)', 'Profile Images Count', 'Customer Reviews Count'
      ];
      await ensureSheetExists(PROVIDERS_SHEET_NAME, serviceProviderHeaders);

      // Appointments Sheet
      const appointmentHeaders = [
        'ID', 'Provider ID', 'Provider Name', 'Client Name', 'Client Phone', 
        'Client Email', 'Service', 'Date', 'Start Time', 'End Time', 
        'Status', 'Notes', 'Created At', 'Updated At'
      ];
      await ensureSheetExists(APPOINTMENTS_SHEET_NAME, appointmentHeaders);

      // Analytics Sheet
      const analyticsHeaders = [
        'Date', 'Total Profiles', 'Local Profiles', 'Service Providers', 
        'Pending Profiles', 'Ready Profiles', 'Published Profiles', 
        'Total Appointments', 'Pending Appointments', 'Confirmed Appointments', 
        'Completed Appointments', 'Top Service', 'Top Location', 'Average Price'
      ];
      await ensureSheetExists(ANALYTICS_SHEET_NAME, analyticsHeaders);

      console.log('All sheets setup completed successfully');
      return true;
    } catch (error: any) {
      console.error('Error setting up sheets:', error);
      setError(`Failed to setup Google Sheets: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const syncServiceProviderToSheets = async (provider: ServiceProvider): Promise<boolean> => {
    try {
      if (!isGoogleSheetsConfigured()) {
        console.log('Google Sheets not configured, skipping sync for provider:', provider.fullName);
        return false;
      }

      const authenticated = await ensureAuthenticated();
      if (!authenticated) {
        console.log('Not authenticated, skipping sync for provider:', provider.fullName);
        return false;
      }

      const headers = [
        'ID', 'Full Name', 'Service', 'Years Experience', 'Location', 
        'Phone', 'Email', 'WhatsApp', 'Website', 'Generated Bio', 
        'Suggested Price', 'Status', 'Is Business Owner', 'Business Name', 
        'Business Type', 'Business Description', 'Created At', 'Coordinates (Lat)', 
        'Coordinates (Lng)', 'Profile Images Count', 'Customer Reviews Count'
      ];

      const sheetExists = await ensureSheetExists(PROVIDERS_SHEET_NAME, headers);
      if (!sheetExists) {
        console.log('Failed to ensure sheet exists, skipping sync');
        return false;
      }

      const values = [
        provider.id,
        provider.fullName,
        provider.service,
        provider.yearsExperience.toString(),
        provider.location,
        provider.contactDetails.phone,
        provider.contactDetails.email,
        provider.contactDetails.whatsapp || '',
        provider.contactDetails.website || '',
        provider.generatedBio,
        provider.suggestedPrice.toString(),
        provider.status,
        provider.isBusinessOwner ? 'Yes' : 'No',
        provider.businessInfo?.businessName || '',
        provider.businessInfo?.businessType || '',
        provider.businessInfo?.description || '',
        provider.createdAt.toISOString(),
        provider.coordinates?.lat?.toString() || '',
        provider.coordinates?.lng?.toString() || '',
        provider.profileImages?.length?.toString() || '0',
        provider.customerReviews?.length?.toString() || '0'
      ];

      // Check if provider already exists
      const existingData = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${PROVIDERS_SHEET_NAME}'!A:A`,
      });

      const existingIds = existingData.result.values?.slice(1).map((row: any) => row[0]) || [];
      const existingIndex = existingIds.indexOf(provider.id);

      if (existingIndex >= 0) {
        // Update existing row
        const rowNumber = existingIndex + 2;
        await window.gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `'${PROVIDERS_SHEET_NAME}'!A${rowNumber}:${String.fromCharCode(64 + headers.length)}${rowNumber}`,
          valueInputOption: 'RAW',
          resource: {
            values: [values]
          }
        });
        console.log(`Updated provider ${provider.fullName} in Google Sheets`);
      } else {
        // Append new row
        await window.gapi.client.sheets.spreadsheets.values.append({
          spreadsheetId: SPREADSHEET_ID,
          range: `'${PROVIDERS_SHEET_NAME}'!A:${String.fromCharCode(64 + headers.length)}`,
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          resource: {
            values: [values]
          }
        });
        console.log(`Added provider ${provider.fullName} to Google Sheets`);
      }

      return true;
    } catch (err: any) {
      console.error('Google Sheets sync error for provider:', provider.fullName, err);
      return false;
    }
  };

  const syncLocalProfileToSheets = async (profile: LocalProfile): Promise<boolean> => {
    try {
      if (!isGoogleSheetsConfigured()) {
        console.log('Google Sheets not configured, skipping sync for profile:', profile.fullName);
        return false;
      }

      const authenticated = await ensureAuthenticated();
      if (!authenticated) {
        console.log('Not authenticated, skipping sync for profile:', profile.fullName);
        return false;
      }

      const headers = [
        'ID', 'Full Name', 'Skill', 'Years Experience', 'Location', 
        'Contact', 'Availability', 'Status', 'Bio (AI)', 'Suggested Price (ZAR)', 
        'Created At', 'Profile Image', 'Portfolio Images Count', 'Customer Reviews Count'
      ];

      const sheetExists = await ensureSheetExists(LOCAL_SHEET_NAME, headers);
      if (!sheetExists) {
        console.log('Failed to ensure sheet exists, skipping sync');
        return false;
      }

      const values = [
        profile.id,
        profile.fullName,
        profile.skill,
        profile.yearsExperience.toString(),
        profile.location,
        profile.contact,
        profile.availability,
        profile.status,
        profile.bioAI || '',
        profile.suggestedPriceZAR.toString(),
        profile.createdAt.toISOString(),
        profile.profileImage ? 'Yes' : 'No',
        (profile.portfolioImages?.length || 0).toString(),
        (profile.customerReviews?.length || 0).toString()
      ];

      // Check if profile already exists
      const existingData = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${LOCAL_SHEET_NAME}'!A:A`,
      });

      const existingIds = existingData.result.values?.slice(1).map((row: any) => row[0]) || [];
      const existingIndex = existingIds.indexOf(profile.id);

      if (existingIndex >= 0) {
        // Update existing row
        const rowNumber = existingIndex + 2;
        await window.gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `'${LOCAL_SHEET_NAME}'!A${rowNumber}:${String.fromCharCode(64 + headers.length)}${rowNumber}`,
          valueInputOption: 'RAW',
          resource: {
            values: [values]
          }
        });
        console.log(`Updated profile ${profile.fullName} in Google Sheets`);
      } else {
        // Append new row
        await window.gapi.client.sheets.spreadsheets.values.append({
          spreadsheetId: SPREADSHEET_ID,
          range: `'${LOCAL_SHEET_NAME}'!A:${String.fromCharCode(64 + headers.length)}`,
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          resource: {
            values: [values]
          }
        });
        console.log(`Added profile ${profile.fullName} to Google Sheets`);
      }

      return true;
    } catch (err: any) {
      console.error('Google Sheets sync error for profile:', profile.fullName, err);
      return false;
    }
  };

  const syncAppointmentToSheets = async (appointment: any): Promise<boolean> => {
    try {
      if (!isGoogleSheetsConfigured()) {
        console.log('Google Sheets not configured, skipping appointment sync');
        return false;
      }

      const authenticated = await ensureAuthenticated();
      if (!authenticated) {
        console.log('Not authenticated, skipping appointment sync');
        return false;
      }

      const headers = [
        'ID', 'Provider ID', 'Provider Name', 'Client Name', 'Client Phone', 
        'Client Email', 'Service', 'Date', 'Start Time', 'End Time', 
        'Status', 'Notes', 'Created At', 'Updated At'
      ];

      const sheetExists = await ensureSheetExists(APPOINTMENTS_SHEET_NAME, headers);
      if (!sheetExists) {
        console.log('Failed to ensure appointments sheet exists');
        return false;
      }

      const values = [
        appointment.id,
        appointment.providerId,
        appointment.providerName || '',
        appointment.clientName,
        appointment.clientPhone,
        appointment.clientEmail,
        appointment.service,
        appointment.date,
        appointment.startTime,
        appointment.endTime,
        appointment.status,
        appointment.notes || '',
        appointment.createdAt.toISOString(),
        new Date().toISOString()
      ];

      // Append new appointment
      await window.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${APPOINTMENTS_SHEET_NAME}'!A:${String.fromCharCode(64 + headers.length)}`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [values]
        }
      });

      console.log('Appointment synced to Google Sheets');
      return true;
    } catch (err: any) {
      console.error('Google Sheets appointment sync error:', err);
      return false;
    }
  };

  const updateAnalytics = async (analyticsData: any): Promise<boolean> => {
    try {
      if (!isGoogleSheetsConfigured()) {
        console.log('Google Sheets not configured, skipping analytics sync');
        return false;
      }

      const authenticated = await ensureAuthenticated();
      if (!authenticated) {
        console.log('Not authenticated, skipping analytics sync');
        return false;
      }

      const headers = [
        'Date', 'Total Profiles', 'Local Profiles', 'Service Providers', 
        'Pending Profiles', 'Ready Profiles', 'Published Profiles', 
        'Total Appointments', 'Pending Appointments', 'Confirmed Appointments', 
        'Completed Appointments', 'Top Service', 'Top Location', 'Average Price'
      ];

      const sheetExists = await ensureSheetExists(ANALYTICS_SHEET_NAME, headers);
      if (!sheetExists) {
        console.log('Failed to ensure analytics sheet exists');
        return false;
      }

      const values = [
        new Date().toISOString().split('T')[0],
        analyticsData.totalProfiles?.toString() || '0',
        analyticsData.localProfiles?.toString() || '0',
        analyticsData.serviceProviders?.toString() || '0',
        analyticsData.pendingProfiles?.toString() || '0',
        analyticsData.readyProfiles?.toString() || '0',
        analyticsData.publishedProfiles?.toString() || '0',
        analyticsData.totalAppointments?.toString() || '0',
        analyticsData.pendingAppointments?.toString() || '0',
        analyticsData.confirmedAppointments?.toString() || '0',
        analyticsData.completedAppointments?.toString() || '0',
        analyticsData.topService || '',
        analyticsData.topLocation || '',
        analyticsData.averagePrice?.toString() || '0'
      ];

      // Append analytics data
      await window.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${ANALYTICS_SHEET_NAME}'!A:${String.fromCharCode(64 + headers.length)}`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [values]
        }
      });

      console.log('Analytics synced to Google Sheets');
      return true;
    } catch (err: any) {
      console.error('Google Sheets analytics sync error:', err);
      return false;
    }
  };

  const batchSyncLocalProfiles = async (profiles: LocalProfile[]): Promise<number> => {
    let successCount = 0;

    for (const profile of profiles) {
      const success = await syncLocalProfileToSheets(profile);
      if (success) successCount++;
    }

    return successCount;
  };

  const batchSyncServiceProviders = async (providers: ServiceProvider[]): Promise<number> => {
    let successCount = 0;

    for (const provider of providers) {
      const success = await syncServiceProviderToSheets(provider);
      if (success) successCount++;
    }

    return successCount;
  };

  return {
    syncLocalProfileToSheets,
    syncServiceProviderToSheets,
    syncAppointmentToSheets,
    updateAnalytics,
    batchSyncLocalProfiles,
    batchSyncServiceProviders,
    setupAllSheets,
    signIn,
    isSignedIn,
    isGoogleSheetsConfigured,
    loading,
    error
  };
}

// Extend the global window object to include gapi and google
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}