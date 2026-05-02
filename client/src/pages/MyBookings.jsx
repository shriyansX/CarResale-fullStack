import React, { useEffect, useState } from 'react'
import { assets} from '../assets/assets'
import Title from '../components/Title'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'motion/react'

const MyBookings = () => {

  const { axios, user } = useAppContext()

  const [inquiries, setInquiries] = useState([])
  const currency = import.meta.env.VITE_CURRENCY || "$"

  const fetchMyInquiries = async ()=>{
    try {
      const { data } = await axios.get('/api/inquiries/user')
      if (data.success){
        setInquiries(data.bookings)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(()=>{
    user && fetchMyInquiries()
  },[user])

  const statusClass = (status)=> status === 'accepted'
    ? 'bg-green-400/15 text-green-600'
    : status === 'pending'
      ? 'bg-yellow-400/15 text-yellow-700'
      : 'bg-red-400/15 text-red-600'

  return (
    <motion.div 
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    
    className='px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-7xl'>

      <Title title='My Enquiries'
       subTitle='Track the purchase enquiries and offers you have sent to sellers.'
       align="left"/>

       <div>
        {inquiries.map((inquiry, index)=>(
          <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
          
          key={inquiry._id} className='grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-borderColor rounded-lg mt-5 first:mt-12'>
            <div className='md:col-span-1'>
              <div className='rounded-md overflow-hidden mb-3'>
                <img src={inquiry.car.image} alt="" className='w-full h-auto aspect-video object-cover'/>
              </div>
              <p className='text-lg font-medium mt-2'>{inquiry.car.brand} {inquiry.car.model}</p>

              <p className='text-gray-500'>{inquiry.car.year} - {inquiry.car.category} - {inquiry.car.location}</p>
            </div>

            <div className='md:col-span-2'>
              <div className='flex items-center gap-2'>
                <p className='px-3 py-1.5 bg-light rounded'>Enquiry #{index+1}</p>
                <p className={`px-3 py-1 text-xs rounded-full ${statusClass(inquiry.status)}`}>{inquiry.status}</p>
              </div>

              <div className='flex items-start gap-2 mt-3'>
                <img src={assets.calendar_icon_colored} alt="" className='w-4 h-4 mt-1'/>
                <div>
                  <p className='text-gray-500'>Submitted On</p>
                  <p>{inquiry.createdAt.split('T')[0]}</p>
                </div>
              </div>

              <div className='flex items-start gap-2 mt-3'>
                <img src={assets.location_icon_colored} alt="" className='w-4 h-4 mt-1'/>
                <div>
                  <p className='text-gray-500'>Seller Location</p>
                  <p>{inquiry.car.location}</p>
                </div>
              </div>
            </div>

           <div className='md:col-span-1 flex flex-col justify-between gap-6'>
              <div className='text-sm text-gray-500 text-right'>
                <p>Your Offer</p>
                <h1 className='text-2xl font-semibold text-primary'>{currency}{Number(inquiry.offerPrice || inquiry.price || 0).toLocaleString()}</h1>
                <p>Asking {currency}{Number(inquiry.price || 0).toLocaleString()}</p>
              </div>
           </div>


          </motion.div>
        ))}
       </div>
      
    </motion.div>
  )
}

export default MyBookings
