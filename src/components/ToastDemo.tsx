import { customToast } from '../utils/useCustomToast';

const ToastDemo = () => {
  const showCarpoolingToasts = () => {
    // Success toast - Ride created
    customToast.success(
      "Ride Created Successfully! 🚗",
      {
        description: "Your ride from Downtown to Airport has been posted. Passengers can now join!",
        duration: 5000
      }
    );

    // Info toast - New passenger
    setTimeout(() => {
      customToast.info(
        "New Passenger Joined! 👥",
        {
          description: "Sarah Johnson has joined your ride. Total passengers: 2/4",
          duration: 4000
        }
      );
    }, 1000);

    // Warning toast - Route change
    setTimeout(() => {
      customToast.warning(
        "Route Updated! 🗺️",
        {
          description: "Traffic detected on original route. New ETA: 2:45 PM",
          duration: 4000
        }
      );
    }, 2000);

    // Error toast - Ride cancelled
    setTimeout(() => {
      customToast.error(
        "Ride Cancelled! ❌",
        {
          description: "Unfortunately, your ride has been cancelled due to weather conditions.",
          duration: 5000
        }
      );
    }, 3000);
  };

  const showSuccessToast = () => {
    customToast.success(
      "Welcome to Poolyfi! 🎉",
      {
        description: "Your account has been created successfully. Start sharing rides now!",
        duration: 4000
      }
    );
  };

  const showErrorToast = () => {
    customToast.error(
      "Payment Failed! 💳",
      {
        description: "Unable to process payment. Please check your card details and try again.",
        duration: 5000
      }
    );
  };

  const showWarningToast = () => {
    customToast.warning(
      "Low Fuel Warning! ⛽",
      {
        description: "Your vehicle fuel is below 25%. Consider refueling before your next ride.",
        duration: 4000
      }
    );
  };

  const showInfoToast = () => {
    customToast.info(
      "Ride Reminder! ⏰",
      {
        description: "Your scheduled ride starts in 15 minutes. Please be ready at the pickup location.",
        duration: 4000
      }
    );
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Poolyfi Toast Notifications</h1>
          <p className="text-gray-600 mb-8">Beautiful toast notifications matching our carpooling theme</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={showCarpoolingToasts}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              🚗 Show Carpooling Demo
            </button>
            
            <button
              onClick={showSuccessToast}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              ✅ Success Toast
            </button>
            
            <button
              onClick={showErrorToast}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              ❌ Error Toast
            </button>
            
            <button
              onClick={showWarningToast}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              ⚠️ Warning Toast
            </button>
            
            <button
              onClick={showInfoToast}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              ℹ️ Info Toast
            </button>
            
            <button
              onClick={() => customToast.dismissAll()}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              🗑️ Clear All
            </button>
          </div>
          
          <div className="mt-8 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Theme Features</h3>
            <ul className="text-yellow-700 space-y-1">
              <li>• Vibrant yellow gradient matching carpooling theme</li>
              <li>• Car-themed icons and messaging</li>
              <li>• Smooth animations and hover effects</li>
              <li>• Support for descriptions and custom durations</li>
              <li>• Professional gradient backgrounds</li>
              <li>• Responsive design for all screen sizes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToastDemo;
