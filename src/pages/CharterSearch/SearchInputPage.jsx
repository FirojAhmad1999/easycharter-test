import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../context/CharterSearch/SearchContext';
import { RecentItineraryProvider } from '../../context/RecentItineraryContext/RecentItineraryContext';
import SearchInput from '../../components/CharterSearch/Search/SearchInput';
import RecentSearches from '../../components/RecentSearches/RecentSearches';
import ErrorPrompt from '../../components/CharterSearch/SearchDetails/ErrorPrompt';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { pushNotificationService } from '../../services/pushNotificationService';
import { tokenHandler } from '../../utils/tokenHandler';

const SearchInputPage = () => {
  const { loading, error, getItineraryByText, getOptionsByItineraryId } = useSearch();
  const [showError, setShowError] = useState(false);
  const [notificationError, setNotificationError] = useState(null);
  const [notificationStatus, setNotificationStatus] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const registerForPushNotifications = async () => {
      // Check if user is authenticated
      const token = tokenHandler.getToken();
      if (!token) {
        console.log('User not authenticated, skipping push registration');
        return;
      }

      try {
        console.log('Starting push notification registration...');
        
        // Register service worker
        const swRegistration = await pushNotificationService.registerServiceWorker();
        console.log('Service worker registered successfully');
        
        // Get push subscription
        const subscription = await pushNotificationService.getSubscription(swRegistration);
        console.log('Got push subscription:', subscription.endpoint);
        
        // Register device with backend
        const result = await pushNotificationService.registerDevice(subscription);
        console.log('Device registration result:', result);
        
        setNotificationStatus(result.status);
        
        if (result.status === 'skipped' || result.status === 'cached') {
          console.log('Device registration handled:', result.message);
        } else {
          console.log('Device registered successfully');
        }
      } catch (error) {
        console.error('Push notification registration failed:', error);
        setNotificationError(error.message || 'Failed to setup push notifications');
      }
    };

    registerForPushNotifications();
  }, []);

  const handleItinerarySearch = async (itineraryText) => {
    setShowError(false); // Reset error state on new search
    try {
      const response = await getItineraryByText(itineraryText);
      if (response?.itineraryResponseNewdata?.itinerary) {
        navigate('/search-details');
      } else { 
        setShowError(true);
      }
    } catch (err) {
      console.error('Failed to fetch itinerary:', err);
      setShowError(true);
    }
  };

  const handleRecentItinerarySelect = async (itineraryId) => {
    setShowError(false);
    try {
      const response = await getOptionsByItineraryId(itineraryId);
      if (response?.itineraryResponseNewdata?.itinerary) {
        navigate('/search-details');
      } else {
        setShowError(true);
      }
    } catch (err) {
      console.error('Failed to fetch itinerary options:', err);
      setShowError(true);
    }
  };

  // Sync showError with the global error state when loading is done
  useEffect(() => {
    if (!loading && error) {
      setShowError(true);
    }
  }, [error, loading]);

  return (
    <RecentItineraryProvider>
      <div className="container mx-auto p-6 relative">
        {/* Error Handling */}
        {showError && error && (
          <div className="fixed top-4 right-4 p-4 z-50">
            <ErrorPrompt error={error} onClose={() => setShowError(false)} />
          </div>
        )}
        
        {/* Notification Status/Error */}
        {(notificationError || notificationStatus) && (
          <div className={`fixed top-4 right-4 p-4 z-50 ${
            notificationError 
              ? 'bg-yellow-100 border border-yellow-400 text-yellow-700' 
              : 'bg-green-100 border border-green-400 text-green-700'
          } px-4 py-3 rounded`}>
            <p>
              {notificationError 
                ? `Push notification setup failed: ${notificationError}`
                : `Push notifications: ${notificationStatus}`
              }
            </p>
            <button 
              className="absolute top-0 right-0 p-2" 
              onClick={() => {
                setNotificationError(null);
                setNotificationStatus('');
              }}
            >
              ×
            </button>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row">
          {/* Itinerary Input Component */}
          <div className="flex-1 mb-6 md:mb-0 md:mr-6">
            <SearchInput onSearch={handleItinerarySearch} disabled={loading} />
          </div>
          
          {/* Recent Searches Component */}
          <div className="md:w-[450px]">
            <RecentSearches onSelectItinerary={handleRecentItinerarySelect} />
          </div>
        </div>
     
        {/*  Loading Indicator */}
        {loading && <LoadingOverlay />}
      </div>
    </RecentItineraryProvider>
  );
};

export default SearchInputPage;