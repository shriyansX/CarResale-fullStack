import React, { useState } from 'react'
import Title from '../../components/owner/Title'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const conditionOptions = ['new', 'excellent', 'good', 'fair', 'salvage']

const titleOptions = ['clean', 'lien', 'rebuilt', 'salvage', 'parts only', 'missing']

const colorOptions = ['black', 'white', 'silver', 'blue', 'red', 'gray', 'green', 'brown', 'custom']

const cylinderOptions = [
  '3 cylinders',
  '4 cylinders',
  '5 cylinders',
  '6 cylinders',
  '8 cylinders',
  '10 cylinders',
  '12 cylinders'
]

// const fallbackEstimateResalePrice = (car)=>{
//   const age = Math.max(new Date().getFullYear() - Number(car.year || new Date().getFullYear()), 0)
//   const mileage = Number(car.mileage || 0)
//   const categoryBase = {
//     Sedan: 14500,
//     SUV: 22000,
//     Van: 17500,
//     Hatchback: 11500,
//     Truck: 24000,
//   }
//   const conditionFactor = {
//     New: 1.18,
//     'Like New': 1.08,
//     Excellent: 1,
//     Good: 0.9,
//     Fair: 0.72,
//     Salvage: 0.45,
//   }
//   const fuelFactor = {
//     Electric: 1.08,
//     Hybrid: 1.04,
//     Diesel: 0.96,
//     Petrol: 1,
//     Gas: 0.98,
//   }
//   const transmissionFactor = car.transmission === 'Automatic' ? 1.03 : 1
//   const base = categoryBase[car.category] || 15000
//   const ageFactor = Math.max(0.32, 1 - age * 0.055)
//   const mileageFactor = Math.max(0.58, 1 - mileage / 400000)

//   return Math.round(base * ageFactor * mileageFactor * (conditionFactor[car.condition] || 0.9) * (fuelFactor[car.fuel_type] || 1) * transmissionFactor)
// }
const fallbackEstimateResalePrice = (car) => {
  const age = Math.max(
    new Date().getFullYear() - Number(car.year || new Date().getFullYear()),
    0
  )

  const mileage = Number(car.mileage || 0)

  const categoryBase = {
    sedan: 14500,
    suv: 22000,
    van: 17500,
    hatchback: 11500,
    truck: 24000,
  }

  const conditionFactor = {
    new: 1.18,
    excellent: 1,
    good: 0.9,
    fair: 0.72,
    salvage: 0.45,
  }

  const fuelFactor = {
    gas: 1,
    diesel: 0.96,
    hybrid: 1.04,
    electric: 1.08,
  }

  const transmissionFactor =
    car.transmission === "automatic" ? 1.03 : 1

  const base = categoryBase[car.category] || 15000
  const ageFactor = Math.max(0.32, 1 - age * 0.055)
  const mileageFactor = Math.max(0.58, 1 - mileage / 400000)

  return Math.round(
    base *
      ageFactor *
      mileageFactor *
      (conditionFactor[car.condition] || 0.9) *
      (fuelFactor[car.fuel_type] || 1) *
      transmissionFactor
  )
}

