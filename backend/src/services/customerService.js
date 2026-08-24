const {
  Appointment,
  User,
  Service,
  Employee,
  EmployeeService,
  Salon,
  Category,
  SalonImage,
  Review,
  BusinessHour,
  Payment,
} = require("../models");

const { Op } = require("sequelize");
const bcrypt = require("bcrypt");

// Helper
const getSalonByOwner = async (ownerId) => {
  const salon = await Salon.findOne({
    where: { ownerId },
  });

  if (!salon) {
    const error = new Error(
      "No registered salon assigned to this owner account.",
    );

    error.statusCode = 404;
    throw error;
  }

  return salon;
};

// ================= OWNER CUSTOMER OPERATIONS =================

exports.getSalonCustomers = async (ownerId) => {
  const salon = await getSalonByOwner(ownerId);

  const appointments = await Appointment.findAll({
    where: {
      salonId: salon.id,
    },
    attributes: ["customerId"],
    group: ["customerId"],
  });

  const customerIds = appointments.map((appointment) => appointment.customerId);

  return await User.findAll({
    where: {
      id: customerIds,
    },
    attributes: ["id", "fullName", "email", "phone", "createdAt"],
  });
};

exports.getCustomerHistory = async (ownerId, customerId) => {
  const salon = await getSalonByOwner(ownerId);

  return await Appointment.findAll({
    where: {
      salonId: salon.id,
      customerId,
    },

    include: [
      {
        model: Service,
        as: "service",
        attributes: ["id", "name", "price"],
      },

      {
        model: Employee,
        as: "employee",
        attributes: ["id", "name"],
      },
    ],

    order: [
      ["appointmentDate", "DESC"],
      ["appointmentTime", "DESC"],
    ],
  });
};

// ================= CUSTOMER PROFILE =================

exports.getCustomerProfile = async (customerId) => {
  const user = await User.findByPk(customerId, {
    attributes: [
      "id",
      "fullName",
      "email",
      "phone",
      "profileImage",
      "createdAt",
    ],
  });

  if (!user) {
    const error = new Error("Customer profile not found.");
    error.statusCode = 404;
    throw error;
  }

  const completedAppointments = await Appointment.count({
    where: {
      customerId,
      bookingStatus: "COMPLETED",
    },
  });

  return {
    ...user.toJSON(),
    completedAppointments,
  };
};

exports.updateCustomerProfile = async (customerId, profileData) => {
  const user = await User.findByPk(customerId);

  if (!user) {
    const error = new Error("Customer profile not found.");
    error.statusCode = 404;
    throw error;
  }

  const { fullName, phone, email } = profileData;

  await user.update({
    fullName,
    phone,
    email,
  });

  return user;
};

exports.updateCustomerProfileImage = async (customerId, imagePath) => {
  const user = await User.findByPk(customerId);

  if (!user) {
    const error = new Error("Customer profile not found.");
    error.statusCode = 404;
    throw error;
  }

  await user.update({
    profileImage: imagePath,
  });

  return user;
};

exports.changeCustomerPassword = async (
  customerId,
  oldPassword,
  newPassword,
) => {
  const user = await User.findByPk(customerId);

  if (!user) {
    const error = new Error("Customer profile not found.");

    error.statusCode = 404;
    throw error;
  }

  const match = await bcrypt.compare(oldPassword, user.password);

  if (!match) {
    const error = new Error("Current password is incorrect.");

    error.statusCode = 401;
    throw error;
  }

  user.password = await bcrypt.hash(newPassword, 10);

  await user.save();

  return true;
};

// ================= SALON DISCOVERY =================

