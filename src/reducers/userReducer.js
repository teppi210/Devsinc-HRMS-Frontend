import initialState from "./initialState";
import * as types from '../actions/actionTypes';

export const userReducer = (state = initialState,action) => {
    switch(action.type) {
        case types.FETCH_USERS_SUCCESS:
            return { allUsers: action.payload };

        case types.FETCH_USERS_FAILURE:
            return state;

        case types.DELETE_USER_SUCCESS:
            return {allUsers: state.allUsers.slice().filter( user => (parseInt(user.id,10) !== parseInt(action.payload.userId,10)))};

        case types.DELETE_USER_FAILURE:
            return state;

        case types.EDIT_USER_SUCCESS:
            let newstate = state.allUsers.slice();
            newstate.forEach( (user,index) => {
            if(parseInt(user.id,10) === parseInt(action.payload.id,10)){
                newstate[index] = action.payload;
            }});
            return {allUsers: newstate};

        case types.EDIT_USER_FAILURE:
            return state;

        case "GET_PROFILE_SUCCESS":
          return {
            ...state,
            profile: action.payload
          };
        case "UPDATE_PROFILE_SUCCESS":
          return {
            ...state,
            profileUpdated: true
          };
      case types.CREATE_USER_SUCCESS:
        return state;
        
      case types.CREATE_USER_FAILURE:
        return {...state, userCreateFormErrors: action.payload.errors };
        
      case types.CLEAR_CREATE_USER_FORM_ERRORS:
        return {...state, userCreateFormErrors: null};

        default:
            return state;
    }
};
