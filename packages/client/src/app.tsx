import { useState, type ChangeEvent } from "react";
import { getCodeSandboxHost } from "@codesandbox/utils";
import hotel1 from "../../../assets/hotel1.jpg";

import {
  FaSearch,
  FaTimes,
  FaHotel,
  FaBuilding,
  FaGlobe,
  FaCity,
  FaMapMarkerAlt,
  FaFlag,
  FaRegWindowClose
} from "react-icons/fa";

type Hotel = {
  _id: string;
  chain_name: string;
  hotel_name: string;
  city: string;
  country: string;
};

type HotelDetails = {
  _id: string;
  chain_name: string;
  hotel_name: string;
  addressline1: string;
  city: string;
  state: string;
  country: string;
  star_rating: number;
  phone?: string;
  amenities?: string[];
};

const codeSandboxHost = getCodeSandboxHost(3001);
const API_URL = codeSandboxHost
  ? `https://${codeSandboxHost}`
  : "http://localhost:3001";

function App() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedHotel, setSelectedHotel] = useState<HotelDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const handleInput = async (event: ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.trim().toLowerCase();

    if (searchTerm === "") {
      setHotels([]);
      setCountries([]);
      setCities([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/hotels`);
      if (!response.ok) throw new Error("Failed to fetch hotels");

      const hotelsData = (await response.json()) as Hotel[];

      const matchedHotels = hotelsData.filter(
        (hotel) =>
          hotel.hotel_name.toLowerCase().includes(searchTerm) ||
          hotel.city.toLowerCase().includes(searchTerm) ||
          hotel.country.toLowerCase().includes(searchTerm)
      );

      const matchedCountries = [
        ...new Set(
          hotelsData
            .map((hotel) => hotel.country)
            .filter((country) => country.toLowerCase().includes(searchTerm))
        ),
      ] as string[];

      const matchedCities = [
        ...new Set(
          hotelsData
            .map((hotel) => hotel.city)
            .filter((city) => city.toLowerCase().includes(searchTerm))
        ),
      ] as string[];

      setHotels(matchedHotels);
      setCountries(matchedCountries);
      setCities(matchedCities);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      setHotels([]);
      setCountries([]);
      setCities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHotelClick = async (hotel: Hotel) => {
    try {
      setIsModalLoading(true);
      setIsModalOpen(true);

      const response = await fetch(`${API_URL}/hotels/${hotel._id}`);
      if (!response.ok) throw new Error("Failed to fetch hotel details");

      const data: HotelDetails = await response.json();
      setSelectedHotel(data);
    } catch (error) {
      console.error("Error fetching hotel details:", error);
      setSelectedHotel(null);
    } finally {
      setIsModalLoading(false);
    }
  };

  return (
    <div className="App" style={{ height: "100vh", backgroundColor: "#ffffff", display: "flex", overflow: "hidden" }}>
      <div className="container-fluid h-100">
        <div className="row h-100">
          {/* Left Side - Search Bar */}
          <div className="col-md-6 d-flex" style={{ alignItems: "flex-start", paddingTop: "10vh" }}>
            <div className="px-5 w-100" style={{ transform: "translateY(-20%)" }}>
              <h1 className="text-md mb-4">Search Hotels..</h1>
              <div className="position-relative">
                <div className="input-group shadow-lg" style={{ border: "2px solid red", borderRadius: "50px", overflow: "hidden" }}>
                  <span className="input-group-text bg-white border-0 ps-4">
                    <FaSearch className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-0 py-3 ps-0"
                    placeholder="Search hotels, countries, or cities..."
                    onChange={handleInput}
                    aria-label="Search accommodation"
                    style={{ boxShadow: "none" }}
                  />
                  {(hotels.length > 0 || countries.length > 0 || cities.length > 0) && (
                    <button
                      className="btn btn-link text-muted position-absolute end-0 top-50 translate-middle-y me-3"
                      onClick={() => {
                        setHotels([]);
                        setCountries([]);
                        setCities([]);
                      }}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>

                {isLoading ? (
                  <div className="dropdown-menu show w-100 p-3 mt-2">
                    <div className="text-center py-3">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  </div>
                ) : (hotels.length > 0 || countries.length > 0 || cities.length > 0) && (
                  <div className="dropdown-menu show w-100 p-4 shadow-lg mt-2" style={{ maxHeight: "500px", overflowY: "auto", border: "1px solid #ddd", borderRadius: "0.5rem", backgroundColor: "#fff", paddingBottom: "4rem" }}>
                    
                    {/*Hotels*/}
                    <div className="mb-4">
                      <h5 className="fw-bold text-primary mb-3"><FaHotel className="mb-1 me-2" /> Hotels</h5>
                      {hotels.length > 0 ? (
                        <ul className="list-unstyled">
                          {hotels.map((hotel) => (
                            <li key={hotel._id} className="mb-2">
                              <button
                                onClick={() => handleHotelClick(hotel)}
                                className="dropdown-item d-flex align-items-center py-2 px-3 rounded-3 w-100 text-start"
                                style={{ transition: "all 0.2s", backgroundColor: "#f8f9fa" }}
                              >
                                <FaBuilding className="text-muted mr-2" />
                                <div>
                                  <div className="fw-semibold">{hotel.hotel_name}</div>
                                  <small className="text-muted">{hotel.city}, {hotel.country}</small>
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-muted py-2">No hotels found</div>
                      )}
                    </div>

                    {/* Countries */}
                    <div className="mb-4 border-top pt-3">
                      <h5 className="fw-bold text-primary mb-3"><FaGlobe className="mb-1 me-2" /> Countries</h5>
                      {countries.length > 0 ? (
                        <ul className="list-unstyled">
                          {countries.map((country, index) => (
                            <li key={index} className="mb-2">
                              <div className="dropdown-item d-flex align-items-center py-2 px-3 rounded-3">
                                <FaFlag className="text-muted mr-2" />
                                <div className="fw-semibold">{country}</div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-muted py-2">No countries matched</div>
                      )}
                    </div>

                    {/* Cities */}
                    <div className="mb-4 border-top pt-3">
                      <h5 className="fw-bold text-primary mb-3"><FaCity className="mb-1 me-2" /> Cities</h5>
                      {cities.length > 0 ? (
                        <ul className="list-unstyled">
                          {cities.map((city, index) => (
                            <li key={index} className="mb-2">
                              <div className="dropdown-item d-flex align-items-center py-2 px-3 rounded-3">
                                <FaMapMarkerAlt className="text-muted mr-2" />
                                <div className="fw-semibold">{city}</div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-muted py-2">No cities matched</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="col-md-6 d-none d-md-block p-0 h-100">
            <div style={{
              height: "100%",
              backgroundImage: `url(${hotel1})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat"
            }}></div>
          </div>
        </div>
      </div>

      {/* Hotel Details Modal */}
      {isModalOpen && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal d-block" tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content  bg-white shadow-lg">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <FaHotel className="mr-2" />
                    {isModalLoading ? "Loading..." : selectedHotel?.hotel_name}
                  </h5>
                  <FaRegWindowClose
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedHotel(null);
                    }}
                    aria-label="Close"
                  />
                </div>
                <div className="modal-body">
                  {isModalLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : selectedHotel ? (
                    <>
                      <p><strong>Chain:</strong> {selectedHotel.chain_name}</p>
                      <p><strong>Address:</strong> {selectedHotel.addressline1}</p>
                      <p><strong>City:</strong> {selectedHotel.city}</p>
                      <p><strong>State:</strong> {selectedHotel.state}</p>
                      <p><strong>Country:</strong> {selectedHotel.country}</p>
                      <p><strong>Star Rating:</strong> {selectedHotel.star_rating}⭐</p>
                      {selectedHotel.phone && <p><strong>Phone:</strong> {selectedHotel.phone}</p>}
                      {selectedHotel.amenities?.length && (
                        <p><strong>Amenities:</strong> {selectedHotel.amenities.join(", ")}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-danger">Failed to load hotel details.</p>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedHotel(null);
                  }}>
                  
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
