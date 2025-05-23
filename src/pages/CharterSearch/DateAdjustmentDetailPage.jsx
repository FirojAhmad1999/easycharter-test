
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DateAdjustmentDetail from '../../components/CharterSearch/SearchDetails/DateAdjustmentDetail';
import { useSearch } from '../../context/CharterSearch/SearchContext';
import RouteMap from '../../components/common/RouteMap';
import ItinerarySearchCard from '../../components/CharterSearch/Search/ItinerarySearchCard';

const DateAdjustmentDetailPage = () => {
  const navigate = useNavigate();
  const { itineraryData, loading, setLoading } = useSearch();
  const [hoveredFlightCoords, setHoveredFlightCoords] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBackClick = () => {
    setLoading(false); // Reset loading before navigating back
    navigate('/search-details');
  };

  return (
    <div className="min-h-screen relative">
      {/* Back Arrow - Top Left Corner */}
      <button onClick={handleBackClick} className="absolute top-4 left-6">
        <ArrowLeft className="w-6 h-6" />
      </button>
      <div className="container mx-auto p-6 pt-14">
        {/* Added padding to avoid overlap */}
        {/* Main Content Area */}
        <div className="flex flex-col gap-6 items-start lg:flex-row">
          {/* Left Column: DateAdjustmentDetail */}
          <div className="w-full lg:w-3/5">
            <DateAdjustmentDetail setHoveredFlightCoords={setHoveredFlightCoords} />
          </div>
          {/* Right Column: Map and Itinerary Text - Responsive Layout */}
          {!loading && itineraryData && (
            <div className="w-full lg:w-2/5 space-y-6 lg:sticky lg:top-6">
              {itineraryData.itineraryResponseNewdata && (
                <ItinerarySearchCard itinerary={itineraryData.itineraryResponseNewdata.itinerary} />
              )}
              <RouteMap itineraryData={itineraryData} hoveredFlightCoords={hoveredFlightCoords} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateAdjustmentDetailPage;