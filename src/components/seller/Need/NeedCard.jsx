import React, { useEffect, useState } from "react";
import { MessageSquareDot, Info } from "lucide-react";
import RibbonIcon from "../../../assets/icons.png";
import { useSellerContext } from "../../../context/seller/SellerContext"; 
import SkeletonNeedCard from "./SkeletonNeedCard";
import NeedItinerary from "./NeedItinerary"; 
import NeedChat from "./NeedChat";
import InfoModal from "../../common/InfoModal";
import { getInfoContent } from "../../../api/infoService";
import { toast } from "react-toastify";
import RouteMap from "../../common/RouteMap";

const NeedCard = () => {
  const { 
    currentUser, 
    fetchItinerary, 
    itineraries, 
    loadingItinerary, 
    itineraryError,
  } = useSellerContext();

  const [selectedItineraryId, setSelectedItineraryId] = useState(null);
  const [infoUrl, setInfoUrl] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [chatData, setChatData] = useState(null);

  // Fetch itineraries for company when component mounts or currentUser changes
  useEffect(() => {
    if (currentUser?.comId) {
      setIsFirstLoad(true);
      fetchItinerary(currentUser.comId, 30).finally(() => {
        setIsFirstLoad(false);
        setInitialLoadComplete(true);
      });
    }
  }, [currentUser, fetchItinerary]);

  const handleInfoClick = async () => {
    try {
      setLoadingInfo(true);
      const url = await getInfoContent('needs', 'info');
      setInfoUrl(url);
    } catch (error) {
      console.error('Failed to fetch info:', error);
      toast.info(error.message || "Failed to load information", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoadingInfo(false);
    }
  };

  // Use itineraries from company fetch
  const companyKey = currentUser?.comId ? `company_${currentUser.comId}` : null;
  const apiNeeds = companyKey && itineraries[companyKey] ? itineraries[companyKey] : [];
  
  // Map API response to match expected fields
  const displayNeeds = apiNeeds.map(need => ({
    id: need.itineraryID,
    buyerName: need.buyerName,
    itineraryFromTo: need.itineraryFromTo,
    itineraryText: need.itineraryText,
    buyerTag: need.buyerTag,
    allowDelete: true,
    activeConversations: need.activeConversations,
    sellerInitiation: true,
    allowDecline: true,
  }));

  // Handle Initiate button click
  const handleInitiateClick = (itineraryId) => {
    setSelectedItineraryId(itineraryId);
    fetchItinerary(itineraryId);
  };

  // Close itinerary handler
  const handleCloseItinerary = () => {
    setSelectedItineraryId(null);
  };

  const handleConnect = (data) => {
    setChatData(data);
  };

  const handleCloseChat = () => {
    setChatData(null);
  };

  // Show skeleton during initial load
  if (isFirstLoad || (loadingItinerary && !initialLoadComplete)) {
    return <SkeletonNeedCard />;
  }

  // Create route map data from itinerary
  const getRouteMapData = () => {
    if (!selectedItineraryId || !itineraries[selectedItineraryId] || !itineraries[selectedItineraryId].itinerary) {
      return null;
    }

    return {
      flights: itineraries[selectedItineraryId].itinerary.map(leg => ({
        from: leg.departurePlace,
        to: leg.arrivalPlace,
        fromCoordinates: {
          lat: parseFloat(leg.departureLatitude),
          long: parseFloat(leg.departureLongitude)
        },
        toCoordinates: {
          lat: parseFloat(leg.arrivalLatitude),
          long: parseFloat(leg.arrivalLongitude)
        },
        fromCity: leg.departurePlace,
        toCity: leg.arrivalPlace
      }))
    };
  };

  return (
    <div className="flex flex-col md:flex-row w-full -mt-4">
      {/* Left Side: Need List */}
      <div className="w-full md:w-1/2 p-4">
        <div className="flex items-center space-x-1 text-2xl font-bold pb-2 text-black">
          <span>Needs</span>
          <Info 
            size={25} 
            className={`text-gray-500  cursor-pointer ml-4 ${loadingInfo ? 'animate-pulse' : ''}`}
            onClick={handleInfoClick}
          />
        </div>
        {itineraryError && !selectedItineraryId ? (
          <div className="text-red-500 p-4 rounded-lg bg-red-50 border border-red-200">
            {itineraryError}
          </div>
        ) : displayNeeds.length === 0 && initialLoadComplete ? (
          <div className="text-gray-500 p-4 rounded-lg bg-gray-50 border border-gray-200">
            No needs are currently available for your company.
          </div>
        ) : (
          displayNeeds.map((need) => (
            <React.Fragment key={need.id}>
              {/* Ribbon Icon - Positioned outside and overlapping into card */}
              {need.buyerTag && (
                <div className="relative z-10 h-0">
                  <div className="absolute -right-1 -top-11">
                    <img src={RibbonIcon} alt="Ribbon Icon" className="w-22 h-28" />
                  </div>
                </div>
              )}
              <div
                className={`border border-black rounded-lg relative p-4 mb-4 overflow-hidden ${
                  selectedItineraryId === need.id
                   ? 'ring-2 ring-black bg-blue-50 shadow-lg transform scale-[1.02] transition-all'
                : 'bg-white'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-16">
                    <div className="text-xl font-semibold text-black">{need.buyerName}</div>
                    <div className="text-black mt-2 mb-4">{need.itineraryText}</div>

                    {need.activeConversations > 0 && (
                      <div className="text-red-600 mt-2">
                         <span>Talking to</span>{" "}
                           {`${need.activeConversations}`} 
                           <span> Others</span> 
                        </div>
                       )}

                  </div>
                  
                  {/* Initiate Button - moved to the right side but with margin to avoid overlap */}
                  <div className="flex flex-col items-center mr-12 mt-2 relative z-20">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 cursor-pointer"
                      onClick={() => handleInitiateClick(need.id)}
                    >
                      <MessageSquareDot size={24} className="text-black" />
                    </div>
                    <span className="text-xs text-black mt-1">Initiate</span>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))
        )}
      </div>

      {/* Right Side: Itinerary and Route Map Display - Updated with sticky positioning */}
      <div className="w-full md:w-1/2 p-4 mt-2 md:mt-8">
        {selectedItineraryId && (
          <div className="lg:sticky lg:top-6 space-y-4">
            {chatData ? (
              <NeedChat 
                chatData={chatData} 
                onClose={handleCloseChat}
              />
            ) : (
              <>
                {/* NeedItinerary Component */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <NeedItinerary
                    itinerary={itineraries[selectedItineraryId] || []}
                    loading={loadingItinerary}
                    error={itineraryError}
                    onClose={handleCloseItinerary}
                    selectedItineraryId={selectedItineraryId}
                    onConnect={handleConnect}
                  />
                </div>

                {/* RouteMap Component */}
                {itineraries[selectedItineraryId] && itineraries[selectedItineraryId].itinerary && (
                  <RouteMap
                    itineraryData={getRouteMapData()}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Info Modal */}
      {infoUrl && (
        <InfoModal
          url={infoUrl}
          onClose={() => setInfoUrl(null)}
        />
      )}
    </div>
  );
};

export default NeedCard;