const AddCar = () => {

  const {axios} = useAppContext()
  const currency = import.meta.env.VITE_CURRENCY || "$"

  const [image, setImage] = useState(null)
  const [isEstimating, setIsEstimating] = useState(false)
  const [car, setCar] = useState({
  brand: '',
  model: '',
  year: '',
  price: '',
  category: '',
  transmission: 'automatic',
  fuel_type: 'gas',
  seating_capacity: '',
  mileage: '',
  condition: 'good',
  title_status: 'clean',
  cylinders: '',
  paint_color: '',
  location: '',
  description: '',
})

  const [isLoading, setIsLoading] = useState(false)
  const onSubmitHandler = async (e)=>{
    e.preventDefault()
    if(isLoading) return null

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', image)
      formData.append('carData', JSON.stringify(car))

      const {data} = await axios.post('/api/owner/add-car', formData)

      if(data.success){
        toast.success(data.message)
        setImage(null)
        setCar({
  brand: '',
  model: '',
  year: '',
  price: '',
  category: '',
  transmission: 'automatic',
  fuel_type: 'gas',
  seating_capacity: '',
  mileage: '',
  condition: 'good',
  title_status: 'clean',
  cylinders: '',
  paint_color: '',
  location: '',
  description: '',
})
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }finally{
      setIsLoading(false)
    }
  }

  const fillSuggestedPrice = async ()=>{
    if(isEstimating) return
    if(!car.year || !car.category || !car.condition){
      toast.error('Add year, category, and condition before estimating')
      return
    }

    setIsEstimating(true)
    try {
      const {data} = await axios.post('/api/user/predict-price', {
        manufacturer: car.brand,
        model: car.model,
        year: car.year,
        odometer: car.mileage,
        condition: car.condition,
        cylinders: car.cylinders,
        fuel: car.fuel_type,
        title_status: car.title_status,
        transmission: car.transmission,
        type: car.category,
        paint_color: car.paint_color,
        state: car.location,
      })
     if (data.success) {
  setCar({ ...car, price: data.predictedPrice })

  // ✅ Only ONE toast
  toast.success(
    data.source === "ML"
      ? "Price estimated using ML"
      : "Price estimated"
  )
} else {
  throw new Error(data.message)
}
    } catch {
      setCar({...car, price: fallbackEstimateResalePrice(car)})
      toast.error('ML backend unavailable, using local estimate')
    } finally {
      setIsEstimating(false)
    }
  }

  return (
    <div className='px-4 py-10 md:px-10 flex-1'>

      <Title title="Add Sale Listing" subTitle="Fill in car details for resale, including price, mileage, condition, title status, and photos."/>

      <form onSubmit={onSubmitHandler} className='flex flex-col gap-5 text-gray-500 text-sm mt-6 max-w-3xl'>

        <div className='flex items-center gap-2 w-full'>
          <label htmlFor="car-image">
            <img src={image ? URL.createObjectURL(image) : assets.upload_icon} alt="" className='h-14 rounded cursor-pointer'/>
            <input type="file" id="car-image" accept="image/*" hidden required onChange={e=> setImage(e.target.files[0])}/>
          </label>
          <p className='text-sm text-gray-500'>Upload clear photos of the car</p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='flex flex-col w-full'>
            <label>Brand</label>
            <input type="text" placeholder="e.g. BMW, Toyota, Honda..." required className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none' value={car.brand} onChange={e=> setCar({...car, brand: e.target.value})}/>
          </div>
          <div className='flex flex-col w-full'>
            <label>Model</label>
            <input type="text" placeholder="e.g. X5, Corolla, City..." required className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none' value={car.model} onChange={e=> setCar({...car, model: e.target.value})}/>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          <div className='flex flex-col w-full'>
            <label>Year</label>
            <input type="number" placeholder="2021" required className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none' value={car.year} onChange={e=> setCar({...car, year: e.target.value})}/>
          </div>
          <div className='flex flex-col w-full'>
            <label>Asking Price ({currency})</label>
            <input type="number" placeholder="18000" required className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none' value={car.price} onChange={e=> setCar({...car, price: e.target.value})}/>
          </div>
          <div className='flex flex-col w-full'>
            <label>Category</label>
            <select required onChange={e=> setCar({...car, category: e.target.value})} value={car.category} className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'>
              <option value="">Select a category</option>
                    <option value="sedan">Sedan</option>
<option value="suv">SUV</option>
<option value="van">Van</option>
<option value="hatchback">Hatchback</option>
<option value="truck">Truck</option>
            </select>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          <div className='flex flex-col w-full'>
            <label>Mileage (km)</label>
            <input type="number" placeholder="45000" required className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none' value={car.mileage} onChange={e=> setCar({...car, mileage: e.target.value})}/>
          </div>
          <div className='flex flex-col w-full'>
            <label>Condition</label>
            <select required onChange={e=> setCar({...car, condition: e.target.value})} value={car.condition} className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'>
              {conditionOptions.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
          <div className='flex flex-col w-full'>
            <label>Title Status</label>
            <select required onChange={e=> setCar({...car, title_status: e.target.value})} value={car.title_status} className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'>
              {titleOptions.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          <div className='flex flex-col w-full'>
            <label>Transmission</label>
            <select required onChange={e=> setCar({...car, transmission: e.target.value})} value={car.transmission} className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'>
              <option value="">Select a transmission</option>
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className='flex flex-col w-full'>
            <label>Fuel Type</label>
            <select required onChange={e=> setCar({...car, fuel_type: e.target.value})} value={car.fuel_type} className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'>
              <option value="">Select a fuel type</option>
                <option value="gas">Gas</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>  
                <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div className='flex flex-col w-full'>
            <label>Seating Capacity</label>
            <input type="number" placeholder="5" required className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none' value={car.seating_capacity} onChange={e=> setCar({...car, seating_capacity: e.target.value})}/>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          <div className='flex flex-col w-full'>
            <label>Cylinders</label>
            <select onChange={e=> setCar({...car, cylinders: e.target.value})} value={car.cylinders} className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'>
              <option value="">Select cylinders</option>
              {cylinderOptions.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
          <div className='flex flex-col w-full'>
            <label>Paint Color</label>
            <select onChange={e=> setCar({...car, paint_color: e.target.value})} value={car.paint_color} className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'>
              <option value="">Select color</option>
              {colorOptions.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
          <div className='flex flex-col w-full'>
            <label>Location</label>
            <select required onChange={e=> setCar({...car, location: e.target.value})} value={car.location} className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'>
              <option value="">Select a location</option>
             <option value="ny">New York</option>
             <option value="ca">California</option>
            <option value="tx">Texas</option>
             <option value="il">Illinois</option>
            </select>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-3 sm:items-center rounded-lg border border-borderColor bg-light px-4 py-3'>
          <div className='flex-1'>
            <p className='font-medium text-gray-700'>Need a starting price?</p>
            <p className='text-gray-500'>Use the resale estimator as a quick guide, then adjust the asking price as needed.</p>
          </div>
          <button type='button' onClick={fillSuggestedPrice} className='px-4 py-2 bg-white border border-borderColor rounded-md text-primary font-medium cursor-pointer'>{isEstimating ? 'Estimating...' : 'Estimate Price'}</button>
        </div>

        <div className='flex flex-col w-full'>
            <label>Description</label>
            <textarea rows={5} placeholder="Mention ownership history, service records, accidents, upgrades, and inspection notes." required className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none' value={car.description} onChange={e=> setCar({...car, description: e.target.value})}></textarea>
          </div>

        <button className='flex items-center gap-2 px-4 py-2.5 mt-4 bg-primary text-white rounded-md font-medium w-max cursor-pointer'>
          <img src={assets.tick_icon} alt="" />
          {isLoading ? 'Listing...' : 'List Car for Sale'}
        </button>

      </form>

    </div>
  )
}

export default AddCar
