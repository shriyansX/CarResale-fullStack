import imagekit from "../configs/imageKit.js";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import User from "../models/User.js";

const uploadBufferToImageKit = async (file, folder, transformation = []) => {
  if (!file?.buffer) {
    throw new Error("Image is required");
  }

  const uploaded = await imagekit.upload({
    file: file.buffer,
    fileName: file.originalname,
    folder,
  });

  return imagekit.url({
    path: uploaded.filePath,
    transformation,
  });
};

export const changeRoleToOwner = async (req, res) => {
  try {
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, { role: "owner" });

    res.json({
      success: true,
      message: "You are now an owner",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const addCar = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only owners can add cars",
      });
    }

    const car = JSON.parse(req.body.carData);
    const imageFile = req.file;

    if (!imageFile) {
      return res.json({
        success: false,
        message: "Image is required",
      });
    }

    const imageUrl = await uploadBufferToImageKit(imageFile, "/cars", [
      { width: "1280" },
      { quality: "auto" },
      { format: "webp" },
    ]);

    await Car.create({
      ...car,
      owner: req.user._id,
      image: imageUrl,
    });

    res.json({
      success: true,
      message: "Car added successfully",
    });
  } catch (error) {
    console.log("ADD CAR ERROR:", error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getOwnerCars = async (req, res) => {
  try {
    const cars = await Car.find({ owner: req.user._id });
    res.json({ success: true, cars });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const toggleCarAvailability = async (req, res) => {
  try {
    const { carId } = req.body;

    const car = await Car.findById(carId);

    if (!car || car.owner.toString() !== req.user._id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    car.isAvailable = !car.isAvailable;
    await car.save();

    res.json({
      success: true,
      message: "Car updated",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const deleteCar = async (req, res) => {
  try {
    const { carId } = req.body;

    const car = await Car.findById(carId);

    if (!car || car.owner.toString() !== req.user._id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    await Car.findByIdAndDelete(carId);

    res.json({
      success: true,
      message: "Car deleted",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getDashboardData = async (req, res) => {
  try {
    const { _id, role } = req.user;

    if (role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only owners allowed",
      });
    }

    const cars = await Car.find({ owner: _id });
    const bookings = await Booking.find({ owner: _id })
      .populate("car")
      .sort({ createdAt: -1 });

    const successfulSales = bookings.filter(
      (booking) => booking.paymentStatus === "paid" || booking.status === "accepted"
    );

    const soldCarIds = new Set(
      successfulSales.map((booking) => booking.car?._id?.toString())
    );

    const totalRevenue = successfulSales.reduce((sum, booking) => {
      const price = Number(booking.price || booking.offerPrice || 0);
      return sum + price;
    }, 0);

    res.json({
      success: true,
      dashboardData: {
        totalCars: cars.length,
        totalSoldCars: soldCarIds.size,
        totalRevenue,
        recentSales: successfulSales.slice(0, 5),
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const updateUserImage = async (req, res) => {
  try {
    const imageFile = req.file;

    if (!imageFile) {
      return res.json({
        success: false,
        message: "Image required",
      });
    }

    const imageUrl = await uploadBufferToImageKit(imageFile, "/users", [
      { width: "400" },
    ]);

    await User.findByIdAndUpdate(req.user._id, { image: imageUrl });

    res.json({
      success: true,
      message: "Image updated",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
