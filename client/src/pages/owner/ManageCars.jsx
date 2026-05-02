// import React, { useEffect, useState } from 'react'
// import { assets } from '../../assets/assets'
// import Title from '../../components/owner/Title'
// import { useAppContext } from '../../context/AppContext'
// import toast from 'react-hot-toast'

// const ManageCars = () => {

//   const { BASE_URL, isOwner, axios, currency,fetchCars } = useAppContext()

//   const [cars, setCars] = useState([])

//   const fetchOwnerCars = async () => {
//     try {
//       const { data } = await axios.get('/api/owner/cars')
//       if (data.success) {
//         setCars(data.cars)
//       } else {
//         toast.error(data.message)
//       }
//     } catch (error) {
//       toast.error(error.message)
//     }
//   }

//   const toggleAvailability = async (carId) => {
//     try {
//       const { data } = await axios.post('/api/owner/toggle-car', { carId })
//       if (data.success) {
//         toast.success(data.message)
//         fetchOwnerCars()   // owner dashboard
//          fetchCars()        // 🔥 GLOBAL CARS UPDATE (THIS FIXES YOUR ISSUE)

//       } else {
//         toast.error(data.message)
//       }
//     } catch (error) {
//       toast.error(error.message)
//     }
//   }

//   const deleteCar = async (carId) => {
//     try {
//       const confirmDelete = window.confirm('Are you sure you want to remove this listing?')
//       if (!confirmDelete) return

//       const { data } = await axios.post('/api/owner/delete-car', { carId })
//       if (data.success) {
//         toast.success(data.message)
//         fetchOwnerCars()
//       } else {
//         toast.error(data.message)
//       }
//     } catch (error) {
//       toast.error(error.message)
//     }
//   }

//   useEffect(() => {
//     if (isOwner) fetchOwnerCars()
//   }, [isOwner])

//   return (
//     <div className='px-4 pt-10 md:px-10 w-full'>

//       <Title
//         title="Manage Listings"
//         subTitle="View your cars for sale, update visibility, or remove listings from the marketplace."
//       />

//       <div className='max-w-3xl w-full rounded-md overflow-hidden border border-borderColor mt-6'>

//         <table className='w-full border-collapse text-left text-sm text-gray-600'>
//           <thead className='text-gray-500'>
//             <tr>
//               <th className="p-3 font-medium">Car</th>
//               <th className="p-3 font-medium max-md:hidden">Category</th>
//               <th className="p-3 font-medium">Price</th>
//               <th className="p-3 font-medium max-md:hidden">Status</th>
//               <th className="p-3 font-medium">Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {cars.map((car, index) => (
//               <tr key={index} className='border-t border-borderColor'>

//                 <td className='p-3 flex items-center gap-3'>
//                   <img
//                     src={`${BASE_URL}${car.image}`}
//                     alt="car"
//                     className="h-12 w-12 object-cover rounded"
//                   />

//                   <div className='max-md:hidden'>
//                     <p className='font-medium'>{car.brand} {car.model}</p>
//                     <p className='text-xs text-gray-500'>
//                       {car.seating_capacity} seats - {car.transmission}
//                     </p>
//                   </div>
//                 </td>

//                 <td className='p-3 max-md:hidden'>{car.category}</td>

//                 <td className='p-3'>
//                   {currency}{Number(car.price || 0).toLocaleString()}
//                 </td>

//                 <td className='p-3 max-md:hidden'>
//                   <span className={`px-3 py-1 rounded-full text-xs ${
//                     car.isAvailable
//                       ? 'bg-green-100 text-green-500'
//                       : 'bg-red-100 text-red-500'
//                   }`}>
//                     {car.isAvailable ? "Listed" : "Hidden"}
//                   </span>
//                 </td>

//                 <td className='flex items-center p-3 gap-2'>
//                   <img
//                     onClick={() => toggleAvailability(car._id)}
//                     src={car.isAvailable ? assets.eye_close_icon : assets.eye_icon}
//                     alt=""
//                     className='cursor-pointer'
//                   />

//                   <img
//                     onClick={() => deleteCar(car._id)}
//                     src={assets.delete_icon}
//                     alt=""
//                     className='cursor-pointer'
//                   />
//                 </td>

