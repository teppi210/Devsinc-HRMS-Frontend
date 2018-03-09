import React from 'react';
import { Grid } from "material-ui";
import { RegularCard, Button, Table, ItemGrid } from "components";
import { connect } from 'react-redux';
import { loadUsers } from "../../actions/userActions";
import { Delete,Edit } from "material-ui-icons";
import * as types from '../../actions/actionTypes';
import * as resourceTypes from '../../actions/resourceTypes';
import EditUserForm from './EditUserForm';
import CreateUserForm from './CreateUserForm';
import { registerUser } from "../../actions/auth/authConfig";
import {SubmissionError} from "redux-form";

class ManageUsers extends React.Component{
    constructor(props){
        super(props);
        this.handleCreateUserSubmit = this.handleCreateUserSubmit.bind(this);
        this.handleEditUserSubmit = this.handleEditUserSubmit.bind(this);
    }

    componentDidMount(){
        this.props.dispatch(loadUsers());
    }

    handleCreateUserSubmit(values){
        const { registerUser } = this.props;

        const {
            email,
            name,
            username,
            company_id,
            department_id,
        } = values;
        let password = "11111111";
        return registerUser({ email, password, name, username, company_id, department_id })
            .then( (response) => {
                this.props.dispatch(loadUsers());
                this.props.closeModal();
            })
            .catch( (error) =>{
                console.log();
                if(!error.response){
                    throw new SubmissionError({
                        _error: "Something went wrong. Please try again later."
                    });
                }
                else{
                    error.response.data.errors.full_messages.forEach((error) => {
                        throw new SubmissionError({
                            _error: error
                        })
                    });
                }
            })
    }

    handleEditUserSubmit(values){
        console.log(values);

    }

    render(){
        return(
            <Grid container>
                <ItemGrid xs={12} sm={12} md={12}>
                    <RegularCard
                        cardTitle="Manage Users"
                        cardSubtitle="Click on operations to perform actions"
                        content={
                            <div>
                                <Button onClick={this.props.openModal.bind(this,types.FORM_MODAL,{title: 'Create New User', form: <CreateUserForm onSubmit={this.handleCreateUserSubmit}/>  })} color="primary">Create a New User</Button>
                                <Table
                                    tableHeaderColor="primary"
                                    tableHead={["ID", "Name","Username","Email","Image","Company ID","Operations"]}
                                    tableData={
                                        this.props.users
                                            ? this.props.users.map((prop,key)=>{
                                                return [
                                                    prop["id"].toString(),
                                                    prop["name"],
                                                    prop["username"],
                                                    prop["email"],
                                                    prop["image"],
                                                    prop["company_id"].toString(),
                                                    <div>
                                                        <Delete
                                                            style={{'marginRight' : '10px'}}
                                                            onClick={ this.props.openModal.bind(this, types.DELETE_MODAL, {resourceType: resourceTypes.USER, resourceId: prop["id"]}) }
                                                        />
                                                        <Edit
                                                            onClick={
                                                                this.props.openModal.bind(this, types.FORM_MODAL,
                                                                    { form:
                                                                            <EditUserForm
                                                                                initialValues={{
                                                                                    id: prop["id"],
                                                                                    name: prop["name"],
                                                                                    username: prop["username"],
                                                                                    email: prop["email"],
                                                                                    image: prop["image"],
                                                                                    company_id: prop["company_id"]
                                                                                }}
                                                                                onSubmit={this.handleEditUserSubmit}
                                                                            />,
                                                                        title: `Edit ${prop["email"]}`,
                                                                    }
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                ];
                                            })
                                            :[]
                                    }
                                />
                            </div>
                        }
                    />
                </ItemGrid>
            </Grid>
        );
    }
}

function mapDispatchToProps(dispatch){
    return {
        openModal: (modalType,modalProps = null) => { dispatch({ type: types.SHOW_MODAL, modalType: modalType, modalProps: modalProps}) },
        registerUser: (...params) => dispatch(registerUser(...params)),
        closeModal: () => { dispatch({type: types.HIDE_MODAL}) }
    }
}

function mapStateToProps(state){
    return {
        users: state.users
    }
}

export default ManageUsers = connect(mapStateToProps,mapDispatchToProps)(ManageUsers);