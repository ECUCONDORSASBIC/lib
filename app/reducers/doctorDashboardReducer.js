export const initialState = {
    loading: true,
    error: null,
    doctor: null,
    patients: [],
    notifications: [],
    jobOffers: [],
    jobApplications: [],
    upcomingAppointments: [],
    activePatient: null,
    isInCall: false,
    activeTab: 'history'
};

export function doctorDashboardReducer(state, action) {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
            
        case 'SET_ERROR':
            return { ...state, error: action.payload };
            
        case 'LOAD_DOCTOR_DATA_SUCCESS':
            return { ...state, doctor: action.payload };
            
        case 'LOAD_PATIENTS_SUCCESS':
            return { ...state, patients: action.payload };
            
        case 'LOAD_NOTIFICATIONS_SUCCESS':
            return { ...state, notifications: action.payload };
            
        case 'LOAD_JOB_OFFERS_SUCCESS':
            return { ...state, jobOffers: action.payload };
            
        case 'SET_ACTIVE_PATIENT':
            return { ...state, activePatient: action.payload };
            
        case 'SET_IN_CALL':
            return { ...state, isInCall: action.payload };
            
        case 'SET_ACTIVE_TAB':
            return { ...state, activeTab: action.payload };
            
        case 'MARK_NOTIFICATION_READ':
            return {
                ...state,
                notifications: state.notifications.map(notification => 
                    notification.id === action.payload 
                        ? { ...notification, read: true } 
                        : notification
                )
            };
            
        default:
            return state;
    }
}