import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext();

// Initial state
const initialState = {
  products: [
    {
      id: 1,
      name: "Diamond Eternity Ring",
      category: "Rings",
      price: 1299,
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
      description: "Exquisite diamond eternity ring crafted with precision and elegance.",
      inStock: true,
      featured: true
    },
    {
      id: 2,
      name: "Gold Chain Necklace",
      category: "Necklaces",
      price: 899,
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
      description: "Luxurious 18k gold chain necklace perfect for any occasion.",
      inStock: true,
      featured: true
    },
    {
      id: 3,
      name: "Pearl Stud Earrings",
      category: "Earrings",
      price: 299,
      image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
      description: "Classic pearl stud earrings with sterling silver backing.",
      inStock: true,
      featured: true
    },
    {
      id: 4,
      name: "Silver Tennis Bracelet",
      category: "Bracelets",
      price: 599,
      image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80",
      description: "Elegant silver tennis bracelet with cubic zirconia stones.",
      inStock: true,
      featured: false
    },
    {
      id: 5,
      name: "Vintage Sapphire Ring",
      category: "Rings",
      price: 1899,
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
      description: "Vintage-inspired sapphire ring with intricate detailing.",
      inStock: true,
      featured: false
    },
    {
      id: 6,
      name: "Rose Gold Pendant",
      category: "Necklaces",
      price: 449,
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
      description: "Delicate rose gold pendant with heart-shaped design.",
      inStock: false,
      featured: false
    }
  ],
  cart: [],
  user: null,
  loading: false,
  error: null
};

// Action types
const actionTypes = {
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_CART_QUANTITY: 'UPDATE_CART_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  ADD_PRODUCT: 'ADD_PRODUCT',
  UPDATE_PRODUCT: 'UPDATE_PRODUCT',
  DELETE_PRODUCT: 'DELETE_PRODUCT',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_USER: 'SET_USER'
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.ADD_TO_CART:
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        cart: [...state.cart, { ...action.payload, quantity: 1 }]
      };

    case actionTypes.REMOVE_FROM_CART:
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload)
      };

    case actionTypes.UPDATE_CART_QUANTITY:
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };

    case actionTypes.CLEAR_CART:
      return {
        ...state,
        cart: []
      };

    case actionTypes.ADD_PRODUCT:
      return {
        ...state,
        products: [...state.products, { ...action.payload, id: Date.now() }]
      };

    case actionTypes.UPDATE_PRODUCT:
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.id ? action.payload : product
        )
      };

    case actionTypes.DELETE_PRODUCT:
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload)
      };

    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };

    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.payload
      };

    default:
      return state;
  }
};

// Context Provider
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('gravity-cart');
    if (savedCart) {
      const cartItems = JSON.parse(savedCart);
      cartItems.forEach(item => {
        dispatch({ type: actionTypes.ADD_TO_CART, payload: item });
      });
    }
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('gravity-cart', JSON.stringify(state.cart));
  }, [state.cart]);

  // Actions
  const addToCart = (product) => {
    dispatch({ type: actionTypes.ADD_TO_CART, payload: product });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: actionTypes.REMOVE_FROM_CART, payload: productId });
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      dispatch({ type: actionTypes.UPDATE_CART_QUANTITY, payload: { id: productId, quantity } });
    }
  };

  const clearCart = () => {
    dispatch({ type: actionTypes.CLEAR_CART });
  };

  const addProduct = (product) => {
    dispatch({ type: actionTypes.ADD_PRODUCT, payload: product });
  };

  const updateProduct = (product) => {
    dispatch({ type: actionTypes.UPDATE_PRODUCT, payload: product });
  };

  const deleteProduct = (productId) => {
    dispatch({ type: actionTypes.DELETE_PRODUCT, payload: productId });
  };

  const setLoading = (loading) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: actionTypes.SET_ERROR, payload: error });
  };

  const setUser = (user) => {
    dispatch({ type: actionTypes.SET_USER, payload: user });
  };

  const getCartTotal = () => {
    return state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return state.cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getFeaturedProducts = () => {
    return state.products.filter(product => product.featured && product.inStock);
  };

  const getProductsByCategory = (category) => {
    return state.products.filter(product => product.category === category && product.inStock);
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    addProduct,
    updateProduct,
    deleteProduct,
    setLoading,
    setError,
    setUser,
    getCartTotal,
    getCartItemCount,
    getFeaturedProducts,
    getProductsByCategory
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
