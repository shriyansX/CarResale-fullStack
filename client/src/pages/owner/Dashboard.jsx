// import React, { useEffect, useState } from 'react'
// import { assets } from '../../assets/assets'
// import Title from '../../components/owner/Title'
// import { useAppContext } from '../../context/AppContext'
// import toast from 'react-hot-toast'

// const Dashboard = () => {

//   const { axios, isOwner, currency } = useAppContext()

//   // ✅ SAFE DEFAULT STATE
//   const [data, setData] = useState({
//     totalCars: 0,
//     totalInquiries: 0,
//     pendingInquiries: 0,
//     acceptedInquiries: 0,
//     recentInquiries: [], // ✅ ALWAYS ARRAY
//     monthlyRevenue: 0,
//   })

//   const dashboardCards = [
//     { title: "Total Listings", value: data.totalCars || 0, icon: assets.carIconColored },
//     { title: "Total Enquiries", value: data.totalInquiries || 0, icon: assets.listIconColored },
//     { title: "Pending", value: data.pendingInquiries || 0, icon: assets.cautionIconColored },
//     { title: "Accepted", value: data.acceptedInquiries || 0, icon: assets.listIconColored },
//   ]

//   const fetchDashboardData = async () => {
//     try {
//       const res = await axios.get('/api/owner/dashboard')

//       if (res.data.success) {
//         // ✅ SAFE MERGE
//         setData({
//           totalCars: res.data.dashboardData?.totalCars || 0,
//           totalInquiries: res.data.dashboardData?.totalInquiries || 0,
//           pendingInquiries: res.data.dashboardData?.pendingInquiries || 0,
//           acceptedInquiries: res.data.dashboardData?.acceptedInquiries || 0,
//           recentInquiries: res.data.dashboardData?.recentInquiries || [],
//           monthlyRevenue: res.data.dashboardData?.monthlyRevenue || 0,
//         })
//       } else {
//         toast.error(res.data.message)
//       }

//     } catch (error) {
//       toast.error(error.message)
//     }
//   }

//   useEffect(() => {
//     if (isOwner) {
//       fetchDashboardData()
//     }
//   }, [isOwner])

//   return (
//     <div className='px-4 pt-10 md:px-10 flex-1'>

//       <Title
//         title="Owner Dashboard"
//         subTitle="Monitor your resale listings, buyer enquiries, accepted offers, and recent marketplace activity."
//       />

//       {/* CARDS */}
//       <div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-8 max-w-3xl'>
//         {dashboardCards.map((card, index) => (
//           <div key={index} className='flex gap-2 items-center justify-between p-4 rounded-md border border-borderColor'>
//             <div>
//               <h1 className='text-xs text-gray-500'>{card.title}</h1>
//               <p className='text-lg font-semibold'>{card.value}</p>
//             </div>
//             <div className='flex items-center justify-center w-10 h-10 rounded-full bg-primary/10'>
//               <img src={card.icon} alt="" className='h-4 w-4' />
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* CONTENT */}
//       <div className='flex flex-wrap items-start gap-6 mb-8 w-full'>

//         {/* RECENT INQUIRIES */}
//         <div className='p-4 md:p-6 border border-borderColor rounded-md max-w-lg w-full'>
//           <h1 className='text-lg font-medium'>Recent Enquiries</h1>
//           <p className='text-gray-500'>Latest buyer offers on your cars</p>

//           {data.recentInquiries?.length > 0 ? (
//             data.recentInquiries.map((inquiry, index) => (
//               <div key={index} className='mt-4 flex items-center justify-between'>

//                 <div className='flex items-center gap-2'>
//                   <div className='hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-primary/10'>
//                     <img src={assets.listIconColored} alt="" className='h-5 w-5' />
//                   </div>
//                   <div>
//                     <p>{inquiry?.car?.brand} {inquiry?.car?.model}</p>
//                     <p className='text-sm text-gray-500'>
//                       {inquiry?.createdAt?.split('T')[0]}
//                     </p>
//                   </div>
//                 </div>

//                 <div className='flex items-center gap-2 font-medium'>
//                   <p className='text-sm text-gray-500'>
//                     {currency}{Number(inquiry?.offerPrice || inquiry?.price || 0).toLocaleString()}
//                   </p>
//                   <p className='px-3 py-0.5 border border-borderColor rounded-full text-sm'>
//                     {inquiry?.status}
//                   </p>
//                 </div>