//               </tr>
//             ))}
//           </tbody>
//         </table>

//       </div>
//     </div>
//   )
// }

// export default ManageCars
import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const ManageCars = () => {

  const { BASE_URL, isOwner, axios, fetchCars } = useAppContext()
  const currency = import.meta.env.VITE_CURRENCY || "$"

  const [cars, setCars] = useState([])

  const fetchOwnerCars = async () => {
    try {
      const { data } = await axios.get('/api/owner/cars')
      if (data.success) {
        setCars(data.cars)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // 🔥 FIXED: Instant UI update
  const toggleAvailability = async (carId) => {
    try {

      // ✅ Update UI instantly (optimistic update)
      setCars((prevCars) =>
        prevCars.map((car) =>
          car._id === carId
            ? { ...car, isAvailable: !car.isAvailable }
            : car
        )
      )

      const { data } = await axios.post('/api/owner/toggle-car', { carId })

      if (data.success) {
        toast.success(data.message)
        fetchCars() // update global cars
      } else {
        toast.error(data.message)
        fetchOwnerCars() // rollback if failed
      }

    } catch (error) {
      toast.error(error.message)
      fetchOwnerCars() // rollback
    }
  }

  // 🔥 FIXED: Instant delete UI
  const deleteCar = async (carId) => {
    try {
      const confirmDelete = window.confirm('Are you sure you want to remove this listing?')
      if (!confirmDelete) return

      // ✅ Remove instantly from UI
      setCars((prev) => prev.filter(car => car._id !== carId))

      const { data } = await axios.post('/api/owner/delete-car', { carId })

      if (data.success) {
        toast.success(data.message)
        fetchCars()
      } else {
        toast.error(data.message)
        fetchOwnerCars() // rollback
      }

    } catch (error) {
      toast.error(error.message)
      fetchOwnerCars()
    }
  }

  useEffect(() => {
    if (isOwner) fetchOwnerCars()
  }, [isOwner])

  return (
    <div className='px-4 pt-10 md:px-10 w-full'>

      <Title
        title="Manage Listings"
        subTitle="View your cars for sale, update visibility, or remove listings from the marketplace."
      />

      <div className='max-w-3xl w-full rounded-md overflow-hidden border border-borderColor mt-6'>

        <table className='w-full border-collapse text-left text-sm text-gray-600'>
          <thead className='text-gray-500'>
            <tr>
              <th className="p-3 font-medium">Car</th>
              <th className="p-3 font-medium max-md:hidden">Category</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium max-md:hidden">Status</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {cars.map((car, index) => (
              <tr key={index} className='border-t border-borderColor'>

                <td className='p-3 flex items-center gap-3'>
                  <img
                    src={
                      car.image?.startsWith('http')
                        ? car.image
                        : `${BASE_URL}${car.image}`
                    }
                    alt="car"
                    className="h-12 w-12 object-cover rounded"
                  />

                  <div className='max-md:hidden'>
                    <p className='font-medium'>{car.brand} {car.model}</p>
                    <p className='text-xs text-gray-500'>
                      {car.seating_capacity} seats - {car.transmission}
                    </p>
                  </div>
                </td>

                <td className='p-3 max-md:hidden'>{car.category}</td>

                <td className='p-3'>
                  {currency}{Number(car.price || 0).toLocaleString()}
                </td>

                <td className='p-3 max-md:hidden'>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    car.isAvailable
                      ? 'bg-green-100 text-green-500'
                      : 'bg-red-100 text-red-500'
                  }`}>
                    {car.isAvailable ? "Listed" : "Hidden"}
                  </span>
                </td>

                <td className='flex items-center p-3 gap-2'>
                  <img
                    onClick={() => toggleAvailability(car._id)}
                    src={car.isAvailable ? assets.eye_close_icon : assets.eye_icon}
                    alt=""
                    className='cursor-pointer'
                  />

                  <img
                    onClick={() => deleteCar(car._id)}
                    src={assets.delete_icon}
                    alt=""
                    className='cursor-pointer'
                  />
                </td>

              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  )
}

export default ManageCars
