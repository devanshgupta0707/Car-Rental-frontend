import { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from "react-router-dom";

// Ensure BASE_URL is defined
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const currency = import.meta.env.VITE_CURRENCY;

  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [cars, setCars] = useState([]);

  // Fetch user info
  const fetchUser = async () => {
    try {
      const { data } = await axios.get('/api/user/data');
      console.log("User fetched:", data);
      if (data.success) {
        setUser(data.user);
        setIsOwner(data.user.role === 'owner');
      } else {
        toast.error(data.message || 'Failed to fetch user');
        navigate('/');
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error(error.message);
    }
  };

  // Fetch cars
  const fetchCars = async () => {
    try {
      const { data } = await axios.get('/api/user/cars');
      console.log("Fetched Cars:", data);
      if (data.success) {
        setCars(data.cars);
      } else {
        toast.error(data.message || 'Failed to fetch cars');
      }
    } catch (error) {
      console.error("Fetch Cars Error:", error);
      toast.error(error.message);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsOwner(false);
    axios.defaults.headers.common['Authorization'] = '';
    toast.success('You have been logged out');
  };

  // Get token from localStorage on first load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    console.log("Stored Token:", storedToken);
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Fetch user and cars only when token is available
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `${token}`;
      fetchUser();
      fetchCars();
    }
  }, [token]);

  const value = {
    navigate,
    currency,
    axios,
    user,
    setUser,
    token,
    setToken,
    isOwner,
    setIsOwner,
    fetchUser,
    showLogin,
    setShowLogin,
    logout,
    fetchCars,
    cars,
    setCars,
    pickupDate,
    setPickupDate,
    returnDate,
    setReturnDate,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
