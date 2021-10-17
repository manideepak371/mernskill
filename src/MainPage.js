import React from 'react';
import '../src/GA.css';
import {AddMember,PlayerTable,LoadPlayers} from './features'
import {Log} from './changelog'
import Switch from '@material-ui/core/Switch'

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
            logdata:[],
            adminflag:false,
            excel_xml:false,
            uploadfile:false
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
        },2000)
    }

    playershead=[
        {id:"name",name:"Name"},
        {id:"country",name:"Country"},
        {id:"club",name:"Club"}
    ]

    async GetLogData(){
        const res=await fetch("http://localhost:9000/player/GetLog",{
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

    switchChange=()=>{
        var flag=this.state.adminflag? !this.state.adminflag:!this.state.adminflag;
        this.setState({adminflag:flag})
    }

    pagefeatures=[
        {text:"Add a player (If user is a admin)"},
        {text:"Edit a player (If user is a admin)"},
        {text:"Change Log"},
        {text:"Export players data to excel and pdf"},
    ]

    excelXMLhide=()=>{
        this.setState({excel_xml:false})
    }

    UploadFile=()=>{
        this.setState({
            uploadfile:true
        })
    }

    render(){ 
        return(
            <React.Fragment>
                <div className="main_div">
                    <div id="page-top" className="Header">
                        <div className="header_text">
                            <div className="header_scroll">
                                {this.pagefeatures.map(d=>(
                                    <p><span><label style={{color:"white"}}>{d.text}</label></span></p>
                                ))}
                            </div>
                        </div>
                        <div className="HeaderButtons">
                            <button onClick={()=>{this.setState({AddMemshow:true})}} disabled={!this.state.adminflag}>Add Player</button>
                            <button onClick={this.showChangeLog}>Change Log</button>
                            <button onClick={()=>{this.setState({excel_xml:true})}} disabled={!this.state.adminflag}>Load players from Excel or XML</button>
                            <Switch color="gray" onChange={()=>{this.switchChange()}}/><label>Admin</label>
                        </div>
                        <div id="page-middle" className="pageBody">
                            <div id="players_container">
                                {this.state.tableUpdate && <PlayerTable PlayersData={this.state.postData} admin={this.state.adminflag}/>}    
                            </div> 
                        </div>
                    </div>
                    {this.state.AddMemshow && <AddMember show={this.state.AddMemshow} hide={this.hideAddModal} tbupdateyes={this.TableUpdateYes} tbupdateno={this.TableUpdateNo} LogUpdate={this.UpdateLogData}/>}
                    {this.state.LogShow && <Log show={this.state.LogShow} hide={this.hideChangeLog}/> }
                    {this.state.excel_xml && <LoadPlayers show={this.state.excel_xml} hide={this.excelXMLhide} existingdata={this.state.postData} tbupdateyes={this.TableUpdateYes} tbupdateno={this.TableUpdateNo} LogUpdate={this.UpdateLogData}/>}
                </div>  
            </React.Fragment> 
        );
    }
}

export default Page
                    
/*export options
1. react-html-table-to-excel
2. react-csv
*/