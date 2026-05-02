import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import Loader from '../components/Loader'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'motion/react'

const CarDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { cars, axios, user, setShowLogin } = useAppContext()

  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(false)
  const [estimatedPrice, setEstimatedPrice] = useState(null)
  const [estimatedLoading, setEstimatedLoading] = useState(false)

  const currency = import.meta.env.VITE_CURRENCY || "$"
  const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"

  // ✅ GET CAR
  useEffect(() => {
    const foundCar = cars.find(c => c._id === id)
    console.log("Car ID:", id)
    console.log("Found car:", foundCar)
    console.log("isAvailable:", foundCar?.isAvailable, "type:", typeof foundCar?.isAvailable)
    setCar(foundCar || null)
  }, [cars, id])

  // ✅ GET ML ESTIMATED PRICE
  useEffect(() => {
    if (!car) return

    const fetchEstimatedPrice = async () => {
      setEstimatedLoading(true)
      try {
        const { data } = await axios.post('/api/user/predict-price', {
          manufacturer: car.brand,
          model: car.model,
          year: car.year,
          mileage: car.mileage,
          condition: car.condition,
          cylinders: car.cylinders,
          fuel: car.fuel_type,
          title_status: car.title_status,
          transmission: car.transmission,
          type: car.category,
          paint_color: car.paint_color,
          state: car.location
        })

        if (data.success && data.predictedPrice) {
          setEstimatedPrice(data.predictedPrice)
        }
      } catch (error) {
        console.log("ML price prediction failed:", error.message)
      } finally {
        setEstimatedLoading(false)
      }
    }

    fetchEstimatedPrice()
  }, [car, axios])

  // ✅ BUY NOW FUNCTION (PRODUCTION SAFE)
  const handleBuyNow = async () => {
    try {
      if (!user) {
        setShowLogin(true)
        toast.error("Please login to continue")
        return
      }

      if (loading) return
      setLoading(true)

      const { data } = await axios.post('/api/payment/create-checkout-session', {
        carId: id
      })

      if (data.success) {
        window.location.href = data.url
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.response?.data?.message || "Payment failed")
    } finally {
      setLoading(false)
    }
  }

  // ✅ LOADER
  if (!car) return <Loader />

  const listingPrice = car.price || 0

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-16'>

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className='flex items-center gap-2 mb-6 text-gray-500 cursor-pointer'
      >
        <img src={assets.arrow_icon} alt="" className='rotate-180 opacity-65' />
        Back to all cars
      </button>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>

        {/* LEFT SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='lg:col-span-2'
        >

          <motion.img
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            src={
              car.image?.startsWith("http")
                ? car.image
                : `${BASE_URL}${car.image}`
            }
            alt="car"
            className='w-full h-auto md:max-h-100 object-cover rounded-lg mb-6 shadow-md'
          />

          <motion.div
            className='space-y-6'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >

            {/* TITLE */}
            <div>
              <h1 className='text-3xl font-bold'>
                {car.brand} {car.model}
              </h1>
              <p className='text-gray-500 text-lg'>
                {car.category} - {car.year} - {car.condition || 'Good condition'}
              </p>
            </div>

            <hr className='border-borderColor my-6' />

            {/* FEATURES */}
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
              {[
                { icon: assets.users_icon, text: `${car.seating_capacity} Seats` },
                { icon: assets.fuel_icon, text: car.fuel_type },
                {
                  icon: assets.car_icon,
                  text: car.mileage
                    ? `${Number(car.mileage).toLocaleString()} km`
                    : car.transmission
                },
                { icon: assets.location_icon, text: car.location },
              ].map(({ icon, text }) => (
                <div key={text} className='flex flex-col items-center bg-light p-4 rounded-lg text-center'>
                  <img src={icon} alt="" className='h-5 mb-2' />
                  {text}
                </div>
              ))}
            </div>

            {/* DESCRIPTION */}
            <div>
              <h1 className='text-xl font-medium mb-3'>Description</h1>
              <p className='text-gray-500'>{car.description}</p>
            </div>

            {/* DETAILS */}
            <div>
              <h1 className='text-xl font-medium mb-3'>Listing Details</h1>
              <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                {[
                  `Transmission: ${car.transmission}`,
                  `Title: ${car.title_status || 'Clean'}`,
                  `Color: ${car.paint_color || 'Not specified'}`,
                  `Cylinders: ${car.cylinders || 'Not specified'}`,
                ].map((item) => (
                  <li key={item} className='flex items-center text-gray-500'>
                    <img src={assets.check_icon} className='h-4 mr-2' alt="" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </motion.div>
        </motion.div>

        {/* RIGHT SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className='shadow-lg h-max sticky top-18 rounded-lg p-6 space-y-6 text-gray-500'
        >

          {/* PRICE */}
          <div className="space-y-2">
            {estimatedLoading ? (
              <p className="text-sm text-gray-400">Loading estimated price...</p>
            ) : estimatedPrice ? (
              <div className="space-y-1">
                <p className="text-sm text-gray-500">ML Estimated: {currency} {Number(estimatedPrice).toLocaleString()}</p>
                <p className="flex items-center justify-between text-2xl text-gray-800 font-semibold">
                  {currency} {Number(listingPrice).toLocaleString()}
                  <span className='text-base text-gray-400 font-normal'>listing price</span>
                </p>
              </div>
            ) : (
              <p className="flex items-center justify-between text-2xl text-gray-800 font-semibold">
                {currency} {Number(listingPrice).toLocaleString()}
                <span className='text-base text-gray-400 font-normal'>price</span>
              </p>
            )}
          </div>

          <hr className='border-borderColor my-6' />

          {/* BUY BUTTON */}
          {/* {car.isAvailable ? (
            <button
              onClick={handleBuyNow}
              disabled={loading}
              className={`w-full py-3 font-medium text-white rounded-lg ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-dull'
              }`}
            >
              {loading ? "Processing..." : "Buy Now"}
            </button>
          ) : (
            <button
              disabled
              className='w-full bg-gray-400 py-3 text-white rounded-lg cursor-not-allowed'
            >
              Sold Out
            </button>
          )} */}
          {!car.isSold && car.isAvailable ? (
  <button
    onClick={handleBuyNow}
    disabled={loading}
    className={`w-full py-3 font-medium text-white rounded-lg ${
      loading
        ? 'bg-gray-400 cursor-not-allowed'
        : 'bg-primary hover:bg-primary-dull'
    }`}
  >
    {loading ? "Processing..." : "Buy Now"}
  </button>
) : (
  <button
    disabled
    className='w-full bg-gray-400 py-3 text-white rounded-lg cursor-not-allowed'
  >
    Sold Out
  </button>
)}
          <p className='text-center text-sm'>
            Secure payment powered by Stripe
          </p>

        </motion.div>

      </div>
    </div>
  )
}

export default CarDetails