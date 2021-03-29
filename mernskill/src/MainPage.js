import React from 'react';
import './GA.css';
import {AddMember,EditMember,PlayerTable} from './features'
import {Log} from './changelog'

export class Page extends React.Component{
    constructor(){
        super();
        this.state={
            AddMemshow:false,
            postresponse:"Failed",
            postData:[],
            tableUpdate:false,
            EditMemshow:false,
            LogShow:false,
            logdata:[]
        }
        this.TableUpdateNo=this.TableUpdateNo.bind(this)
        this.TableUpdateYes=this.TableUpdateYes.bind(this)
    }

    componentDidMount(){
        this.GetAllPlayersData();
        this.GetLogData()
        setTimeout(()=>{
            if(this.state.postData.length !== 0){
                this.TableUpdateYes(this.state.postData)
            }
        },1000)
    }

    async GetLogData(){
        const res=await fetch("http://localhost:9000/player/GetLog",{
                mode:"cors",
                method:"GET",
                headers:{'Content-Type':'application/json'}
            })
        const responseData=await res.json()
        this.setState({
            logdata:responseData
        })
        return null
    }

    async GetAllPlayersData(){
        const response=await fetch("http://localhost:9000/player/getPlayers",{
            mode:"cors",
            method:"GET",
            headers:{'Content-Type':'application/json'}
        });
        const data= await response.json()
        if(data !== null || data !=="Undefined" || data !=="" || data !== "{}"){
            this.setState({postData:data,postresponse:"Success"})
        }
        else{
            this.setState({postresponse:"Failed to fetch data"})
        }
    }

    showAddModal=()=>{
        this.setState({
            AddMemshow:true
        });
    }

    hideAddModal=()=>{
        this.setState({
            AddMemshow:false
        });
    }

    UpdateLogData=(data1,data2)=>{
        this.setState({
            logdata:data1,
            postData:data2
        })
    }

    TableUpdateYes=()=>{
        this.setState({
            tableUpdate:true
        })
    }

    TableUpdateNo=()=>{
        this.setState({
            tableUpdate:false
        });
    }

    showChangeLog=()=>{
        this.setState({
            LogShow:true
        })
    }

    hideChangeLog=()=>{
        this.setState({
            LogShow:false
        })
    }

    render(){  
        return(
            <React.Fragment>
                <div className="main_div">
                    <div id="page-top" className="Header">
                        <div className="HeaderButtons">
                            <button>Home</button>
                            <button>To Excel</button>
                            <button onClick={()=>{this.setState({AddMemshow:true})}}>Add Player</button>
                            <button onClick={this.showChangeLog}>Change Log</button>
                        </div>
                        <div id="page-middle" className="pageBody">
                            <div id="players_container">
                                {this.state.tableUpdate && <PlayerTable PlayersData={this.state.postData}/>}    
                            </div> 
                        </div>
                    </div>
                    {this.state.AddMemshow && <AddMember show={this.state.AddMemshow} hide={this.hideAddModal} tbupdateyes={this.TableUpdateYes} tbupdateno={this.TableUpdateNo} LogUpdate={this.UpdateLogData}/>}
                    {this.state.LogShow && <Log show={this.state.LogShow} hide={this.hideChangeLog} LogData={this.state.logdata} /> }
                     
                </div>  
            </React.Fragment> 
        );
    }
}

export default Page
                    