//               </div>
//             ))
//           ) : (
//             <p className='mt-4 text-gray-400 text-sm'>No enquiries yet</p>
//           )}
//         </div>

//         {/* REVENUE */}
//         <div className='p-4 md:p-6 mb-6 border border-borderColor rounded-md w-full md:max-w-xs'>
//           <h1 className='text-lg font-medium'>Accepted Offer Value</h1>
//           <p className='text-gray-500'>Total value of accepted enquiries</p>
//           <p className='text-3xl mt-6 font-semibold text-primary'>
//             {currency}{Number(data.monthlyRevenue || 0).toLocaleString()}
//           </p>
//         </div>

//       </div>

//     </div>
//   )
// }

// export default Dashboard
import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const Dashboard = () => {

  const { axios, isOwner } = useAppContext()
  const currency = import.meta.env.VITE_CURRENCY || "$"

  // ✅ NEW STATE (sales-based)
  const [data, setData] = useState({
    totalCars: 0,
    totalSoldCars: 0,
    totalRevenue: 0,
    recentSales: [],
  })

  // ✅ CARDS (UPDATED)
  const dashboardCards = [
    { title: "Total Listings", value: data.totalCars, icon: assets.carIconColored },
    { title: "Cars Sold", value: data.totalSoldCars, icon: assets.listIconColored },
    {
  title: "Revenue",
  value: `${currency || "₹"}${Number(data.totalRevenue || 0).toLocaleString()}`,
  icon: assets.listIconColored
}
  ]

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('/api/owner/dashboard')

      if (res.data.success) {
        setData({
          totalCars: res.data.dashboardData?.totalCars || 0,
          totalSoldCars: res.data.dashboardData?.totalSoldCars || 0,
          totalRevenue: res.data.dashboardData?.totalRevenue || 0,
          recentSales: res.data.dashboardData?.recentSales || [],
        })
      } else {
        toast.error(res.data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (isOwner) {
      fetchDashboardData()
    }
  }, [isOwner])

  return (
    <div className='px-4 pt-10 md:px-10 flex-1'>

      <Title
        title="Owner Dashboard"
        subTitle="Track your car sales, revenue, and recent transactions."
      />

      {/* ✅ CARDS */}
      <div className='grid sm:grid-cols-2 md:grid-cols-3 gap-6 my-8 max-w-3xl'>
        {dashboardCards.map((card, index) => (
          <div key={index} className='flex gap-2 items-center justify-between p-4 rounded-md border border-borderColor'>
            <div>
              <h1 className='text-xs text-gray-500'>{card.title}</h1>
              <p className='text-lg font-semibold'>{card.value}</p>
            </div>
            <div className='flex items-center justify-center w-10 h-10 rounded-full bg-primary/10'>
              <img src={card.icon} alt="" className='h-4 w-4' />
            </div>
          </div>
        ))}
      </div>

      {/* ✅ RECENT SALES */}
      <div className='p-4 md:p-6 border border-borderColor rounded-md max-w-lg w-full'>
        <h1 className='text-lg font-medium'>Recent Sales</h1>
        <p className='text-gray-500'>Latest cars sold</p>

        {data.recentSales.length > 0 ? (
          data.recentSales.map((sale, index) => (
            <div key={index} className='mt-4 flex items-center justify-between'>

              <div className='flex items-center gap-2'>
                <div className='hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-primary/10'>
                  <img src={assets.carIconColored} alt="" className='h-5 w-5' />
                </div>

                <div>
                  <p>{sale?.car?.brand} {sale?.car?.model}</p>
                  <p className='text-sm text-gray-500'>
                    {sale?.createdAt?.split('T')[0]}
                  </p>
                </div>
              </div>

              <div className='text-right'>
                <p className='text-sm font-medium text-primary'>
                  {currency}{Number(sale?.price || 0).toLocaleString()}
                </p>

                <span className='px-3 py-0.5 rounded-full text-xs bg-gray-200 text-gray-700'>
                  Sold
                </span>
              </div>

            </div>
          ))
        ) : (
          <p className='mt-4 text-gray-400 text-sm'>No sales yet</p>
        )}
      </div>

    </div>
  )
}

export default Dashboard