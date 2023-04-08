import './app.css';
import caution from '../src/img/cricketaddictor.png';
import ReactMapGL, { Marker, Popup, GeolocateControl } from 'react-map-gl';
import { useEffect, useState } from 'react';
import { Room, Star, StarBorder } from '@material-ui/icons';

import axios from 'axios';
import { format } from 'timeago.js';
import Register from './components/Register';
import Login from './components/Login';

function App() {
    const myStorage = window.localStorage;
    const [currentUsername, setCurrentUsername] = useState(
        myStorage.getItem('user')
    );
    const [pins, setPins] = useState([]);
    const [currentPlaceId, setCurrentPlaceId] = useState(null);
    const [newPlace, setNewPlace] = useState(null);
    const [title, setTitle] = useState(null);
    const [desc, setDesc] = useState(null);
    const [star, setStar] = useState(0);
    const [viewport1, setViewport1] = useState({});
    const [viewport, setViewport] = useState({
        latitude: 47.040182,
        longitude: 17.071727,
        zoom: 4,
    });
    const [showRegister, setShowRegister] = useState(false);
    const [showLogin, setShowLogin] = useState(false);

    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1); // deg2rad below
        var dLon = deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) *
                Math.cos(deg2rad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    const handleMarkerClick = (id, lat, long) => {
        setCurrentPlaceId(id);
        setViewport({ ...viewport, latitude: lat, longitude: long });
    };

    const handleAddClick = (e) => {
        const [long, lat] = e.lngLat;
        var dist = getDistanceFromLatLonInKm(
            long,
            lat,
            viewport1.longitude,
            viewport1.latitude
        );
        console.log(dist);
        if (dist <= 2) {
            setNewPlace({
                lat,
                long,
            });
        } else {
            alert("You can't tweet out of your range!");
            setNewPlace(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newPin = {
            username: currentUsername,
            title,
            desc,
            rating: star,
            lat: newPlace.lat,
            long: newPlace.long,
        };

        try {
            const res = await axios.post('/pins', newPin);
            setPins([...pins, res.data]);
            setNewPlace(null);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        const getPins = async () => {
            try {
                const allPins = await axios.get('/pins');
                setPins(allPins.data);
            } catch (err) {
                console.log(err);
            }
        };
        getPins();
    }, []);

    const handleLogout = () => {
        setCurrentUsername(null);
        myStorage.removeItem('user');
    };

    navigator.geolocation.getCurrentPosition((pos) => {
        setViewport1({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
        });
        setViewport({
            ...viewport,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            zoom: 15,
        });
    });

    navigator.geolocation.getCurrentPosition((pos) => {
        setViewport1({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
        });
        setViewport({
            ...viewport,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            zoom: 15,
        });
    });

    return (
        <div className="parent" style={{ height: '100vh', width: '100%' }}>
            <div className="find-location">
                <img src={caution} style={{ width: '20px' }} />
                <p>Please press this button for accurate position.</p>
            </div>
            <ReactMapGL
                {...viewport}
                mapboxApiAccessToken="pk.eyJ1IjoiYXl1c2gtMTMzNyIsImEiOiJjbGc2eGdreTYwMHllM3VtY3M3d3ZoN2JlIn0.sBPWse3g5A047ZmXJ_a1sg"
                width="100%"
                height="100%"
                transitionDuration="200"
                mapStyle="mapbox://styles/mapbox/streets-v12"
                onViewportChange={(viewport) => setViewport(viewport)}
                onDblClick={currentUsername && handleAddClick}
            >
                <GeolocateControl
                    positionOptions={{ enableHighAccuracy: true }}
                    trackUserLocation={true}
                    showUserHeading={true}
                />

                {pins.map((p) => (
                    <>
                        <Marker
                            latitude={p.lat}
                            longitude={p.long}
                            offsetLeft={-3.5 * viewport.zoom}
                            offsetTop={-7 * viewport.zoom}
                        >
                            <Room
                                style={{
                                    fontSize: 7 * viewport.zoom,
                                    color:
                                        currentUsername === p.username
                                            ? 'tomato'
                                            : 'slateblue',
                                    cursor: 'pointer',
                                }}
                                onClick={() =>
                                    handleMarkerClick(p._id, p.lat, p.long)
                                }
                            />
                        </Marker>
                        {p._id === currentPlaceId && (
                            <Popup
                                key={p._id}
                                latitude={p.lat}
                                longitude={p.long}
                                closeButton={true}
                                closeOnClick={false}
                                onClose={() => setCurrentPlaceId(null)}
                                anchor="left"
                            >
                                <div className="card">
                                    <label>Place</label>
                                    <h4 className="place">{p.title}</h4>
                                    <label>Review</label>
                                    <p className="desc">{p.desc}</p>
                                    <label>Rating</label>
                                    <div className="stars">
                                        {Array(p.rating).fill(
                                            <Star className="star" />
                                        )}
                                    </div>
                                    <label>Information</label>
                                    <span className="username">
                                        Created by <b>{p.username}</b>
                                    </span>
                                    <span className="date">
                                        {format(p.createdAt)}
                                    </span>
                                </div>
                            </Popup>
                        )}
                    </>
                ))}
                {newPlace && (
                    <>
                        <Marker
                            latitude={newPlace.lat}
                            longitude={newPlace.long}
                            offsetLeft={-3.5 * viewport.zoom}
                            offsetTop={-7 * viewport.zoom}
                        >
                            <Room
                                style={{
                                    fontSize: 7 * viewport.zoom,
                                    color: 'tomato',
                                    cursor: 'pointer',
                                }}
                            />
                        </Marker>
                        <Popup
                            latitude={newPlace.lat}
                            longitude={newPlace.long}
                            closeButton={true}
                            closeOnClick={false}
                            onClose={() => setNewPlace(null)}
                            anchor="left"
                        >
                            <div>
                                <form onSubmit={handleSubmit}>
                                    <label>Title</label>
                                    <input
                                        placeholder="Enter a title"
                                        autoFocus
                                        onChange={(e) =>
                                            setTitle(e.target.value)
                                        }
                                    />
                                    <label>Description</label>
                                    <textarea
                                        placeholder="Say us something about this place."
                                        onChange={(e) =>
                                            setDesc(e.target.value)
                                        }
                                    />
                                    <label>Rating</label>
                                    <select
                                        onChange={(e) =>
                                            setStar(e.target.value)
                                        }
                                    >
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                    <button
                                        type="submit"
                                        className="submitButton"
                                    >
                                        Add Pin
                                    </button>
                                </form>
                            </div>
                        </Popup>
                    </>
                )}
                {currentUsername ? (
                    <button className="button logout" onClick={handleLogout}>
                        Log out
                    </button>
                ) : (
                    <div className="buttons">
                        <button
                            className="button login"
                            onClick={() => setShowLogin(true)}
                        >
                            Log in
                        </button>
                        <button
                            className="button register"
                            onClick={() => setShowRegister(true)}
                        >
                            Register
                        </button>
                    </div>
                )}
                {showRegister && <Register setShowRegister={setShowRegister} />}
                {showLogin && (
                    <Login
                        setShowLogin={setShowLogin}
                        setCurrentUsername={setCurrentUsername}
                        myStorage={myStorage}
                    />
                )}
            </ReactMapGL>
        </div>
    );
}

export default App;
