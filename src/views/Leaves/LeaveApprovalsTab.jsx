import React from 'react';
import { Grid } from "material-ui";
import * as types from "../../actions/actionTypes";
import Switch from 'material-ui/Switch';
import {
  ItemGrid,
  CustomInput
} from "components";
import Avatar from 'material-ui/Avatar'
import { ModeEdit } from "material-ui-icons";
import { FormGroup, FormControlLabel } from 'material-ui/Form';
import Tooltip from 'material-ui/Tooltip';
import classNames from 'classnames'
import List, {
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
} from 'material-ui/List';
import Chip from 'material-ui/Chip';
import IconButton from 'material-ui/IconButton';
import * as moment from 'moment';
import LeaveStatusForm from './LeaveStatusForm';
import LeavesLifeCycle from "./LeavesLifeCycle";
import { withStyles } from "material-ui/styles/index";
import { connect } from 'react-redux';
import {
  createLeaveStatusFailure,
  createLeaveStatusSuccess,
  fetchLeaveApprovalsFailure,
  fetchLeaveApprovalsSuccess
} from "../../actions/leave";
import {createLeaveStatus, fetchLeaveApprovals} from "../../api/leave";
import {hasPermission} from "../../helpers/permissionsHelper";
import Hidden from 'material-ui/Hidden';

const styles = theme => ({
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
  background: {
    backgroundColor: theme.palette.background.paper,
  },
  title: {
    margin: `${theme.spacing.unit * 4}px 0 ${theme.spacing.unit * 2}px`,
  },
  border: {
    borderBottom: '2px solid #eee',
    backgroundColor: theme.palette.background.paper,
  },
  avatar: {
    margin: 2,
  },
  bigAvatar: {
    [theme.breakpoints.up("md")]: {
      width: 60,
      height: 60,
    },
    [theme.breakpoints.down("sm")]: {
      width: 40,
      height: 40,
    },
  },
  tooltip: {
    fontSize: '15px'
  },
  listItemSecondaryAction: {
    [theme.breakpoints.down("sm")]: {
      paddingRight: '0px'
    }
  },
  listItemTextRoot: {
    [theme.breakpoints.down("sm")]: {
      padding: '0px'
    }
  }
});

class LeaveApprovalsTab extends React.Component{
  constructor(props){
    super(props);
    this.handleCreateLeaveStatusSubmit = this.handleCreateLeaveStatusSubmit.bind(this);
    this.state = {
      anchorEl: {
        id: -1
      },
      search: '',
      allCurrentUserLeaveApprovals: this.props.currentUserLeaveApprovals,
      displayedCurrentUserLeaveApprovals: this.props.currentUserLeaveApprovals,
      leave_approvals_filter: {
        pending: true,
        approved: true,
        rejected: true
      },
    }
  }
  
  componentDidMount(){
    this.props.fetchLeaveApprovals();
  }
  
  componentWillReceiveProps(nextProps){
    this.setState({
      allCurrentUserLeaveApprovals: nextProps.currentUserLeaveApprovals,
      displayedCurrentUserLeaveApprovals: nextProps.currentUserLeaveApprovals
    })
  }
  
  handleCreateLeaveStatusSubmit(values){
    this.props.createLeaveStatus(values);
  }
  
  handleLeaveApprovalsSearchInputChange(searchTerm){
    if(searchTerm.length > 2) {
      let data = this.state.allCurrentUserLeaveApprovals;
      data = data.filter((leaveApproval) => (
        leaveApproval.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leaveApproval.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leaveApproval.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leaveApproval.leave_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leaveApproval.start_date.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leaveApproval.end_date.toLowerCase().includes(searchTerm.toLowerCase())
      ));
      
      this.setState({
        search: searchTerm,
        displayedCurrentUserLeaveApprovals: data
      })
    }
    else{
      this.setState({ displayedCurrentUserLeaveApprovals: this.state.allCurrentUserLeaveApprovals })
    }
  }
  
