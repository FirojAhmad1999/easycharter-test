import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BaseDetail from '../../components/CharterSearch/SearchDetails/BaseDetail';
import { useSearch } from '../../context/CharterSearch/SearchContext';
import RouteMap from '../../components/common/RouteMap';
import ItinerarySearchCard from '../../components/CharterSearch/Search/ItinerarySearchCard';

const BaseDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { itineraryData, loading, getItineraryByText, setLoading } = useSearch();

  // Check if we have an itineraryText or ID from navigation state to re-fetch if needed
  const itineraryTextFromState = location.state?.copiedText || localStorage.getItem('lastItineraryText');

  useEffect(() => {
    if (!itineraryData && itineraryTextFromState && !loading) {
      // Re-fetch itinerary data if it's missing but we have a text to fetch from
      setLoading(true);
      getItineraryByText(itineraryTextFromState)
        .catch((err) => console.error('Failed to re-fetch itinerary:', err))
        .finally(() => setLoading(false));
    }
  }, [itineraryData, itineraryTextFromState, getItineraryByText, setLoading, loading]);

  const handleBackClick = () => {
    navigate('/search-details');
  };

  return (
    <div className="min-h-screen relative">
      <button
        onClick={handleBackClick}
        className="absolute top-4 left-6"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="container mx-auto p-6 pt-14">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="lg:w-3/5">
            <BaseDetail />
          </div>
          {!loading && itineraryData && (
            <div className="lg:w-2/5 lg:sticky lg:top-6 space-y-6">
              {itineraryData.itineraryResponseNewdata && (
                <ItinerarySearchCard itinerary={itineraryData.itineraryResponseNewdata.itinerary} />
              )}
              <RouteMap itineraryData={itineraryData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BaseDetailPage;