exports.browseAndSearchSalons = async (filters) => {
  const { categoryId, city, location, search } = filters;

  const whereClause = {
    status: "ACTIVE",
  };

  if (city) {
    whereClause.city = {
      [Op.like]: `%${city}%`,
    };
  }

  if (location) {
    whereClause.subCity = {
      [Op.like]: `%${location}%`,
    };
  }

  if (search) {
    whereClause[Op.or] = [
      {
        name: {
          [Op.like]: `%${search}%`,
        },
      },

      {
        description: {
          [Op.like]: `%${search}%`,
        },
      },
    ];
  }

  const includeOptions = [
    {
      model: Category,
      as: "categories",
      attributes: ["id", "name"],

      through: {
        attributes: [],
      },
    },
    {
      model: SalonImage,
      as: "images",
      attributes: ["imageUrl"],
    },
    {
      model: BusinessHour,
      as: "businessHours",
      attributes: ["id", "day", "openingTime", "closingTime", "isClosed"],
    },
  ];

  if (categoryId) {
    includeOptions[0].where = {
      id: categoryId,
    };
  }

  return await Salon.findAll({
    where: whereClause,

    include: includeOptions,

    attributes: [
      "id",
      "name",
      "description",
      "logo",
      "gallery",
      "phone",
      "email",
      "country",
      "city",
      "subCity",
      "address",
      "latitude",
      "longitude",
    ],

    order: [["name", "ASC"]],
  });
};

// ================= SALON DETAILS =================

exports.getDetailedSalonCatalog = async (salonId) => {
  const salon = await Salon.findOne({
    where: {
      id: salonId,
      status: "ACTIVE",
    },
    include: [
      {
        model: Category,
        as: "categories",
        attributes: ["id", "name"],
        through: { attributes: [] },
      },
      {
        model: Service,
        as: "services",
        attributes: [
          "id",
          "name",
          "description",
          "price",
          "duration",
          "image",
          "categoryId",
          "isActive",
        ],
      },
      {
        model: Employee,
        as: "employees",
        attributes: ["id", "name", "position", "image"],
      },
      {
        model: SalonImage,
        as: "images",
        attributes: ["id", "imageUrl"],
      },
      {
        model: BusinessHour,
        as: "businessHours",
        attributes: ["id", "day", "openingTime", "closingTime", "isClosed"],
      },
      {
        model: Review,
        as: "reviews",
        attributes: ["id", "rating", "comment", "createdAt"],
        include: [
          {
            model: User,
            as: "customer",
            attributes: ["fullName"],
          },
        ],
      },
    ],
  });

  if (!salon) {
    const error = new Error("Salon profile not found.");
    error.statusCode = 404;
    throw error;
  }

  // Convert Sequelize instance to a plain JS object so we can edit it
  const salonData = salon.toJSON();

  // Define standard 7 days
  const ALL_DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Quick lookup map of existing days returned from DB
  const existingHoursMap = new Map(
    salonData.businessHours.map((bh) => [
      bh.day.charAt(0).toUpperCase() + bh.day.slice(1).toLowerCase(),
      bh,
    ]),
  );

  // Fill in missing days dynamically with isClosed: true
  salonData.businessHours = ALL_DAYS.map((day) => {
    if (existingHoursMap.has(day)) {
      return existingHoursMap.get(day);
    }

    return {
      id: null,
      day: day,
      openingTime: "00:00:00",
      closingTime: "00:00:00",
      isClosed: true,
    };
  });

  return salonData;
};

// ================= EMPLOYEES BY SERVICES =================

exports.getEmployeesByServices = async (salonId, serviceIds) => {
  const results = [];

  for (const serviceId of serviceIds) {
    const service = await Service.findOne({
      where: {
        id: serviceId,
      },
      attributes: ["id", "name"],
    });

    if (!service) {
      continue;
    }

    const employeeServices = await EmployeeService.findAll({
      where: {
        serviceId,
      },
      attributes: ["employeeId"],
    });

    const employeeIds = employeeServices.map(
      (employeeService) => employeeService.employeeId,
    );

    let employees = [];

    if (employeeIds.length > 0) {
      employees = await Employee.findAll({
        where: {
          id: {
            [Op.in]: employeeIds,
          },
          salonId,
        },
        attributes: ["id", "name", "position"],
      });
    }

    results.push({
      serviceId: service.id,
      serviceName: service.name,
      employees,
    });
  }

  return results;
};

// ================= CANCEL BOOKING =================

exports.cancelBookingRequest = async (customerId, appointmentId) => {
  const appointment = await Appointment.findOne({
    where: {
      id: appointmentId,
      customerId,
    },
  });

  if (!appointment) {
    const error = new Error("Appointment not found.");

    error.statusCode = 404;

    throw error;
  }

  if (!["PENDING", "ACCEPTED"].includes(appointment.bookingStatus)) {
    const error = new Error("This appointment cannot be cancelled.");

    error.statusCode = 400;

    throw error;
  }

  appointment.bookingStatus = "CANCELLED";

  appointment.cancelledAt = new Date();

  await appointment.save();

  return appointment;
};

// ================= CREATE BOOKING =================

exports.createBookingRequest = async (customerId, bookingData) => {
  const salonId = bookingData.salonId || bookingData.salon_id;
  const appointmentDate =
    bookingData.appointmentDate || bookingData.appointment_date;
  const notes = bookingData.notes;
  const bookings = bookingData.bookings;

  // 1. Validate required fields
  if (!salonId) {
    const error = new Error("Salon ID is required.");
    error.statusCode = 400;
    throw error;
  }

  if (!appointmentDate) {
    const error = new Error("Appointment date is required.");
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(bookings) || bookings.length === 0) {
    const error = new Error("At least one booking is required.");
    error.statusCode = 400;
    throw error;
  }

  // 2. Verify Salon exists
  const salon = await Salon.findOne({
    where: {
      id: salonId,
      status: "ACTIVE",
    },
  });

  if (!salon) {
    const error = new Error("Salon not found or inactive.");
    error.statusCode = 404;
    throw error;
  }

  const createdAppointments = [];

  // 3. Process each service booking
  for (const booking of bookings) {
    const serviceId = booking.serviceId || booking.service_id;
    let employeeId = booking.employeeId || booking.employee_id;
    const appointmentTime = booking.appointmentTime || booking.start_time;

    // Validate service
    if (!serviceId) {
      const error = new Error("Service ID is required for each booking.");
      error.statusCode = 400;
      throw error;
    }

    const service = await Service.findOne({
      where: {
        id: serviceId,
      },
    });

    if (!service) {
      const error = new Error(`Selected service ${serviceId} not found.`);
      error.statusCode = 404;
      throw error;
    }

    if (!appointmentTime) {
      const error = new Error(
        `Start time is required for service ${serviceId}.`,
      );
      error.statusCode = 400;
      throw error;
    }

    // 4. Auto-assign employee if employeeId is not provided
    if (!employeeId) {
      const employeeServices = await EmployeeService.findAll({
        where: {
          serviceId,
        },
        attributes: ["employeeId"],
      });

      const employeeIds = employeeServices.map(
        (employeeService) => employeeService.employeeId,
      );

      if (employeeIds.length === 0) {
        const error = new Error(
          `No employees are assigned to service ${serviceId}.`,
        );
        error.statusCode = 400;
        throw error;
      }

      const availableEmployees = await Employee.findAll({
        where: {
          salonId,
          id: {
            [Op.in]: employeeIds,
          },
        },
        attributes: ["id"],
      });

      let assignedEmployee = null;

      for (const employee of availableEmployees) {
        const conflict = await Appointment.findOne({
          where: {
            employeeId: employee.id,
            appointmentDate,
            bookingStatus: {
              [Op.in]: ["PENDING", "ACCEPTED", "CONFIRMED"],
            },
          },
          attributes: ["id", "appointmentTime", "duration"],
        });

        if (!conflict) {
          assignedEmployee = employee;
          break;
        }

        const existingBookings = await Appointment.findAll({
          where: {
            employeeId: employee.id,
            appointmentDate,
            bookingStatus: {
              [Op.in]: ["PENDING", "ACCEPTED", "CONFIRMED"],
            },
          },
          attributes: ["appointmentTime", "duration"],
        });

        const newStart = new Date(`1970-01-01T${appointmentTime}:00`);
        const newEnd = new Date(newStart);
        newEnd.setMinutes(newEnd.getMinutes() + (service.duration || 30));

        const hasConflict = existingBookings.some((existing) => {
          const existingStart = new Date(
            `1970-01-01T${existing.appointmentTime}:00`,
          );
          const existingEnd = new Date(existingStart);

          existingEnd.setMinutes(
            existingEnd.getMinutes() + (existing.duration || 30),
          );

          return newStart < existingEnd && newEnd > existingStart;
        });

        if (!hasConflict) {
          assignedEmployee = employee;
          break;
        }
      }

      if (!assignedEmployee) {
        const error = new Error(
          `No available employee found for service ${serviceId} at ${appointmentTime}.`,
        );
        error.statusCode = 400;
        throw error;
      }

      employeeId = assignedEmployee.id;
    }

    // 5. Check employee belongs to the salon
    const employee = await Employee.findOne({
      where: {
        id: employeeId,
        salonId,
      },
    });

    if (!employee) {
      const error = new Error(
        `Selected employee ${employeeId} does not belong to this salon.`,
      );
      error.statusCode = 400;
      throw error;
    }

    // 6. Check employee is assigned to this service
    const employeeService = await EmployeeService.findOne({
      where: {
        employeeId,
        serviceId,
      },
    });

    if (!employeeService) {
      const error = new Error(
        `Selected employee is not assigned to service ${serviceId}.`,
      );
      error.statusCode = 400;
      throw error;
    }

    // 7. Check duration-aware employee conflict
    const existingBookings = await Appointment.findAll({
      where: {
        employeeId,
        appointmentDate,
        bookingStatus: {
          [Op.in]: ["PENDING", "ACCEPTED", "CONFIRMED"],
        },
      },
      attributes: ["appointmentTime", "duration"],
    });

    const newStart = new Date(`1970-01-01T${appointmentTime}:00`);
    const newEnd = new Date(newStart);

    newEnd.setMinutes(newEnd.getMinutes() + (service.duration || 30));

    const hasConflict = existingBookings.some((existing) => {
      const existingStart = new Date(
        `1970-01-01T${existing.appointmentTime}:00`,
      );

      const existingEnd = new Date(existingStart);

      existingEnd.setMinutes(
        existingEnd.getMinutes() + (existing.duration || 30),
      );

      return newStart < existingEnd && newEnd > existingStart;
    });

    if (hasConflict) {
      const error = new Error(
        "This employee is already booked during the selected time.",
      );
      error.statusCode = 400;
      throw error;
    }

    // 8. Create Appointment
    const newAppointment = await Appointment.create({
      customerId,
      salonId,
      serviceId,
      employeeId,
      appointmentDate,
      appointmentTime,
      duration: service.duration || 30,
      bookedPrice: service.price,
      totalAmount: service.price,
      notes: notes || null,
      bookingStatus: "PENDING",
    });

    createdAppointments.push(newAppointment);
  }

  // Trigger Telegram real-time push notifications
  try {
    const { notifyNewBooking } = require("./telegramService");
    for (const appt of createdAppointments) {
      notifyNewBooking(appt.id).catch((err) =>
        console.warn("Telegram notification error:", err.message)
      );
    }
  } catch (tgErr) {
    console.warn("Skipping Telegram notification:", tgErr.message);
  }

  return createdAppointments;
};