  handleLeaveApprovalsToggleSwitch = (toggleName) => {
    let approved = toggleName === "approved" ? !this.state.leave_approvals_filter.approved : this.state.leave_approvals_filter.approved;
    let pending = toggleName === "pending" ? !this.state.leave_approvals_filter.pending : this.state.leave_approvals_filter.pending;
    let rejected = toggleName === "rejected" ? !this.state.leave_approvals_filter.rejected : this.state.leave_approvals_filter.rejected;
    let data = this.state.allCurrentUserLeaveApprovals;
    
    data = data.filter((leaveApproval) => {
      return (approved ? leaveApproval.status === "approved" : false) ||
        (pending ? leaveApproval.status === "pending" : false) ||
        (rejected ? leaveApproval.status === "rejected" : false)
    });
    
    this.setState(prevState => ({
      leave_approvals_filter: { ...prevState.leave_approvals_filter, [toggleName]: !prevState.leave_approvals_filter[toggleName]},
      displayedCurrentUserLeaveApprovals: data
    }));
  };
  
  handleLeaveApprovalClick(leaveApproval){
    this.props.openModal(
      types.CONTENT_MODAL,
      {
        fullscreen: false,
        title: `Leave application by ${leaveApproval.username} for ${moment(leaveApproval.end_date).diff(moment(leaveApproval.start_date),'days')} Days`,
        content: <LeavesLifeCycle reason={leaveApproval.reason} leaveId={leaveApproval.id} />
      }
    )
  }
  
  render(){
    const { classes } = this.props;
    const { displayedCurrentUserLeaveApprovals } = this.state;
    
    return(
      <ItemGrid xs={12} sm={12} md={12}>
        <FormGroup row>
          <CustomInput
            labelText="Search"
            id="search"
            formControlProps={{
              style: {margin: "0px 0 0 0"},
              fullWidth: false
            }}
            inputProps={{
              onChange: (event) => this.handleLeaveApprovalsSearchInputChange(event.target.value),
              type: "text",
              required: "text",
              name: "search",
              autoComplete: "search",
            }}
          />
        </FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={this.state.leave_approvals_filter.approved}
              onClick={ () => this.handleLeaveApprovalsToggleSwitch("approved") }
              value="approved"
            />
          }
          label="Approved"
        />
        <FormControlLabel
          control={
            <Switch
              checked={this.state.leave_approvals_filter.pending}
              onClick={() => this.handleLeaveApprovalsToggleSwitch("pending")}
              value="pending"
            />
          }
          label="Pending"
        />
        <FormControlLabel
          control={
            <Switch
              checked={this.state.leave_approvals_filter.rejected}
              onClick={() => this.handleLeaveApprovalsToggleSwitch("rejected")}
              value="rejected"
            />
          }
          label="Rejected"
        />
        <hr/>
        <br/>
        
        <Grid container>
          <Grid item xs={12} sm={12} md={12}>
            <div className={classes.background}>
              <List>
                {displayedCurrentUserLeaveApprovals && displayedCurrentUserLeaveApprovals.length ?
                  displayedCurrentUserLeaveApprovals.map((leaveApproval, index) => (
                    <ListItem key={index} button className={classes.border} classes={{secondaryAction: classes.listItemSecondaryAction}}>
                      <ListItemAvatar style={{height: '100%'}} >
                        <Avatar
                          alt="Adelle Charles"
                          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAABRFBMVEUuWHH////7YCDxyaXktpKRXyzrwJwmWHOHXjWUXyglU23oupaNWiUeT2oLSGWYZzb7VQD2zqrh5umVXyYERmT6z6ghUGv7UAD7VwD7WxTL09nCy9KKUg8WS2dEaH5ogpPn3dWcrLf19/hWa3l0i5s6YXiRo69yXEiwvMWGmqemtL7Y3uJBZn1VdIc9WWmaajpnW1IOWHWFgX+1pJP9q5LOqo36vqy4jGOoeEz6ZSj87un59fLMnXf74dh/XT3+2s+imI39y7xVWlxKWWTsaTn8kXD7cDrOZ0jKbVB2Z2z338v8gFbu1MCpZFb9o4n9t6GfaWDjckvryK+8dmPfb0r4iWT4ajL60MT8f1NoZG7mYzH8mny1YEt9XV/XYjt8aW3mo5CSZ2NtdXrdu51sXEyUjojBqpWPlZi0lXrXx7nElW6jfFhUhHEjAAAQgUlEQVR4nNWd+VsaSRrHqxFtaRpEIGhrGgMCQSMx5ELFZMYcTq5xMpOYZHeObC5nNvv//75VfUAfdXa/rfjdeeaZuFj0J+9b7/vW2UjLXO3q2nq/tdXZGDR3ugih7k5zsNHZavXX16rt7L8eZdl4e62/NeiWyrZdahiGgabCf2qUbLtc6g62+muZcmZF2F7vDTAaJkN8EdJyadBbzwozC8J2v9O1bSFbmNO2u51+FpTQhO21XrNuq8AFMO16swfusqCE7fVOSc12FFuWOrAOC0hI8NLQTU2JIeEeC4qw2jNA8HxIo1cFejIYwv6g3ADDc9UoD/ogzwZA2G7BeGdU2FtbAD0yNWG1Y5cywHNVsjupnTUlYXWjnoX5pjLqGykZUxFWN8rZ8jmM5XSMKQgzt9+EMZUdExO2e+dgvwljuZc45iQl7BvZxReaSkbS3JGM8MaOfa58RPbOjfMj3DpHB53KKG+dE+EaOl8HnaqE1s6DcKt+QXxEdXUzqhLe6EIXoGpqdFV7oyJhq3yhfETlVoaE7cH5h9C47IFSblQhXDMuIoTGZRgqAUeBsHWRISaseisLwo1Z8FBf9gY4Ybt5sTE0qkZTtjNKElZnpAtOZRiS4w05wrVZ8lBftly8kSLsz06MCaouNdyQIdyeTUCMuA1DOAN1DEtlCUQx4QwDSpVwQsIZyvM0iXO/iHB7li1IJHRUAWF/1gExoiCi8glnNE2EJUgaXMK1ywCIEbmpn0dYncVKhiabV8BxCNto1mpRlgzEKcM5hM3LAogRm0kIN2ZruMRXgz1eZBK2LksndGW3VAkvSRidihlQGYTty+SirhqMaMMgvERRxhcr2tAJexe1MpFGdk+e8MZl64SuytQJfyrhRT9qYskSdi5fmHHV6MgRrs/+iImlOmU/HIXw8oXRqQwZwq3L6qNEjfgKaozwxuX1UaJ4PI0R7lxmJ8VuuiMi7F+ugjsuOzqnESFsX24LEhltLiFsuabLCvJLSz0eYRUuzODHfnTr+sNFsR5ev/UIAVLabQ5hB8pJMd5ioVYoFObFwp+qFRYxJNB3Gx02YRWo4tZvXpdiC6pW+ArFWK8yCTdgTKjfqqnyuba8BYNobLAIoXrhYi0Bn2PHhzCI5SqDEMiEi0kM6JlxEeQJQkYMEML0Qj0FIEaEsWKwJwYIQQKp/jWpi7qqPYJADIbTKWEbpF67mcaCjiCeIpgTp4QtiHJG/5qWECaglloUQhAT6vFHNk01xEWQnliKE/ZBKtKbkV5omkt7e3umScEkP9zd21uK/l81iOdApX6McAASZx4VwhCjhWWihcO9+SAm+c+97/kiUX4UZqw9BngQZAyihDDZXr8VJDT3FpbnXC0vzy0cjojBTGLWkUOXd1XM7wURYaLpNOv7hDCzMyFC87vP51MSzRVdywVVHAUQgWq3yYyNTwhVkU4JzVEY0NNCnqJiwIpg1WmYcB1m8iJkQyognTBfBLchstdDhEADwwCheahE+N0Et2EnRAg0eREgXKIDMgjzeXAb+ikRQTppgDAaZkSE02ADRui5KYJ00kA+NPN0QCbh4YQQJltM3BRBOmkw4zNMyPTSIjih56YOIdg2bv1RzU/2yoR7sBkf+RvBHcIe1GLMlJDVDdmEfkeEqdqIGr0JYROqTfTYJ2R1Qzbhd3BC1PQJoSYRUYBwQZUw74ea2k2wp6m3PULA1Rh/9GSyANmEeXhCZ5UGAeYKFBgfsrohh9CPpWAP4+YLQtiFaxN52WJXndAvTQuA6zRdlxBmCsqV7hEykwWHcMlDBCQkE1IIrmQj0kXpkEO46/4uzDyNK1K4IcBsiMh8sEtIHxvyCffgCUlGREAzNJ70h4WUhECz3q7IbA0Cmkb0pF9PTXgdckXYJoSA676TGeE0hFCDJ0flKiYEPT3pDRDTEIIV3kS4+EbaNuTmBK/0TkEIN7QgKm1jQsCKBvmFaRpCuKINOVUNgt3wbBhXzVT50KylupUw9jxNTAjYHrI/ny0c7prJCHFNY+5+z9+7bUD6qYYAazYDnV0hU9uHCQnN+UMyGV68twlnRruN4JKF3p274kAsL4+SjC3MPX+yvwiHWK4iuGRhfJlgLI9YgBzCUWAxA2zWwV5DMOuGpK07V6YcTBNyCAOAxXtQT1VaR2DpcPMKk0qOMER7G8hPS9sIamRRusO2mzphHsqIjR7aAvrLMqT4pAmLm0DrM1sIqKQxJJ1UmhDITY0OAhodGt+ACe/A9B5jAw1AGkKNH+W6oTQhVEccIKDMIxtoZAnBQk0T7cA0NLOEOwhoshTcS8+ACLtQhMZt4EjzI1AWg5vuntFsgeAYG3KA0oRQtTeYl+JQA1mXggUazAcUS2e18sZ8cCOxM6loKmlDsJWGJlRNg7UDR1j8DBZnBlB1KVZDKmHIEBbvgM3hGgOosQWR/aMEogQhWLZHztgCanxIJIMoJoQEJONDyNVDZH/+ImIUERbztyGXGfAYfxv06LbRuP0lFeG9bzroKkNpG26uzW/ydjEF4eFn6MfpA86XutI3mRu+xITF0Sbs05D5UtAFUqId9k4TsQ2XIHe+EJWrkOsWrnT2njYRYfEQcpuCI7sNu/ZEpC+yFw9FhHuQ2xRcQa8fImc7RmIvhTpEOpGzfgi7BkwIWdv0RYTFkQm6EQN5a8Cg6/jI2XDCXD0kJ6DykQMzAcL5wldgQmcdHzxdfC2YtJS4vDyX/07Wh3dHdMrioQm71QR5ezGg04V+qxDfqOAfX5ufX3JOJO4Fj3b5hLvAm2mQt59GgyeMbhFezo+W/LN57g5EcoJtdFiMmBB4Mw3y9kSB7mtD7omEsBGXD6/6Rw1qV/H/vD+YZgiR7DaB3Uwz2dcGOrrwNg2FjLgw4ds9u3bt2tnu5IxTxISQu9gdeXsTIfeXEpFNQ8HNGMv+0bur/3gH5v656m9DnRrR2UALu11osr8U+jJdZ6+3mZ8cH/WPGZj/m5w+/p//o++Tg6TOcQtwwjb8Pm802c3um3By3Ofqf6/5OvM3vJtBH4U65TxVF36vvqNacCP0sr99GyMS1Zx/TX626xix6G3UrwEHmg78eQsiveZ1Mufk7yhyGH0p/Edz5JwKzmAXOwqctwA8M0Pk79c353exogfxI4Tz5hKW96ECMKFzAQjwuSdHj+c5ihKGBBxoJueewDPizXn27RhswsL8TVgTBs6ugRffnFt4mIRAt+8EFDh/CHaGdComIosQ9BSCq8AZUvB8QcbBjJt4GIQ16LFv5BwwdOGGyECYjkgnrEEPfVHkLHc7g7ufGfcpUQlr0ONCotB5/AzcNHAoWEgIPWhyFLlTIQM3ZSBSCAuPMwCM3ouRzeXBOiX3UwiB06CnyN0mGd0eTMn9UULwPO8pdj8N+PKFq3jujxDC53lPsTuGoGdrplqsFcyA5oN/KIBPcvuK3xMFdNcXRboe2mkTnPMubsJePxsQ5a6vDCo3T1zCrL6Ucl8bzJ17VHEIs/pK6p174AuJE10AIfXexEzqGkfnT0i/+xJ6MmOq8ydk3F8KdQdtVKUmm7CUTTnDuIM2i6zfKDU2v32ZYxDm733b1Eugh0YdMe8RBjaiYZebf5/NXQnvkgqvAReL+bO/N8s27Bcz74KG7IkNu9Hpj7WDuajiq9wvtPF6xyjDFcac+7zBrt4bdrfcV2jJEB44n7zR6w5hL9ujEkIs0ujD5qe3x16DYwnCsffZ47efmhCQkbchAr8bQR+iTz/tW9a+32Bsz0KMcMH/aA7/2ttPqS3JfzdCyvdb6MOPzzBeDstv8IWQ8NWEEAtDPvuYjlHwfosUqzS4870+dvHwk/rtjaOXfsUIfScd+79qHb9OYUjRO0oSv2dGH25i8+V8Wf5za68EhL/5HzxYnf72/rPNhIzi98wke1eQPnz+qzXly+UqBywjRgknfxUHlcDvW9avzxMxSrwrKMGMDeb7K8SXy61MCKM9MUI46YXag5VQC8kYZd73pP5eueHm2zAeseGDaXvLHMKF6cd+qEQbsd5uDlUfhoIT/5Hae9f07ptcDDBX+WHa3phDOJ5+7ChGiNt901UyY1nuvWtK784bfjyO82HCo0B7YyZhAFC7HyfEjMfPFcwo++48FT8dvqHx5XKr94PtjZephAuhL/1lldqS9UYBkQpD+6HsOyz1brwHeoS/hFt8sRAnfBX+yAmjKeutrKcqvMNS60nlfb37hPFUOesk0uL4twjhb+PIJ54y23oihxgt17iEclujh0zAnPU01uT4xdzChPBVlE/TTtmNPZFxVLV3yUq9D3j4E/OZctZLWqvjgxcvXr16cRDHwzpmNpaznkkgRutRAaHEO53152zAXG6f0S5b9EDjIT4X+qnqO50l3ss9fMYjrCgTrnBas96KjKj+Xm7xu9WHHLfCZRvVEzk64BHmcoK9REnerS6KNvomz4S5lQfshqmKF20hI/7MdVNWlBEQ8kfD+msuYbBskxKlaAuKH05ZUUZAyJ+14UVSQnif0zBNjJJmYkTeWn9kZkaekBtQ9X3uE0WLGqFYJY1PyHFTZhgVE2p9JqL+L8ET/a5IyE74rthuWo/OW6gQan3WSEr/WUBITfkcUYcowQZZ0bTMBxQRatsMxCGr5vb1TpGQ3xomfE130/K2oGERodaiIw753TA4FyWlA34oxfqL6qb1lqhlIaHWovVFfslGFJipkdEDIWEuGaAEobZNQRR1Q+WEKEiHWNafcTeti1xUjpAWUYXdMDyPIZYgHRLCP2JuKoii8oTaegyxK+qGOeuuEuHvor+xXO7fUcI6Zd4pIWFsI7goG+aoY2CePogJrQigzU30ioRa1QgVqYKi1NGxuNWAhE4a7YiGwSvV1Am1djM4mBIUpY5WVADH/LGTSxjsiI0mp9hORIjHiwFPHb4TP5BSupBIFqGOaLPHg8kJA4lRMDZ0pZQuxMmCaBpjWvJNKxBqa/6+EP2TBOGqyvjprkQ/nMzWGA25GKNOiDujuwg+/EOCMDZlypNoZOG26I6gStJdUJ1Q03qOpw6fyDyPyuiCO+czkVOalukTv0wpEmo3UEMm3xMpTCiOZZwUtzjE306duudIlVDTtur6RxmfUgmmDySSRY6MEevxFVCR1Am1NXHZ7UghmMqF0tzqnyohxlMCQk37z4oMokIwFUzSuLJWVGdGHCUi1B4cS/ylK0zVvJTJr8eqU7CukhFq2n1LPNyRr0wlym5LdXrSV1JCbXxSEQ4RZdsSTmFYlRPVVYKJEhPi5zoVdMeKbDDlz+jjDniqNiUSUgpC3B35jNLDfO4AH/Ml64CeUhFixpccRulhPnOBm/C9TMWXmhAzPmX2R+m6jVmzWZV09iNKTYj7490KC1KuAcbw16pU7qbof74ACLHuP6E6q2TdRg001sqTpPkhLBhC7Kwnq3FDSoaaeKCxKqsnqd3TExQh1tFp1FslQ00k0GDvPD2CeyxAQtyhjk5DlrQ+SP3afghv9fQocXanCZQQa/z+5N3Kqk9piX8hUNFYqyvvTt6D4mnwhEQH95/uY4e1wttMmXpfIWVnpbJ/eh8gdMaUBSHRwdHJh9WVFZlweHdlZfXDyVEWdERZETo6eH8knjQaH73PCs5RpoSO2lp77P6D5fyE/Ecb/9v5J/Pv/z+HIPWXzgdqbwAAAABJRU5ErkJggg=="
                          className={classNames(classes.avatar, classes.bigAvatar)}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        classes={{root: classes.listItemTextRoot}}
                        primary={   <span onClick={ this.handleLeaveApprovalClick.bind(this,leaveApproval) }>
                                      <b>{leaveApproval.username}: </b>
                                      <span>{leaveApproval.reason}</span>
                                    </span>
                        }
                        secondary={ <span >
                          <span onClick={ this.handleLeaveApprovalClick.bind(this,leaveApproval) }>
                                      <b>Type: </b>
                                      <span>{leaveApproval.leave_type.charAt(0).toUpperCase() + leaveApproval.leave_type.slice(1)}</span>
                                      <br />
                                      <span>{(moment(leaveApproval.end_date).diff(moment(leaveApproval.start_date),'days')) + 1} Days ({moment(leaveApproval.start_date).format("Do MMMM YYYY").toString()}  <b>-</b> {moment(leaveApproval.end_date).format("Do MMMM YYYY").toString() }) </span>
                                      <br />
                          </span>
                                      <Hidden mdUp>
                                      {leaveApproval.status === "pending" ? <Tooltip title={<div>{leaveApproval.comment ? leaveApproval.comment : "No comment" }</div>}><Chip style={{backgroundColor: '#d8d739'}} label="Pending" className={classes.chip} /></Tooltip> : null }
                                        {leaveApproval.status === "approved" ? <Tooltip title={<div>{leaveApproval.comment ? leaveApproval.comment : "No comment" }</div>}><Chip style={{backgroundColor: '#2cd81f'}} label="Approved" className={classes.chip} /></Tooltip> : null }
                                        {leaveApproval.status === "rejected" ? <Tooltip title={<div>{leaveApproval.comment ? leaveApproval.comment : "No comment" }</div>}><Chip style={{backgroundColor: '#d84d30'}} label="Rejected" className={classes.chip} /></Tooltip> : null }
  
                                        {leaveApproval.status === "pending" || (leaveApproval.status === "approved by Reporting to" && hasPermission([""],[""]) ) ? <span>
                                                <IconButton variant="fab" color="primary"
                                                            onClick={ () => {
                                                              this.props.openModal(
                                                                types.FORM_MODAL,
                                                                {
                                                                  fullscreen: false,
                                                                  title: `Approve Leave for ${leaveApproval.username}`,
                                                                  form: <LeaveStatusForm onSubmit={this.handleCreateLeaveStatusSubmit}
                                                                                         userId={leaveApproval.user_id}
                                                                                         initialValues={{
                                                                                           leave_id: leaveApproval.id,
                                                                                           status: 'approved'
                                                                                         }}
                                                                  />
                                                                })
                                                            }}
                                                >
                                                  <ModeEdit/>
                                                </IconButton>
                                              </span> : <span style={{marginRight: '45px'}} />
                                        }
                                      </Hidden>
                                      </span>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Hidden only={['xs','sm']}>
                          {leaveApproval.status === "pending" ? <Tooltip title={<div>{leaveApproval.comment ? leaveApproval.comment : "No comment" }</div>}><Chip style={{backgroundColor: '#d8d739'}} label="Pending" className={classes.chip} /></Tooltip> : null }
                          {leaveApproval.status === "approved" ? <Tooltip title={<div>{leaveApproval.comment ? leaveApproval.comment : "No comment" }</div>}><Chip style={{backgroundColor: '#2cd81f'}} label="Approved" className={classes.chip} /></Tooltip> : null }
                          {leaveApproval.status === "rejected" ? <Tooltip title={<div>{leaveApproval.comment ? leaveApproval.comment : "No comment" }</div>}><Chip style={{backgroundColor: '#d84d30'}} label="Rejected" className={classes.chip} /></Tooltip> : null }
                          
                          {leaveApproval.status === "pending" || (leaveApproval.status === "approved by Reporting to" && hasPermission([""],[""]) ) ? <span>
                                    <IconButton variant="fab" color="primary"
                                                onClick={ () => {
                                                  this.props.openModal(
                                                    types.FORM_MODAL,
                                                    {
                                                      fullscreen: false,
                                                      title: `Approve Leave for ${leaveApproval.username}`,
                                                      form: <LeaveStatusForm onSubmit={this.handleCreateLeaveStatusSubmit}
                                                                             userId={leaveApproval.user_id}
                                                                             initialValues={{
                                                                               leave_id: leaveApproval.id,
                                                                               status: 'approved'
                                                                             }}
                                                      />
                                                    })
                                                }}
                                    >
                                      <ModeEdit/>
                                    </IconButton>
                                  </span> : <span style={{marginRight: '45px'}} />
                          }
                        </Hidden>
                      </ListItemSecondaryAction>
                    </ListItem>
                  )) : null
                }
              </List>
            </div>
          </Grid>
        </Grid>
      </ItemGrid>
    )
  }
}

function mapStateToProps({leaves}){
  return {
    currentUserLeaveApprovals: leaves.currentUserLeaveApprovals
  }
}


function mapDispatchToProps(dispatch){
  return {
    openModal: (modalType,modalProps = null) => { dispatch({ type: types.SHOW_MODAL, modalType: modalType, modalProps: modalProps}) },
    fetchLeaveApprovals: () => { dispatch(fetchLeaveApprovals(fetchLeaveApprovalsSuccess,fetchLeaveApprovalsFailure))},
    createLeaveStatus: (params) => { dispatch(createLeaveStatus(params,createLeaveStatusSuccess,createLeaveStatusFailure))},
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(withStyles(styles)(LeaveApprovalsTab));