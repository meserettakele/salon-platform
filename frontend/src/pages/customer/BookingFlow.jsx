import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import bookingService from "../../services/bookingService.js";

export const BookingFlow = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==================== BACKEND DATA ====================

  const [categories, setCategories] = useState([]);
  const [salons, setSalons] = useState([]);
  const [services, setServices] = useState([]);

  const [employeesByService, setEmployeesByService] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);

  // ==================== SEARCH / FILTER ====================

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  // ==================== BOOKING STATE ====================

  const [selectedSalon, setSelectedSalon] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [serviceEmployeeMap, setServiceEmployeeMap] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");

  // ==================== HELPERS ====================

  const extractData = (res) => res?.data?.data || res?.data || [];

  const getServiceId = (service) => Number(service.id);

  const getServiceDuration = (service) =>
    Number(service.duration || service.durationMinutes || 0);

  const getServicePrice = (service) => Number(service.price || 0);

  const getEmployeeName = (employee) => {
    if (!employee || employee === "auto") return "Auto-assign";

    return (
      employee.fullName || employee.name || employee.firstName || "Specialist"
    );
  };

  // ==================== RESET FUNCTIONS ====================

  const resetDownstreamFromSalon = () => {
    setSelectedServices([]);
    setEmployeesByService({});
    setServiceEmployeeMap({});
    setSelectedDate("");
    setSelectedTime("");
    setTimeSlots([]);
  };

  const resetFromServices = () => {
    setEmployeesByService({});
    setServiceEmployeeMap({});
    setSelectedDate("");
    setSelectedTime("");
    setTimeSlots([]);
  };

  // ==================== CALCULATIONS ====================

  const totalPrice = selectedServices.reduce(
    (total, service) => total + getServicePrice(service),
    0,
  );

  const totalDuration = selectedServices.reduce(
    (total, service) => total + getServiceDuration(service),
    0,
  );

  // Convert HH:mm into minutes
  const timeToMinutes = (time) => {
    if (!time) return 0;

    const [hours, minutes] = time.split(":").map(Number);

    return hours * 60 + minutes;
  };

  // Convert minutes back to HH:mm
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  // Build sequential schedule
  const getSequentialSchedule = () => {
    if (!selectedTime || selectedServices.length === 0) {
      return [];
    }

    let currentMinutes = timeToMinutes(selectedTime);

    return selectedServices.map((service) => {
      const startTime = minutesToTime(currentMinutes);

      currentMinutes += getServiceDuration(service);

      return {
        service,
        startTime,
        duration: getServiceDuration(service),
        price: getServicePrice(service),
        employee: serviceEmployeeMap[getServiceId(service)] || "auto",
      };
    });
  };

  const sequentialSchedule = getSequentialSchedule();

  // ==================== INITIAL CATEGORIES ====================

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const res = await bookingService.getCategories();

        if (isMounted) {
          setCategories(extractData(res));
        }
      } catch (err) {
        if (isMounted) {
          setCategories([]);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  // ==================== STEP 1: LOAD SALONS ====================

  useEffect(() => {
    let isMounted = true;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const res = await bookingService.getSalons(
          searchQuery,
          selectedCategoryId,
        );

        if (isMounted) {
          setSalons(extractData(res));
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load salons.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedCategoryId]);

  // ==================== LOAD SALON SERVICES ====================

  useEffect(() => {
    if (!selectedSalon) return;

    let isMounted = true;

    const fetchSalonCatalog = async () => {
      setLoading(true);
      setError("");

      try {
        const resCatalog = await bookingService.getSalonDetails(
          selectedSalon.id,
        );

        const catalog = extractData(resCatalog);

        if (isMounted) {
          setServices(catalog.services || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err?.response?.data?.message || "Failed to fetch salon services.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSalonCatalog();

    return () => {
      isMounted = false;
    };
  }, [selectedSalon]);

  // ==================== STEP 3: EMPLOYEES BY SERVICES ====================

  useEffect(() => {
    if (step !== 3 || !selectedSalon || selectedServices.length === 0) {
      return;
    }

    let isMounted = true;

    const fetchEmployeesByServices = async () => {
      setLoading(true);
      setError("");

      try {
        const serviceIds = selectedServices.map((service) => service.id);

        const res = await bookingService.getEmployeesByServices(
          selectedSalon.id,
          serviceIds,
        );

        const data = extractData(res);

        if (!isMounted) return;

        let grouped = {};

        if (Array.isArray(data)) {
          data.forEach((item) => {
            if (item.serviceId && Array.isArray(item.employees)) {
              grouped[item.serviceId] = item.employees;
            }
          });
        } else if (data && typeof data === "object") {
          grouped = data;
        }

        setEmployeesByService(grouped);

        setServiceEmployeeMap((previous) => {
          const updated = { ...previous };

          selectedServices.forEach((service) => {
            const serviceId = getServiceId(service);

            if (!updated[serviceId]) {
              updated[serviceId] = "auto";
            }
          });

          return updated;
        });
      } catch (err) {
        if (isMounted) {
          setError(
            err?.response?.data?.message ||
              "Failed to load specialists for the selected services.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEmployeesByServices();

    return () => {
      isMounted = false;
    };
  }, [step, selectedSalon, selectedServices]);

  // ==================== STEP 5: LOAD TIME SLOTS ====================

  useEffect(() => {
    if (step !== 5 || !selectedDate || selectedServices.length === 0) {
      return;
    }

    let isMounted = true;

    const fetchAvailableSlots = async () => {
      setLoading(true);
      setError("");

      try {
        // Build the complete service → employee → duration sequence
        const serviceAssignments = selectedServices.map((service) => {
          const serviceId = getServiceId(service);

          const selectedEmployee = serviceEmployeeMap[serviceId];

          return {
            serviceId,

            // null = AUTO
            employeeId:
              selectedEmployee && selectedEmployee !== "auto"
                ? Number(selectedEmployee.id)
                : null,

            duration: getServiceDuration(service),
          };
        });

        console.log("CHECKING COMPLETE SERVICE SCHEDULE:", serviceAssignments);

        const res = await bookingService.getAvailableSlots({
          appointmentDate: selectedDate,
          services: serviceAssignments,
        });

        const slots = extractData(res);

        if (isMounted) {
          setTimeSlots(Array.isArray(slots) ? slots : []);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load available slots:", err);

          setTimeSlots([]);

          setError(
            err?.response?.data?.message ||
              "Failed to load available time slots.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAvailableSlots();

    return () => {
      isMounted = false;
    };
  }, [step, selectedDate, selectedServices, serviceEmployeeMap]);
  // ==================== SERVICE SELECTION ====================

  const toggleService = (service) => {
    const serviceId = getServiceId(service);

    setSelectedServices((previous) => {
      const exists = previous.some((item) => getServiceId(item) === serviceId);

      if (exists) {
        return previous.filter((item) => getServiceId(item) !== serviceId);
      }

      return [...previous, service];
    });

    setServiceEmployeeMap((previous) => {
      const updated = { ...previous };

      if (updated[serviceId]) {
        delete updated[serviceId];
      }

      return updated;
    });

    setSelectedTime("");
    setTimeSlots([]);
  };

  // ==================== EMPLOYEE SELECTION ====================

  const handleEmployeeSelection = (serviceId, employee) => {
    setServiceEmployeeMap((previous) => ({
      ...previous,
      [serviceId]: employee,
    }));

    setSelectedTime("");
    setTimeSlots([]);
  };

  // ==================== NAVIGATION ====================

  const handleNextStep = () => {
    setError("");

    if (step === 1 && !selectedSalon) {
      return setError("Please select a salon.");
    }

    if (step === 2 && selectedServices.length === 0) {
      return setError("Please select at least one service.");
    }

    if (step === 4 && !selectedDate) {
      return setError("Please pick a date.");
    }

    if (step === 5 && !selectedTime) {
      return setError("Please select a starting time slot.");
    }

    setStep((previous) => previous + 1);
  };

  const handlePrevStep = () => {
    setError("");
    setStep((previous) => Math.max(1, previous - 1));
  };

  // ==================== CONFIRM BOOKING ====================

  const handleConfirmBooking = async () => {
    if (
      !selectedSalon ||
      selectedServices.length === 0 ||
      !selectedDate ||
      !selectedTime
    ) {
      setError("Please complete all required booking information.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const bookings = sequentialSchedule.map((item) => {
        const employee = serviceEmployeeMap[getServiceId(item.service)];

        return {
          service_id: Number(item.service.id),

          employee_id:
            employee && employee !== "auto" ? Number(employee.id) : null,

          appointment_date: selectedDate,
          start_time: item.startTime,
        };
      });

      const payload = {
        salon_id: Number(selectedSalon.id),
        appointment_date: selectedDate,
        notes: notes ? notes.trim() : "",
        bookings,
      };

      console.log("MULTI-BOOKING PAYLOAD:", payload);

      const res = await bookingService.createBooking(payload);

      if (res && res.success === false) {
        setError(res.message || "Failed to complete booking request.");
        setLoading(false);
        return;
      }

      setLoading(false);

      navigate("/customer/appointments");
    } catch (err) {
      setLoading(false);

      console.error("Booking creation error details:", err);

      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to complete booking request.";

      setError(errorMessage);
    }
  };

  // ==================== RENDER ====================

  const progressLabels = [
    "1. Salon",
    "2. Services",
    "3. Specialists",
    "4. Date",
    "5. Time",
    "6. Confirm",
  ];

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <h2
        style={{
          fontSize: "2rem",
          marginBottom: "8px",
        }}
      >
        Book an Appointment
      </h2>

      <p
        style={{
          color: "var(--color-muted)",
          marginBottom: "28px",
        }}
      >
        Complete the steps below to schedule your visit.
      </p>

      {/* ==================== PROGRESS BAR ==================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: "8px",
          marginBottom: "32px",
        }}
      >
        {progressLabels.map((label, index) => {
          const stepNumber = index + 1;

          const isActive = step === stepNumber;
          const isDone = step > stepNumber;

          return (
            <div
              key={label}
              style={{
                padding: "10px 6px",
                textAlign: "center",
                borderRadius: "var(--radius-ui, 8px)",
                fontSize: "0.8rem",
                fontWeight: isActive || isDone ? "600" : "400",

                backgroundColor: isActive
                  ? "var(--color-primary)"
                  : isDone
                    ? "rgba(233, 30, 99, 0.15)"
                    : "var(--color-card)",

                color: isActive ? "#fff" : "var(--color-dark)",

                border: "1px solid var(--color-border, #eee)",
              }}
            >
              {label}
            </div>
          );
        })}
      </div>

      {error && <ErrorMessage message={error} />}

      <Card style={{ padding: "32px" }}>
        {/* =========================================================
            STEP 1: SELECT SALON
        ========================================================= */}

        {step === 1 && (
          <div>
            <h3
              style={{
                marginBottom: "16px",
                color: "var(--color-primary)",
              }}
            >
              Step 1: Select Salon
            </h3>

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "20px",
                flexWrap: "wrap",
              }}
            >
              <input
                type="text"
                placeholder="Search salons by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--color-border, #ccc)",
                }}
              />

              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--color-border, #ccc)",
                }}
              >
                <option value="">All Categories</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <Loader />
            ) : salons.length === 0 ? (
              <p
                style={{
                  color: "var(--color-muted)",
                }}
              >
                No salons found matching your search.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "12px",
                }}
              >
                {salons.map((salon) => {
                  const isSelected = selectedSalon?.id === salon.id;

                  return (
                    <div
                      key={salon.id}
                      onClick={() => {
                        setSelectedSalon(salon);
                        resetDownstreamFromSalon();
                      }}
                      style={{
                        padding: "16px",
                        borderRadius: "8px",
                        cursor: "pointer",

                        border: isSelected
                          ? "2px solid var(--color-primary)"
                          : "1px solid var(--color-border, #ddd)",

                        backgroundColor: isSelected
                          ? "rgba(233, 30, 99, 0.05)"
                          : "transparent",
                      }}
                    >
                      <h4
                        style={{
                          margin: "0 0 4px 0",
                        }}
                      >
                        {salon.name}
                      </h4>

                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.85rem",
                          color: "var(--color-muted)",
                        }}
                      >
                        📍 {salon.address || salon.city || "Location details"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            STEP 2: MULTI-SERVICE SELECTION
        ========================================================= */}

        {step === 2 && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "8px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: "var(--color-primary)",
                }}
              >
                Step 2: Select Services
              </h3>

              {selectedServices.length > 0 && (
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: "20px",
                    background: "rgba(233, 30, 99, 0.1)",
                    color: "var(--color-primary)",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                  }}
                >
                  {selectedServices.length}{" "}
                  {selectedServices.length === 1 ? "service" : "services"}{" "}
                  selected — ETB {totalPrice.toFixed(2)}
                </div>
              )}
            </div>

            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--color-muted)",
                marginBottom: "20px",
              }}
            >
              Select one or more services at{" "}
              <strong>{selectedSalon?.name}</strong>.
            </p>

            {loading ? (
              <Loader />
            ) : services.length === 0 ? (
              <p
                style={{
                  color: "var(--color-muted)",
                }}
              >
                No services registered for this salon.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "12px",
                }}
              >
                {services.map((service) => {
                  const serviceId = getServiceId(service);

                  const isSelected = selectedServices.some(
                    (item) => getServiceId(item) === serviceId,
                  );

                  return (
                    <div
                      key={service.id}
                      onClick={() => toggleService(service)}
                      style={{
                        padding: "16px",
                        borderRadius: "8px",
                        cursor: "pointer",

                        border: isSelected
                          ? "2px solid var(--color-primary)"
                          : "1px solid var(--color-border, #ddd)",

                        backgroundColor: isSelected
                          ? "rgba(233, 30, 99, 0.05)"
                          : "transparent",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleService(service)}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            marginTop: "4px",
                            width: "18px",
                            height: "18px",
                            accentColor: "var(--color-primary)",
                          }}
                        />

                        <div
                          style={{
                            flex: 1,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: "12px",
                            }}
                          >
                            <h4
                              style={{
                                margin: "0 0 4px 0",
                              }}
                            >
                              {service.name}
                            </h4>

                            <strong
                              style={{
                                color: "var(--color-primary)",
                              }}
                            >
                              ETB {getServicePrice(service).toFixed(2)}
                            </strong>
                          </div>

                          {service.description && (
                            <p
                              style={{
                                margin: "0 0 6px 0",
                                fontSize: "0.85rem",
                                color: "var(--color-muted)",
                              }}
                            >
                              {service.description}
                            </p>
                          )}

                          <span
                            style={{
                              fontSize: "0.8rem",
                            }}
                          >
                            ⏱️ {getServiceDuration(service)} mins
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedServices.length > 0 && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "14px",
                  borderRadius: "8px",
                  background: "rgba(233, 30, 99, 0.04)",
                  border: "1px solid var(--color-border, #eee)",
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <span>
                  <strong>{selectedServices.length}</strong> services
                </span>

                <span>
                  <strong>{totalDuration}</strong> minutes total
                </span>

                <span
                  style={{
                    color: "var(--color-primary)",
                    fontWeight: "700",
                  }}
                >
                  ETB {totalPrice.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            STEP 3: EMPLOYEE PER SERVICE
        ========================================================= */}

        {step === 3 && (
          <div>
            <h3
              style={{
                marginBottom: "8px",
                color: "var(--color-primary)",
              }}
            >
              Step 3: Select Specialists
            </h3>

            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--color-muted)",
                marginBottom: "20px",
              }}
            >
              Choose a specialist for each service, or leave it on{" "}
              <strong>Auto-assign</strong>.
            </p>

            {loading ? (
              <Loader />
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "20px",
                }}
              >
                {selectedServices.map((service) => {
                  const serviceId = getServiceId(service);

                  const employees = employeesByService[serviceId] || [];

                  const selectedEmployee =
                    serviceEmployeeMap[serviceId] || "auto";

                  return (
                    <div
                      key={serviceId}
                      style={{
                        padding: "18px",
                        borderRadius: "10px",
                        border: "1px solid var(--color-border, #ddd)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "10px",
                          flexWrap: "wrap",
                          marginBottom: "14px",
                        }}
                      >
                        <div>
                          <h4
                            style={{
                              margin: "0 0 4px 0",
                            }}
                          >
                            {service.name}
                          </h4>

                          <span
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--color-muted)",
                            }}
                          >
                            ⏱️ {getServiceDuration(service)} mins
                          </span>
                        </div>

                        <strong
                          style={{
                            color: "var(--color-primary)",
                          }}
                        >
                          ETB {getServicePrice(service).toFixed(2)}
                        </strong>
                      </div>

                      {/* AUTO OPTION */}

                      <div
                        onClick={() =>
                          handleEmployeeSelection(serviceId, "auto")
                        }
                        style={{
                          padding: "12px",
                          marginBottom: "8px",
                          borderRadius: "8px",
                          cursor: "pointer",

                          border:
                            selectedEmployee === "auto"
                              ? "2px solid var(--color-primary)"
                              : "1px solid var(--color-border, #ddd)",

                          backgroundColor:
                            selectedEmployee === "auto"
                              ? "rgba(233, 30, 99, 0.05)"
                              : "transparent",
                        }}
                      >
                        <span
                          style={{
                            marginRight: "8px",
                          }}
                        >
                          {selectedEmployee === "auto" ? "◉" : "○"}
                        </span>

                        <strong>Skip — auto-assign for me</strong>

                        <div
                          style={{
                            marginLeft: "25px",
                            fontSize: "0.8rem",
                            color: "var(--color-muted)",
                          }}
                        >
                          We'll choose an available specialist.
                        </div>
                      </div>

                      {/* EMPLOYEES */}

                      {employees.length === 0 ? (
                        <p
                          style={{
                            margin: "10px 0 0 0",
                            color: "var(--color-muted)",
                            fontSize: "0.85rem",
                          }}
                        >
                          No specialists specifically assigned to this service.
                          Auto-assign will be used.
                        </p>
                      ) : (
                        employees.map((employee) => {
                          const isSelected =
                            selectedEmployee !== "auto" &&
                            selectedEmployee?.id === employee.id;

                          return (
                            <div
                              key={employee.id}
                              onClick={() =>
                                handleEmployeeSelection(serviceId, employee)
                              }
                              style={{
                                padding: "12px",
                                marginBottom: "8px",
                                borderRadius: "8px",
                                cursor: "pointer",

                                border: isSelected
                                  ? "2px solid var(--color-primary)"
                                  : "1px solid var(--color-border, #ddd)",

                                backgroundColor: isSelected
                                  ? "rgba(233, 30, 99, 0.05)"
                                  : "transparent",
                              }}
                            >
                              <span
                                style={{
                                  marginRight: "8px",
                                }}
                              >
                                {isSelected ? "◉" : "○"}
                              </span>

                              <strong>{getEmployeeName(employee)}</strong>

                              {/* 
                                    REMOVED:
                                    employee.position / employee.role / service specialization
                                    
                                    Only the employee name is displayed now.
                                  */}
                            </div>
                          );
                        })
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            STEP 4: DATE
        ========================================================= */}

        {step === 4 && (
          <div>
            <h3
              style={{
                marginBottom: "16px",
                color: "var(--color-primary)",
              }}
            >
              Step 4: Choose Date
            </h3>

            <p
              style={{
                color: "var(--color-muted)",
                marginBottom: "16px",
              }}
            >
              Select the date you want to visit{" "}
              <strong>{selectedSalon?.name}</strong>.
            </p>

            <input
              type="date"
              value={selectedDate}
              min={new Date().toLocaleDateString("en-CA")}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedTime("");
                setTimeSlots([]);
              }}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid var(--color-border, #ccc)",
                fontSize: "1rem",
              }}
            />
          </div>
        )}

        {/* =========================================================
            STEP 5: SMART TIME SLOTS
        ========================================================= */}

        {step === 5 && (
          <div>
            <h3
              style={{
                marginBottom: "8px",
                color: "var(--color-primary)",
              }}
            >
              Step 5: Choose Start Time
            </h3>

            <p
              style={{
                color: "var(--color-muted)",
                fontSize: "0.9rem",
                marginBottom: "20px",
              }}
            >
              Choose a starting time for your first service. The following
              services will be scheduled automatically in sequence.
            </p>

            {selectedServices.length > 0 && (
              <div
                style={{
                  marginBottom: "20px",
                  padding: "16px",
                  borderRadius: "8px",
                  background: "rgba(233, 30, 99, 0.04)",
                  border: "1px solid var(--color-border, #eee)",
                }}
              >
                <strong>{selectedServices[0].name}</strong>

                <span
                  style={{
                    marginLeft: "8px",
                    fontSize: "0.85rem",
                    color: "var(--color-muted)",
                  }}
                >
                  ({getServiceDuration(selectedServices[0])} mins)
                </span>
              </div>
            )}

            {loading ? (
              <Loader />
            ) : timeSlots.length === 0 ? (
              <p
                style={{
                  color: "var(--color-muted)",
                }}
              >
                No available time slots found for this date.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                  gap: "12px",
                  marginBottom: "28px",
                }}
              >
                {timeSlots.map((slot) => {
                  const isSelected = selectedTime === slot;

                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      style={{
                        padding: "12px",
                        borderRadius: "8px",
                        fontWeight: "600",
                        cursor: "pointer",

                        border: isSelected
                          ? "2px solid var(--color-primary)"
                          : "1px solid var(--color-border, #ccc)",

                        backgroundColor: isSelected
                          ? "var(--color-primary)"
                          : "transparent",

                        color: isSelected ? "#fff" : "var(--color-dark)",
                      }}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}

            {selectedTime && selectedServices.length > 0 && (
              <div>
                <h4
                  style={{
                    marginBottom: "12px",
                  }}
                >
                  Your Schedule
                </h4>

                <div
                  style={{
                    display: "grid",
                    gap: "10px",
                  }}
                >
                  {sequentialSchedule.map((item, index) => (
                    <div
                      key={item.service.id}
                      style={{
                        padding: "14px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border, #eee)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <strong>{item.service.name}</strong>

                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--color-muted)",
                            marginTop: "4px",
                          }}
                        >
                          {index === 0
                            ? "Starting time"
                            : "Auto-scheduled after previous service"}
                        </div>
                      </div>

                      <div
                        style={{
                          textAlign: "right",
                        }}
                      >
                        <strong
                          style={{
                            color: "var(--color-primary)",
                          }}
                        >
                          {item.startTime}
                        </strong>

                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--color-muted)",
                          }}
                        >
                          {item.duration} mins
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            STEP 6: REVIEW
        ========================================================= */}

        {step === 6 && (
          <div>
            <h3
              style={{
                marginBottom: "16px",
                color: "var(--color-primary)",
              }}
            >
              Step 6: Review & Confirm
            </h3>

            <div
              style={{
                backgroundColor: "rgba(233, 30, 99, 0.03)",
                border: "1px solid var(--color-border, #eee)",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  marginBottom: "16px",
                }}
              >
                <strong>Salon:</strong> {selectedSalon?.name}
              </div>

              <div
                style={{
                  marginBottom: "16px",
                }}
              >
                <strong>Date:</strong> {selectedDate}
              </div>

              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid #eee",
                  margin: "16px 0",
                }}
              />

              <h4
                style={{
                  marginBottom: "12px",
                }}
              >
                Services
              </h4>

              <div
                style={{
                  display: "grid",
                  gap: "10px",
                }}
              >
                {sequentialSchedule.map((item) => {
                  const employee =
                    serviceEmployeeMap[getServiceId(item.service)];

                  return (
                    <div
                      key={item.service.id}
                      style={{
                        padding: "14px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border, #eee)",
                        display: "grid",
                        gap: "5px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "10px",
                        }}
                      >
                        <strong>{item.service.name}</strong>

                        <strong
                          style={{
                            color: "var(--color-primary)",
                          }}
                        >
                          ETB {getServicePrice(item.service).toFixed(2)}
                        </strong>
                      </div>

                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--color-muted)",
                        }}
                      >
                        Specialist: {getEmployeeName(employee)}
                      </div>

                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--color-muted)",
                        }}
                      >
                        Time: <strong>{item.startTime}</strong> ·{" "}
                        {item.duration} mins
                      </div>
                    </div>
                  );
                })}
              </div>

              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid #eee",
                  margin: "20px 0",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "1.2rem",
                  color: "var(--color-primary)",
                }}
              >
                <strong>Total</strong>

                <strong>ETB {totalPrice.toFixed(2)}</strong>
              </div>

              <div
                style={{
                  marginTop: "6px",
                  fontSize: "0.85rem",
                  color: "var(--color-muted)",
                }}
              >
                Total duration: {totalDuration} minutes
              </div>

              {/* NOTES */}

              <div
                style={{
                  marginTop: "20px",
                }}
              >
                <label
                  style={{
                    display: "block",
                    fontWeight: "bold",
                    marginBottom: "6px",
                  }}
                >
                  Notes / Special Requests:
                </label>

                <textarea
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes for the salon..."
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            NAVIGATION
        ========================================================= */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "28px",
            paddingTop: "16px",
            borderTop: "1px solid var(--color-border, #eee)",
          }}
        >
          {step > 1 ? (
            <Button
              variant="secondary"
              onClick={handlePrevStep}
              disabled={loading}
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <Button
              onClick={handleNextStep}
              disabled={
                loading || (step === 2 && selectedServices.length === 0)
              }
            >
              Next Step
            </Button>
          ) : (
            <Button onClick={handleConfirmBooking} disabled={loading}>
              {loading ? "Confirming..." : "Confirm Booking"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default BookingFlow;