// ================= GET CUSTOMER BOOKINGS =================

exports.getCustomerBookings = async (customerId, type) => {
  try {
    const whereCondition = { customerId };

    // Standardize type string
    const queryType = type ? type.toLowerCase() : null;

    if (queryType === "current") {
      whereCondition.bookingStatus = [
        "PENDING",
        "ACCEPTED",
        "pending",
        "accepted",
      ];
    } else if (queryType === "history") {
      whereCondition.bookingStatus = [
        "COMPLETED",
        "CANCELLED",
        "REJECTED",
        "completed",
        "cancelled",
        "rejected",
      ];
    }

    return await Appointment.findAll({
      where: whereCondition,
      include: [
        {
          model: Salon,
          as: "salon",
          required: false,
          attributes: ["id", "name", "address", "city", "phone"],
        },
        {
          model: Service,
          as: "service",
          required: false,
          attributes: ["id", "name", "price", "duration"],
        },
        {
          model: Employee,
          as: "employee",
          required: false,
          attributes: ["id", "name", "position"],
        },
        {
          model: Payment,
          as: "payment",
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });
  } catch (error) {
    console.error("❌ Error inside getCustomerBookings:", error);
    throw error;
  }
};

// ================= GET AVAILABLE SLOTS =================

// ================= GET AVAILABLE SLOTS =================

exports.getAvailableSlots = async ({ appointmentDate, services }) => {
  console.log("MULTI-SERVICE AVAILABLE SLOT INPUT:", {
    appointmentDate,
    services,
  });

  if (!appointmentDate) {
    const error = new Error("Appointment date is required.");
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(services) || services.length === 0) {
    const error = new Error("At least one service is required.");
    error.statusCode = 400;
    throw error;
  }

  // =========================================================
  // TIME HELPERS
  // =========================================================

  const timeToMinutes = (time) => {
    if (!time) return 0;

    const [hours, minutes] = time.slice(0, 5).split(":").map(Number);

    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  // =========================================================
  // LOAD SERVICE INFORMATION
  // =========================================================

  const serviceIds = services.map((item) => Number(item.serviceId));

  const serviceRecords = await Service.findAll({
    where: {
      id: {
        [Op.in]: serviceIds,
      },
    },
    attributes: ["id", "name", "duration", "salonId"],
  });

  if (serviceRecords.length !== services.length) {
    const error = new Error(
      "One or more selected services could not be found.",
    );

    error.statusCode = 404;
    throw error;
  }

  // =========================================================
  // BUILD SERVICE SEQUENCE
  // =========================================================

  const serviceSequence = [];

  for (const selectedService of services) {
    const serviceId = Number(selectedService.serviceId);

    const service = serviceRecords.find(
      (item) => Number(item.id) === serviceId,
    );

    if (!service) {
      continue;
    }

    serviceSequence.push({
      serviceId,
      duration: Number(service.duration || 30),

      // null means AUTO
      employeeId: selectedService.employeeId
        ? Number(selectedService.employeeId)
        : null,
    });
  }

  // =========================================================
  // GET ALL EMPLOYEES FOR AUTO-ASSIGN SERVICES
  // =========================================================

  const employeeIdsNeeded = serviceSequence
    .filter((item) => item.employeeId)
    .map((item) => item.employeeId);

  if (employeeIdsNeeded.length > 0) {
    const employees = await Employee.findAll({
      where: {
        id: {
          [Op.in]: employeeIdsNeeded,
        },
      },
      attributes: ["id", "salonId"],
    });

    for (const item of serviceSequence) {
      if (!item.employeeId) continue;

      const employee = employees.find(
        (emp) => Number(emp.id) === Number(item.employeeId),
      );

      if (!employee) {
        const error = new Error(`Employee ${item.employeeId} was not found.`);

        error.statusCode = 400;
        throw error;
      }
    }
  }

  // =========================================================
  // LOAD EXISTING APPOINTMENTS
  // =========================================================

  const allEmployeeIds = new Set();

  for (const item of serviceSequence) {
    if (item.employeeId) {
      allEmployeeIds.add(item.employeeId);
    }
  }

  // Find employees who can perform AUTO services
  for (const item of serviceSequence) {
    if (item.employeeId) continue;

    const employeeServices = await EmployeeService.findAll({
      where: {
        serviceId: item.serviceId,
      },
      attributes: ["employeeId"],
    });

    employeeServices.forEach((employeeService) => {
      allEmployeeIds.add(Number(employeeService.employeeId));
    });
  }

  if (allEmployeeIds.size === 0) {
    const error = new Error(
      "No employees are available for the selected services.",
    );

    error.statusCode = 400;
    throw error;
  }

  const bookedAppointments = await Appointment.findAll({
    where: {
      employeeId: {
        [Op.in]: Array.from(allEmployeeIds),
      },

      appointmentDate,

      bookingStatus: {
        [Op.in]: ["PENDING", "ACCEPTED", "CONFIRMED"],
      },
    },

    attributes: ["employeeId", "appointmentTime", "duration"],
  });

  // =========================================================
  // GROUP APPOINTMENTS BY EMPLOYEE
  // =========================================================

  const appointmentsByEmployee = {};

  bookedAppointments.forEach((appointment) => {
    const employeeId = Number(appointment.employeeId);

    if (!appointmentsByEmployee[employeeId]) {
      appointmentsByEmployee[employeeId] = [];
    }

    const start = timeToMinutes(appointment.appointmentTime);

    const end = start + Number(appointment.duration || 30);

    appointmentsByEmployee[employeeId].push({
      start,
      end,
    });
  });

  // =========================================================
  // GET EMPLOYEES WHO CAN PERFORM A SERVICE
  // =========================================================

  const employeeCandidatesByService = {};

  for (const item of serviceSequence) {
    if (item.employeeId) {
      employeeCandidatesByService[item.serviceId] = [item.employeeId];

      continue;
    }

    const employeeServices = await EmployeeService.findAll({
      where: {
        serviceId: item.serviceId,
      },
      attributes: ["employeeId"],
    });

    employeeCandidatesByService[item.serviceId] = employeeServices.map(
      (employeeService) => Number(employeeService.employeeId),
    );
  }

  // =========================================================
  // CHECK WHETHER AN EMPLOYEE IS FREE
  // =========================================================

  const employeeIsAvailable = (employeeId, start, duration) => {
    const end = start + duration;

    const employeeAppointments = appointmentsByEmployee[employeeId] || [];

    return !employeeAppointments.some((appointment) => {
      return start < appointment.end && end > appointment.start;
    });
  };

  // =========================================================
  // CHECK COMPLETE SERVICE SEQUENCE
  // =========================================================

  const canScheduleSequence = (startingTime) => {
    let currentTime = startingTime;

    const temporaryBookings = {};

    for (const item of serviceSequence) {
      const candidates = employeeCandidatesByService[item.serviceId] || [];

      if (candidates.length === 0) {
        return false;
      }

      let selectedEmployee = null;

      for (const employeeId of candidates) {
        const endTime = currentTime + item.duration;

        // Check existing appointments
        const existing = appointmentsByEmployee[employeeId] || [];

        const existingConflict = existing.some((appointment) => {
          return currentTime < appointment.end && endTime > appointment.start;
        });

        if (existingConflict) {
          continue;
        }

        // Check temporary bookings created while
        // testing this same candidate slot.
        const temporary = temporaryBookings[employeeId] || [];

        const temporaryConflict = temporary.some((appointment) => {
          return currentTime < appointment.end && endTime > appointment.start;
        });

        if (temporaryConflict) {
          continue;
        }

        selectedEmployee = employeeId;
        break;
      }

      if (!selectedEmployee) {
        return false;
      }

      if (!temporaryBookings[selectedEmployee]) {
        temporaryBookings[selectedEmployee] = [];
      }

      temporaryBookings[selectedEmployee].push({
        start: currentTime,
        end: currentTime + item.duration,
      });

      currentTime += item.duration;
    }

    return true;
  };

  // =========================================================
  // SALON OPERATIONAL BUSINESS HOURS & CLOSED DAYS
  // =========================================================

  const salonId = serviceRecords[0]?.salonId;
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const [yyyy, mm, dd] = appointmentDate.split("-").map(Number);
  const targetDate = new Date(yyyy, mm - 1, dd);
  const targetDayName = daysOfWeek[targetDate.getDay()];

  // Default operational hours (08:30 – 18:00) if no custom schedule exists
  let startMinutes = 8 * 60 + 30; // 08:30 (2:30 ጠዋት)
  let endMinutes = 18 * 60; // 18:00 (12:00 ማታ)
  let salonIsClosed = false;

  if (salonId) {
    const businessHour = await BusinessHour.findOne({
      where: {
        salonId,
        day: targetDayName,
      },
    });

    if (businessHour) {
      if (businessHour.isClosed) {
        salonIsClosed = true;
      } else {
        if (businessHour.openingTime) {
          startMinutes = timeToMinutes(businessHour.openingTime);
        }
        if (businessHour.closingTime) {
          endMinutes = timeToMinutes(businessHour.closingTime);
        }
      }
    }
  }

  // If the salon is closed on this day of the week, return empty slots
  if (salonIsClosed) {
    console.log(
      `Salon ${salonId} is CLOSED on ${targetDayName} (${appointmentDate})`,
    );
    return [];
  }

  // =========================================================
  // DYNAMIC AVAILABLE STARTING TIMES WITHIN BUSINESS HOURS
  // =========================================================

  const totalServiceDuration = serviceSequence.reduce(
    (sum, item) => sum + item.duration,
    0,
  );

  const allSlots = [];
  for (
    let mins = startMinutes;
    mins + totalServiceDuration <= endMinutes;
    mins += 30
  ) {
    allSlots.push(minutesToTime(mins));
  }

  const availableSlots = allSlots.filter((slot) => {
    const startingTime = timeToMinutes(slot);

    return canScheduleSequence(startingTime);
  });

  console.log(
    `SLOTS FOR ${targetDayName} (${appointmentDate}, Salon ${salonId}, ${minutesToTime(startMinutes)} - ${minutesToTime(endMinutes)}):`,
    availableSlots,
  );

  return availableSlots;
};
