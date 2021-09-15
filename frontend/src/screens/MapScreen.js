import React, { useEffect, useRef, useState } from 'react'; //https://www.npmjs.com/package/@react-google-maps/api
import { LoadScript, GoogleMap, StandaloneSearchBox, Marker } from '@react-google-maps/api';
import LoadingBox from '../components/LoadingBox';
import axios from 'axios';
import { USER_ADDRESS_MAP_CONFIRM } from '../constants/userConstants';
import { useDispatch } from 'react-redux';

const libs = ['places'];
const defaultLocation = { lat: -34.921230, lng: 138.599503 };
//enable Billing on the Google Cloud Project at https://console.cloud.google.com/project/_/billing/enable
function MapScreen(props) {
    const [googleApiKey, setGoogleApiKey] = useState('');
    const [center, setCenter] = useState(defaultLocation);
    const [location, setLocation] = useState(center);
    const mapRef = useRef(null);
    const placeRef = useRef(null);
    const markerRef = useRef(null);
    useEffect(() => {
        const fetch = async () => {
            const { data } = await axios('/api/config/google');
            setGoogleApiKey(data);
            getUserCurrentLocation();
        };
        fetch();
    }, []);
    const onLoad = map => {
        mapRef.current = map;
    };
    const onMarkerLoad = marker => {
        markerRef.current = marker;
    };
    const onLoadPlaces = place => {
        placeRef.current = place;
    };
    const onIdle = () => {
        setLocation({lat: mapRef.current.center.lat(), lng: mapRef.current.center.lng()});
    };
    const onPlacesChanged = () => {
        const place = placeRef.current.getPlaces()[0].geometry.location;
        setCenter({ lat: place.lat(), lng: place.lng() });
        setLocation({ lat: place.lat(), lng: place.lng() });
    };
    const dispatch = useDispatch();
    const onConfirm = () => {
        const places = placeRef.current.getPlaces();
        if (places && places.length === 1) {
            dispatch({ // dispatch select action
                type: USER_ADDRESS_MAP_CONFIRM,
                payload: {
                    lat: location.lat,
                    lng: location.lng,
                    address: places[0].formatted_address,
                    name: places[0].name,
                    vicinity: places[0].vicinity,
                    googleAddressId: places[0].id
                },
            });
            alert('Successfully Selected Location');
            props.history.push('/shipping');
        } else {
            alert('Please enter your address');
        }
    };
    const getUserCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by this browser');
        } else { //get current location and auto set position
            navigator.geolocation.getCurrentPosition(position => {
                setCenter({lat: position.coords.latitude, lng: position.coords.longitude});
                setLocation({lat: position.coords.latitude, lng: position.coords.longitude});
            });
        }
    };
    return googleApiKey ? (
        <div className="full-container">
            <LoadScript libraries={libs} googleMapsApiKey={googleApiKey}>
                <GoogleMap
                    id="smaple-map"
                    mapContainerStyle={{ height: '100%', width: '100%' }}
                    center={center}
                    zoom={15}
                    onLoad={onLoad}
                    onIdle={onIdle}
                >
                    <StandaloneSearchBox onLoad={onLoadPlaces} onPlacesChanged={onPlacesChanged}>
                        <div className="map-input-box">
                            <input type="text" placeholder="Enter your address" />
                            <button type="button" className="primary" onClick={onConfirm}>Confirm</button>
                        </div>
                    </StandaloneSearchBox>
                    <Marker position={location} onLoad={onMarkerLoad} />
                </GoogleMap>
            </LoadScript>
        </div>
    ) : (
        <LoadingBox />
    );
}

export default MapScreen;
