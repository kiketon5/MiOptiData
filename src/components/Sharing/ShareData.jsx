import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const ShareData = ({ profileId, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [shareSettings, setShareSettings] = useState({
    recipientEmail: '',
    accessLevel: 'view_only',
    expirationDays: 7,
    includeDataTypes: {
      prescriptions: true,
      visualTests: true,
      symptoms: false,
      pressureMeasurements: false,
      profile: true
    },
    requirePassword: false,
    password: '',
    personalMessage: ''
  });
  const [generatedLink, setGeneratedLink] = useState(null);
  const [step, setStep] = useState(1); // 1: settings, 2: generated link

  const generateShareLink = async () => {
    setLoading(true);
    try {
      // Calculate expiration date
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + shareSettings.expirationDays);

      // Generate access token
      const accessToken = generateRandomToken();

      // Create share record
      const { data, error } = await supabase
        .from('app_061iy_shared_links')
        .insert([{
          user_id: user.id,
          profile_id: profileId,
          access_token: accessToken,
          expiration_date: expirationDate.toISOString(),
          access_level: shareSettings.accessLevel,
          recipient_email: shareSettings.recipientEmail || null,
          included_data_types: shareSettings.includeDataTypes
        }])
        .select()
        .single();

      if (error) throw error;

      // Generate shareable URL
      const baseUrl = window.location.origin;
      const shareUrl = `${baseUrl}/shared/${accessToken}`;
      
      setGeneratedLink({
        url: shareUrl,
        token: accessToken,
        expiresAt: expirationDate,
        id: data.id
      });

      // Send email if recipient provided
      if (shareSettings.recipientEmail) {
        await sendShareEmail(shareUrl, shareSettings.recipientEmail);
      }

      setStep(2);
    } catch (error) {
      console.error('Error generating share link:', error);
      alert('Failed to generate share link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendShareEmail = async (shareUrl, recipientEmail) => {
    try {
      // This would typically call an edge function to send email
      // For now, we'll just log it
      console.log(`Share link would be sent to ${recipientEmail}: ${shareUrl}`);
      
      // TODO: Implement email sending via edge function
      // await supabase.functions.invoke('send-share-email', {
      //   body: {
      //     recipientEmail,
      //     shareUrl,
      //     senderName: user.user_metadata?.full_name || user.email,
      //     message: shareSettings.personalMessage
      //   }
      // });
    } catch (error) {
      console.error('Error sending share email:', error);
      // Don't throw error - link generation should still succeed
    }
  };

  const generateRandomToken = () => {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copied to clipboard!');
    }
  };

  const handleDataTypeChange = (dataType) => {
    setShareSettings(prev => ({
      ...prev,
      includeDataTypes: {
        ...prev.includeDataTypes,
        [dataType]: !prev.includeDataTypes[dataType]
      }
    }));
  };

  const revokeLink = async () => {
    if (!generatedLink) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('app_061iy_shared_links')
        .delete()
        .eq('id', generatedLink.id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setGeneratedLink(null);
      setStep(1);
      alert('Share link has been revoked successfully.');
    } catch (error) {
      console.error('Error revoking link:', error);
      alert('Failed to revoke link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {step === 1 ? 'Share Eye Health Data' : 'Share Link Generated'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {step === 1 ? (
          <div className="space-y-6">
            {/* Recipient Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Email (Optional)
              </label>
              <input
                type="email"
                value={shareSettings.recipientEmail}
                onChange={(e) => setShareSettings(prev => ({ ...prev, recipientEmail: e.target.value }))}
                placeholder="doctor@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                If provided, we'll send the share link via email
              </p>
            </div>

            {/* Access Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Level
              </label>
              <select
                value={shareSettings.accessLevel}
                onChange={(e) => setShareSettings(prev => ({ ...prev, accessLevel: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="view_only">View Only</option>
                <option value="download">View & Download</option>
              </select>
            </div>

            {/* Expiration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link Expires In
              </label>
              <select
                value={shareSettings.expirationDays}
                onChange={(e) => setShareSettings(prev => ({ ...prev, expirationDays: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 Day</option>
                <option value={3}>3 Days</option>
                <option value={7}>1 Week</option>
                <option value={14}>2 Weeks</option>
                <option value={30}>1 Month</option>
              </select>
            </div>

            {/* Data Types to Include */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Data to Share
              </label>
              <div className="space-y-2">
                {[
                  { key: 'profile', label: 'Profile Information', description: 'Basic demographics' },
                  { key: 'prescriptions', label: 'Prescriptions', description: 'Eye prescription history' },
                  { key: 'visualTests', label: 'Visual Acuity Tests', description: 'Vision test results' },
                  { key: 'symptoms', label: 'Symptoms', description: 'Symptom tracking data' },
                  { key: 'pressureMeasurements', label: 'Eye Pressure', description: 'Pressure measurements' }
                ].map(({ key, label, description }) => (
                  <label key={key} className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={shareSettings.includeDataTypes[key]}
                      onChange={() => handleDataTypeChange(key)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">{label}</span>
                      <p className="text-xs text-gray-500">{description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Personal Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personal Message (Optional)
              </label>
              <textarea
                value={shareSettings.personalMessage}
                onChange={(e) => setShareSettings(prev => ({ ...prev, personalMessage: e.target.value }))}
                rows={3}
                placeholder="Add a message for the recipient..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Security Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">Security Notice</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Shared links contain sensitive health information. Only share with trusted healthcare providers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Generated Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share Link
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={generatedLink?.url || ''}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                />
                <button
                  onClick={() => copyToClipboard(generatedLink?.url)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Link Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Link Details</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Expires:</span>
                  <span>{generatedLink?.expiresAt?.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Access Level:</span>
                  <span className="capitalize">{shareSettings.accessLevel.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Recipient:</span>
                  <span>{shareSettings.recipientEmail || 'Anyone with link'}</span>
                </div>
              </div>
            </div>

            {/* Included Data */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Shared Data Types</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(shareSettings.includeDataTypes)
                  .filter(([_, included]) => included)
                  .map(([type, _]) => (
                    <span key={type} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                      {type.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-green-800">Share Link Created Successfully</h4>
                  <p className="text-sm text-green-700 mt-1">
                    {shareSettings.recipientEmail ? 
                      `Link has been sent to ${shareSettings.recipientEmail}` :
                      'You can now share this link with healthcare providers'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={revokeLink}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Revoking...' : 'Revoke Link'}
              </button>
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Create Another
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={generateShareLink}
              disabled={loading || !Object.values(shareSettings.includeDataTypes).some(Boolean)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span>Generate Link</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareData;