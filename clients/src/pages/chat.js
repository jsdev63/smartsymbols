import React, {Component} from 'react';
import { browserHistory } from 'react-router';
import swal from 'sweetalert2';
import './font-awesome/css/font-awesome.css';
import './css/agency.min.css';
import './css/bootstrap.min.css';
import './css/login.css';
import io from "socket.io-client";
import axios from 'axios';
import appConfig from './config/config.js'

class Chat extends Component {
    constructor(props){
        super(props);

        this.state = {
            username: '',
            message: '',
            messages: [],
            users: [],
            useremail:'',
            searchInput:true,
            newemail:'',
            selUserIndex:0,
            userstate:''
        };
        
        this.socket = io(appConfig.originUrl);

        this.socket.on('RECEIVE_MESSAGE', function(data){
            addMessage(data);
        });

        const addMessage = data => {
            console.log(data);
            this.setState({messages: [...this.state.messages, data]});
            console.log(this.state.messages);
        };

        this.sendMessage = ev => {
            ev.preventDefault();
            this.socket.emit('SEND_MESSAGE', {
                author: this.state.username,
                message: this.state.message
            });
            this.setState({message: ''});
        }

        this.getUser = data => {
            var self = this;
            axios.post('/getUserContact', {
                useremail: data,
            })
            .then(function (response) {
                try{
                    if(response.data.status==="success"){
                        self.setState({user:response.data.user});
                        self.setState({users:response.data.users});
                    }else{
                        swal("Your contact is empty!");
                    }
                }catch(error){
                    swal("Server Error");
                    return;
                }
            })
        }

        this.controlEvent = (id,e)=>{
            if(id==="add"){
                if(this.state.searchInput){
                    this.setState({searchInput:''})
                }else{
                    this.setState({searchInput:true})
                }
            }else if(id==="save"){
                if(this.state.newemail!==''){
                    this.addNewContact(this.state.newemail);
                }else{
                    swal("Please input new Email to add on your contact!")
                }           
            }else if(id==="sel"){
                this.setState({selUserIndex:e.target.alt})
            }
        }

        this.addNewContact = data => {
            var self = this;
            axios.post('/addNewContact', {
                useremail: this.state.useremail,
                newemail: this.state.newemail
            })
            .then(function (response) {
                try{
                    self.setState({newemail:''});
                    if(response.data.status==="success"){
                        self.setState({searchInput:true})  
                        self.getUser(self.state.useremail);                 
                    }else{
                        swal("Invalid Email address!");
                    }
                }catch(error){
                    swal("Server Error")
                }
            })     
        }

        this.handlechange = (e) =>{
            if(e.target.name==="newemail"){
                this.setState({newemail:e.target.value});
            }
        }
        
    }
    componentDidMount() {
        try{
            const data = JSON.parse(atob(this.props.params.id));
            if(data[0].status!=="success"){
                browserHistory.push('/');
            }else{
                this.getUser(data[0].email);
                this.setState({useremail:data[0].email});
            }
        }catch(error){
            browserHistory.push('/');
        }
    }
    render() {
        return (
            <div className="Chat">
                <div className="wrapper wrapper-content animated fadeInRight">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="ibox float-e-margins">
                                <div className="ibox-content">
                                    <h2><strong>Chat room</strong></h2>
                               </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-12">

                                <div className="ibox chat-view">

                                    <div className="ibox-title">
                                        <small className="pull-right text-muted">Last message:  Mon Jan 26 2015 - 18:39:23</small>
                                        {/* <h4>Chat room panel</h4> */}
                                    </div>


                                    <div className="ibox-content">

                                        <div className="chatroom">

                                            <div className="col-md-3 chat-users-area">
                                                    {/* <div className="chat-control">
                                                        <h5>My Contact</h5>

                                                    </div> */}
                                                    <div className="ibox-title chat-control">
                                                        <h5>My Contact</h5>
                                                        <div className="ibox-tools">
                                                            <a className="collapse-link binded" onClick={(e) => this.controlEvent("add",e)}>
                                                                <i className="fa fa-plus"></i>
                                                            </a>
                                                            <a className={this.state.searchInput?'hidden dropdown-toggle':'dropdown-toggle'} data-toggle="dropdown" onClick={(e) => this.controlEvent("save", e)}>
                                                                <i className="fa fa-save"></i>
                                                            </a>
                                                            <a className="close-link binded" onClick={(e) => this.controlEvent("close", e)}>
                                                                <i className="fa fa-times"></i>
                                                            </a>
                                                        </div>
                                                    </div>
                                                    <div className={this.state.searchInput?'hidden add-user-find':'add-user-find'} >
                                                        <input type="email" className="add-user-input" value={this.state.newemail} name="newemail" onChange={this.handlechange} />
                                                    </div>
                                                <div className="chat-users">

                                                    <div className="users-list">
                                                        {this.state.users.map((user,index) => {
                                                            let imgPath = "../img/team/a"+index+".jpg";
                                                            return (
                                                                <div className={this.state.selUserIndex==index?'seletedUser chat-user':'chat-user'}>
                                                                    <span className="pull-right label label-primary userstate">Online</span>
                                                                    <img className="chat-avatar" src={imgPath} alt={index} onClick={(e)=>this.controlEvent("sel",e)}/>
                                                                    <div className="chat-user-name">
                                                                        <p>{user.username }</p>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                        
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-9 ">
                                                <div>
                                                    <img  className="img-circle clientavatar" src={"../img/team/a"+this.state.selUserIndex+".jpg"} alt="images" /><i className="userstateIcon fa fa-circle-thin">&nbsp;</i>
                                                    <span className="clientname">{this.state.users.length>=1?this.state.users[this.state.selUserIndex].username:"undefiend"}</span>
                                                </div>
                                                <div className="chat-discussion">
                                                    <img  className="img-circle myavatar" src="../img/team/a1.jpg" alt="images" />
                                                    {this.state.messages.map(message => {
                                                        return (
                                                            <div className="chat-message">
                                                                <img className="message-avatar" src="img/team/a6.jpg" alt="" />
                                                                <div className="message">
                                                                    <a className="message-author" href="">{message.author}</a>
                                                                    <span className="message-date">  Fri Jan 25 2015 - 11:12:36 </span>
                                                                    <span className="message-content">
                                                                        {message.message}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                                <div className="row text-input">
                                                    <div className="col-lg-12">
                                                        <div className="chat-message-form">

                                                            <div className="form-group">

                                                                {/* <textarea className="form-control message-input" name="message" value={this.state.message} placeholder="Enter message text" onChange={ev => this.setState({message: ev.target.value})}></textarea> */}
                                                                {/* <input type="text" placeholder="Username" value={this.state.username} onChange={ev => this.setState({username: ev.target.value})} className="form-control"/> */}
                                                                <br/>
                                                                <input type="text" placeholder="Message" className="form-control message-text" value={this.state.message} onChange={ev => this.setState({message: ev.target.value})}/>
                                                                <button onClick={this.sendMessage} className="btn btn-primary form-control send-btn">Send</button>
                                                                <br />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                        
                                    </div>

                                </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }

}

export default Chat;