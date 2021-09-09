import ModalwithSave from './api/modal'
import React from 'react'
import {Button,Table,TableHead,TableBody,TableRow,TableCell, ThemeProvider, Radio, RadioGroup, FormControlLabel, Checkbox, Switch} from '@material-ui/core'
import {SiMicrosoftexcel, SiThewashingtonpost} from 'react-icons/si'
import {AiOutlineFilePdf} from 'react-icons/ai'
import axios from 'axios'
import '../src/GA.css'
import '../src/api/GA.css'
import { fontSize } from '@material-ui/system'
import {Workbook} from 'exceljs'
import * as fs from 'file-saver'
import {XLSX} from'xlsx'


export class AddMember extends React.Component{
    constructor(){
        super()
        this.state={
            serverresponse:"Failed",
            UpdatedData:[],
            updatedlogdata:[]
        }
        this.CancelModal=this.CancelModal.bind(this)
    }

    Adding=()=>{
        return(
            <div id="enter_data_popup">
            <form ref={(el)=>this.myFormRef = el}>
                <div className="message_text"><span><label id="message"></label></span></div>
                <div className="span-in-div" id="user_input_data">
                    <span className="input_data">
                        <span className="label_cell">Name: </span>
                        <span><input type="text" id="Name"/></span>
                        <span className="label_cell">Country:</span>
                        <span><input type="text"  id="Country"/></span>
                        <span className="label_cell">Club:</span>
                        <span><input type="text"  id="Club"/></span>
                    </span>   
                </div>
            </form>
        </div>
        );
    }

    ValidateSave=()=>{
        var errMsg=document.getElementById("message");
        errMsg.style.backgroundColor="red";
        var name=document.getElementById("Name");
        var country=document.getElementById("Country");
        var club=document.getElementById("Club");
        var name_reg=/^[a-zA-Z ]{6,50}$/g;
        var country_club_reg=/^[a-zA-Z ]{3,50}$/g;
        errMsg.innerHTML=""
        var date1=new Date()
        var date2=new Date(Date.UTC(date1.getFullYear(),date1.getMonth(),date1.getDate(),date1.getHours(),date1.getMinutes(),date1.getSeconds()))
        if(name.value === "" || name.value.match(name_reg) === null){
            errMsg.innerHTML="Please Enter Valid Name "
            return
        }
        else{
            if(country.value === "" || country.value.match(country_club_reg) === null){
                errMsg.innerHTML="Please Enter Valid Country Name "
                return
            }
            else{
                if(club.value === "" || club.value.match(country_club_reg) === null){
                    errMsg.innerHTML="Please Enter Valid Club Name "
                    return
                }
                else{
                    var logdata=[
                        {Action:"Add",Field:"Name",OldValue:"NA",NewValue:name.value,DT:date2.toLocaleString('en-US',{timeZone:'UTC'})},
                        {Action:"Add",Field:"Country",OldValue:"NA",NewValue:country.value,DT:date2.toLocaleString('en-US',{timeZone:'UTC'})},
                        {Action:"Add",Field:"Club",OldValue:"NA",NewValue:club.value,DT:date2.toLocaleString('en-US',{timeZone:'UTC'})} 
                    ]
                    this.TestServer()
                    setTimeout(()=>{
                        errMsg.innerHTML=""
                        if(this.state.serverresponse === "Added Successfully"){
                            errMsg.style.backgroundColor="green"
                            errMsg.innerHTML=this.state.serverresponse
                            this.AddToLog(logdata)
                            this.GetAllPlayersData()
                            setTimeout(()=>{
                                this.CancelModal(this.state.serverresponse)
                            },2000)
                        }
                        else{
                            errMsg.style.backgroundColor="red"
                            errMsg.innerHTML=this.state.serverresponse
                        }
                    },500) 
                }
            }
        }
    }

    CancelModal=(status)=>{
        this.myFormRef.reset();
        var msg=document.getElementById("message");
        msg.innerHTML=""
        this.props.hide();
        if(status === "Added Successfully"){
            this.props.LogUpdate(this.state.updatedlogdata,this.state.UpdatedData);
            this.props.tbupdateno()
            this.props.tbupdateyes()
        }
    }

    async TestServer(){
        var key=document.getElementById("Name").value+document.getElementById("Country").value+document.getElementById("Club").value
        var formData=new FormData()
        var playerdata=({
            _id:key,
            name:document.getElementById("Name").value,
            country:document.getElementById("Country").value,
            club:document.getElementById("Club").value,
            age:"N/A",foot:"N/A",position:"N/A",total_match_appearances:"N/A",
            total_goals_scored:"N/A",total_assists:"N/A",ga_ratio:"N/A",market_value:"N/A",previous_clubs:"N/A"
        })
        formData.append("playerdata",JSON.stringify(playerdata))
        const response=await fetch("http://localhost:9000/player/addPlayer",{
            method:'POST',
            mode:'cors',
            //headers:{'Content-Type':'multipart/form-data'},
            body:formData
        })
        const server_text=await response.text()
        server_text==="duplicate"?setTimeout(()=>{
            this.setState({
                serverresponse:"Player-Country-Club combination already exists"
            })
        },200): (server_text === "success"?setTimeout(()=>{
            this.setState({
                serverresponse:"Added Successfully"
            })
        },200):setTimeout(()=>{
            this.setState({
                serverresponse:"Failed to add player"
            })
        },200))
    }

    async AddToLog(d){
        var date1=new Date()
        var date2=new Date(Date.UTC(date1.getFullYear(),date1.getMonth(),date1.getDate(),date1.getHours(),date1.getMinutes(),date1.getSeconds()))
        const response = await fetch("http://localhost:9000/player/AddToLog",{
            mode:'cors',
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
                Log:d
            })
        })
    }
    
    async GetAllPlayersData(){
        const response=await fetch("http://localhost:9000/player/getPlayers",{
            mode:"cors",
            method:"GET",
            headers:{'Content-Type':'application/json'}
        });
        const data= await response.json()
        if(data !== null || data !=="Undefined" || data !=="" || data !== "{}"){
            this.setState({UpdatedData:data})
        }
    }

    render(){
        var ele=this.Adding()
        return(
            <React.Fragment>
                <ModalwithSave show={this.props.show} hide={this.CancelModal} modal_body_append={ele} modal_end_append={null} title="Add New Player" save={this.ValidateSave}/>
            </React.Fragment>
        );        
    } 
}
export class EditMember extends React.Component{
    constructor(props){
        super(props);
        this.state={
            saveflag:false,
            data:[],
            ele:null,
            playerState:[
                {name:"",changeflag:false,oldvalue:""},
                {country:"",changeflag:false,oldvalue:""},
                {club:"",changeflag:false,oldvalue:""},
                {age:"",changeflag:false,oldvalue:""},
                {foot:"",changeflag:false,oldvalue:""},
                {position:"",changeflag:false,oldvalue:""},
                {total_match_appearances:"",changeflag:false,oldvalue:""},
                {total_goals_scored:"",changeflag:false,oldvalue:""},
                {total_assists:"",changeflag:false,oldvalue:""},
                {ga_ratio:"",changeflag:false,oldvalue:""},
                {market_value:"",changeflag:false,oldvalue:""},
                {previous_clubs:"",changeflag:false,oldvalue:""}
            ],
            playerUpdate:false,
            updatemsg:"Unable to update player",
        }
    }

    componentDidMount(){
        this.getPlayerData()
        setTimeout(()=>{
            const element=this.EditPlayerData()
            this.setState({
                ele:element
            })
        },200)
    }

    async getPlayerData(){
        var key=this.props.player;
        var url="http://localhost:9000/player/getPlayer"+"?id="+key
         const response=await fetch(url,{
            method:'GET',
            mode:'cors',
            headers:{'Content-Type':'application/json'},
        })
        const d=await response.json()
        if(d !== null || d !== {} || d !== undefined){
            this.setState({
                data:d
            })
        }
    }

    EditChangeHandler=(e)=>{
        for(var x in this.state.data[0]){
            if(x === e.target.name){
                if(e.target.value !== this.state.data[0][x]){
                    for(var y in this.state.playerState){
                        var obj=this.state.playerState[y]
                        if(e.target.name === Object.keys(obj)[0]){
                            this.state.playerState[y]={[e.target.name]:e.target.value,changeflag:true,oldvalue:this.state.data[0][x]}
                        }
                    }
                }
                else{
                    for(var y in this.state.playerState){
                        var obj=this.state.playerState[y]
                        if(e.target.name === Object.keys(obj)[0]){
                            this.state.playerState[y]={[e.target.name]:"",changeflag:false,oldvalue:""}
                        }
                    }
                }
            }
        }    
    }

    EditPlayerData=()=>{
        return(
            <div style={{height:"375px",overflowY:"auto",borderStyle:"groove"}}>
                <fieldset disabled={!this.props.admin} style={{borderStyle:"none"}}>
                    <div className="edit_div" id="personal_div" >
                        <label className="edit_headers">Personal Profile:</label>
                        <div >
                            <form >
                                <p></p>
                                <div >
                                    <span id="edit_data">
                                        <span className="label_cell">Name: </span>
                                        <span><input type="text" id="edit_name" name="name" defaultValue={this.state.data[0].name} onChange={(event)=>this.EditChangeHandler(event)}/></span>
                                        <span className="label_cell">Country: </span>
                                        <span><input type="text" id="edit_country" name="country" defaultValue={this.state.data[0].country} onChange={(event)=>this.EditChangeHandler(event)}/></span>
                                        <span className="label_cell">Club: </span>
                                        <span><input type="text" id="edit_club" name="club" defaultValue={this.state.data[0].club} onChange={(event)=>this.EditChangeHandler(event)}/></span>
                                    </span>
                                    <p></p>
                                    <span id="edit_data">
                                        <span className="label_cell">Age: </span>
                                        <span><input type="text" id="edit_age" name="age" defaultValue={this.state.data[0].age} onChange={(event)=>this.EditChangeHandler(event)}/></span>
                                        <span className="label_cell">Preferred foot: </span>
                                        <span><input type="text" id="edit_foot" name="foot" defaultValue={this.state.data[0].foot} onChange={(event)=>this.EditChangeHandler(event)}/></span>
                                        <span className="label_cell">Position: </span>
                                        <span><input type="text" id="edit_position" name="position" defaultValue={this.state.data[0].position} onChange={(event)=>this.EditChangeHandler(event)}/></span>
                                    </span>
                                    <p></p>
                                </div>
                            </form>
                        </div>                    
                    </div>
                    <div className="edit_div" id="professional_div">
                        <label className="edit_headers">Professional Profile:</label>
                        <form>
                                <div >
                                    <span id="edit_data">
                                        <span className="label_cell">Total Match Appearances: </span>
                                        <span><input type="text" id="edit_MA" name="total_match_appearances" defaultValue={this.state.data[0].total_match_appearances} onChange={(event)=>this.EditChangeHandler(event)}/></span>
                                        <span className="label_cell">Total Goals Scored: </span>
                                        <span><input type="text" id="edit_GS" name="total_goals_scored" defaultValue={this.state.data[0].total_goals_scored} onChange={(event)=>this.EditChangeHandler(event)}/></span>
                                        <span className="label_cell">Total Assists: </span>
                                        <span><input type="text" id="edit_GA" name="total_assists" defaultValue={this.state.data[0].total_assists} onChange={(event)=>this.EditChangeHandler(event)}/></span>
                                    </span>
                                    <p></p>
                                    <span id="edit_data">
                                        <span className="label_cell">G/A ratio: </span>
                                        <span><input type="text" id="edit_garatio" name="ga_ratio" defaultValue={this.state.data[0].ga_ratio} onChange={(event)=>this.EditChangeHandler(event)}/></span>
                                        <span className="label_cell">Current Market value: </span>
                                        <span><input type="text" id="edit_marketvalue" name="market_value" defaultValue={this.state.data[0].market_value} onChange={(event)=>this.EditChangeHandler(event)}/></span>
                                        <span className="label_cell">Previous Clubs: </span>
                                        <span><input type="text" id="edit_pc" name="previous_clubs" defaultValue={this.state.data[0].previous_clubs} onChange={(event)=>this.EditChangeHandler(event)}/></span>
                                    </span>
                                </div>
                            </form>
                    </div>
                    <div className="edit_div" id="player_graph_div">
                    <label className="edit_headers">Graph:</label>
                </div>
                </fieldset>
           </div>
        )
    }

    async UpdatePlayer(d){
        var key=document.getElementById("edit_name").value+document.getElementById("edit_country").value+document.getElementById("edit_club").value
        const response=await fetch("http://localhost:9000/player/updatePlayer",{
        method:'POST',
            mode:'cors',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
                _id:this.props.player,
                new_id:key,
                data:d
            })
        })
        const res_text=await response.text() === "updated"?true:false
        if(res_text){
            this.setState({
                playerUpdate:true
            })
        }
    }

    async AddToLog(d){
        const response = await fetch("http://localhost:9000/player/AddToLog",{
            mode:'cors',
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
                Log:d
            })
        })
    }

    ValidateSave=()=>{
        var updateddata=[]
        var logdata=[]
        var date1=new Date()
        var date2=new Date(Date.UTC(date1.getFullYear(),date1.getMonth(),date1.getDate(),date1.getHours(),date1.getMinutes(),date1.getSeconds()))
        this.state.playerState.forEach(element =>{
            if(element.changeflag){
                updateddata.push({[Object.keys(element)[0]]:element[Object.keys(element)[0]]})
                logdata.push({Action:"Update",Field:Object.keys(element)[0],OldValue:element[Object.keys(element)[2]],NewValue:element[Object.keys(element)[0]],DT:date2.toLocaleString('en-US',{timeZone:'UTC'})})    
            }
        })
        if(updateddata.length > 0){
            this.UpdatePlayer(updateddata)
            setTimeout(()=>{
                if(this.state.playerUpdate){
                    this.setState({
                        updatemsg:"Player updated successfully"
                    })
                }
            },200)
            setTimeout(()=>{
                if(this.state.playerUpdate){
                    this.props.hide()    
                }
            },2000)
            this.AddToLog(logdata)
        }
    }

    render(){
        return(
            <React.Fragment>
                <ModalwithSave show={this.props.show} hide={this.props.hide} modal_head_append={null} modal_body_append={this.state.ele} modal_end_append={null} title="Edit Player" save={this.ValidateSave} />  
            </React.Fragment>
        );
    }
}


function SearchData(data,searchvalue,buff){
    if(data.length > 0){
        var indexarr=[]
        data.map((doc,index) =>{
            if (doc[Object.keys(doc)[0]].includes(searchvalue)){
                if(indexarr.indexOf(index) == -1){
                    buff.push(doc) 
                } 
            }
            else{
                if (doc[Object.keys(doc)[1]].includes(searchvalue)){
                    if(indexarr.indexOf(index) == -1){
                        buff.push(doc) 
                    } 
                }
                else{
                    if (doc[Object.keys(doc)[2]].includes(searchvalue)){
                        if(indexarr.indexOf(index) == -1){
                            buff.push(doc) 
                        } 
                    }
                }
            }
        })
    }
    if(buff.length > 0){
        return [buff,true]
    }
    else{
        alert("hello2")
        return [data,false]
    }

}


function PlayersTable({Data,admin}){
    const [data,setData]=React.useState(Data)
    const playershead=[
        {id:"name",name:"Name"},
        {id:"country",name:"Country"},
        {id:"club",name:"Club"}
    ]
    const [datacopy,setDataCopy]=React.useState(data.length>0 ? data:[])
    const [records,setMsg]=React.useState("found")
    const [editShow,showEditModal]=React.useState(false)
    const [exportflag,setExportFlag]=React.useState(false)
    const [editplayer,setEditPlayer]=React.useState(null)
    const setscroll=datacopy.length >= 7 ?{overflowY:"scroll"}:{overflowY:"hidden"}
    const lastcellwidth=datacopy.length >= 7 ?{width:"2%"}:{width:"2%"}
    const table_records=records === "found" ? "players_table_records":"no_table_records"
    const records_message=records === "notfound" ? "no_records_message":"records_found"
    const Searching=(e)=>{
        const a=document.getElementById("searchbox")
        var flag=false
        if(a.value.length > 0){
           flag=true
        }
        if(flag){
            var c=SearchData(datacopy,a.value,[])
            if(c[1]){
                setMsg("found")
                setDataCopy(c[0])
            }
            else{
                setMsg("notfound")
            }
        }
        else{
            setMsg("found")
            setDataCopy(data.length>0 ? data:[])
        }
    }
    const showEdit=(a,b,c)=>{
        showEditModal(true)
        setEditPlayer(a+b+c)
    }
    const hideEdit=()=>{
        showEditModal(false)
    }
    const Exports=(str)=>{
        if(str==="pdf"){
            PDFReport(playershead,datacopy)
        }
        else{
            if(str==="excel"){
                ExcelReport(playershead,datacopy)
            }
        }
    }
    return(
        <div style={{width:"100%"}}>
            <div id="export_excel_pdf_container"><span style={{float:"right",width:"50px"}}><SiMicrosoftexcel title="Export to Excel" onClick={()=>Exports("excel")}/></span></div>
            <div id="table_header">
                <Table style={{tableLayout:"fixed"}}>
                    <TableHead style={{backgroundColor:"lemonchiffon"}}>
                        <TableRow key="table_header_textinput">
                            <TableCell key="searchbox" style={{borderCollapse:"collapse",textAlign:"right",alignItems:"center"}}>  <input type="text" id="searchbox" className="searchbox" placeholder="Search for player" style={{border:"1px solid gray",outline:"none"}} onChange={event=>Searching(event)}/></TableCell>
                        </TableRow>
                    </TableHead>
                    <div id={table_records} style={setscroll}>
                        <TableBody id="tbl">
                            <TableRow style={{border:"1px solid black", backgroundColor:"lemonchiffon",position:"sticky"}}>
                                    {playershead.map((cell)=>(
                                        <TableCell 
                                        style={{border:"1px solid black",width:"1%",textAlign:"center",alignItems:"center",fontWeight:"bold"}} 
                                        key={cell.id}>
                                            {cell.name} 
                                        </TableCell> 
                                    ))}
                            </TableRow>
                            {datacopy.map((cell,index)=>{
                                return( 
                                    <TableRow key={index++}>
                                        <TableCell style={{border:"1px solid black",textAlign:"center",alignItems:"center",textDecorationLine:"underline"}} ><label onClick={()=>showEdit(cell.name,cell.country,cell.club)}>{cell.name}</label></TableCell>
                                        <TableCell style={{border:"1px solid black",textAlign:"center",alignItems:"center"}}>{cell.country}</TableCell>
                                        <TableCell style={{border:"1px solid black",textAlign:"center",alignItems:"center"}}>{cell.club}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </div>
                    <div id={records_message}>
                        <span>No records available.</span>
                    </div>
                </Table>        
            </div>             
            {editShow && <EditMember show={showEdit} hide={hideEdit} player={editplayer} admin={admin}/>}
        </div>
    )
}


function PDFReport(datahead,data){
}

export class PlayerTable extends React.Component{
    render(){
        return (
            <PlayersTable Data={this.props.PlayersData} admin={this.props.admin}/>
        )
    }
}


export class LoadPlayers extends React.Component{
    constructor(props){
        super(props);
        this.state={
            file_type:null,
            choosefile:false,
            file_message:null,
            dataread:false,
            exceldata:[],
            file_ext:null,
            file:null,
            fileUploaded:null,
            playersdata:null,
            logdata:null,
            updatedlogdata:null
        }
        this.save=this.save.bind(this)
        this.filevalidation=this.filevalidation.bind(this)
    }

    async uploadFile(){
        var formData=new FormData()
        formData.append("filedata",JSON.stringify(this.state.exceldata))
        const res=await axios.post("http://localhost:9000/player/uploadBulk",formData)
        const data=await res.data
        setTimeout(()=>{
            this.setState({fileUploaded:data})
        },200)
    }

    async GetAllPlayersData(){
        const resp=await axios.get("http://localhost:9000/player/getPlayers")
        const data=await resp.data
        this.setState({
            playersdata:data
        })
        console.log(data)
    }

    async AddToLog(d){
        console.log(d)
        const date1=new Date()
        var x=[]
        const date2=new Date(Date.UTC(date1.getFullYear(),date1.getMonth(),date1.getDate(),date1.getHours(),date1.getSeconds()))
        d.map(doc =>{
            x.push({Action:"Add",Field:doc.name,OldValue:"N/A",NewValue:doc["name"],DT:date2.toLocaleString('en-US',{timeZone:'UTC'})})
            x.push({Action:"Add",Field:doc.country,OldValue:"N/A",NewValue:doc["country"],DT:date2.toLocaleString('en-US',{timeZone:'UTC'})})
            x.push({Action:"Add",Field:doc.club,OldValue:"N/A",NewValue:doc["club"],DT:date2.toLocaleString('en-US',{timeZone:'UTC'})})
        })
        const response = await fetch("http://localhost:9000/player/AddToLog",{
            method:'POST',
            mode:'cors',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({Log:x})
        })
    }

    filevalidation(e){
        if(e.target.value !== ""){
            
            this.setState({
                file_ext:e.target.value.split('.')[1]
            })
            setTimeout(()=>{
                if(this.state.file_type === "excel" ){
                    if(this.state.file_ext.includes("xlsx") || this.state.file_ext.includes("xls") || this.state.file_ext.includes("csv") ){
                        this.setState({file_message:null,file:e.target.files[0]})
                        console.log(this.state.file_ext)
                        return
                    }
                    else{
                        this.setState({file_message:"Selected file is not a proper Excel format file"})
                    }
                    return
                }
                if(this.state.file_type === "xml" ){
                    if(this.state.file_ext.includes("xml")){
                        this.setState({file_message:null})
                    }
                    else{
                        this.setState({file_message:"Selected file is not a proper XML format file"})
                    }
                    return null
                }
            },200)
        }
    }

    save(){
        if(document.getElementById("excel_xml") === null){
            this.setState({file_message:"Please choose Excel or XMl"})
            return
        }
        if(document.getElementById("excel_xml").value === ""){
            this.setState({file_message:"Please select file"})
            return
        }
        if(this.state.file_type === "excel" ){
            const scope=this
                var fr=new FileReader()
                fr.onload=(e)=>{
                    const file=e.target.result
                    const xl=XLSX.read(file,{type:'binary'})
                    const workbook=xl.SheetNames[0]
                    const sheet=xl.Sheets[workbook]
                    const data=XLSX.utils.sheet_to_json(sheet,{header:2})
                    data.map(doc =>{
                        doc._id=doc.name+doc.country+doc.club
                    })
                    this.setState({
                        exceldata:data
                    })
                    setTimeout(()=>{
                        if(this.state.exceldata.length >0){
                            this.uploadFile()
                            this.setState({dataread:"true",file_message:null})
                        }
                    },200)
                }
                fr.readAsBinaryString(this.state.file)
                setTimeout(()=>{
                    console.log(this.state.fileUploaded)
                    if(this.state.fileUploaded === "partial"){
                        this.setState({file_message:"File data uploaded except for duplicates"})
                    }
                    else{
                        if(this.state.fileUploaded === "success"){
                            this.setState({file_message:"File data uploaded successfully"})
                        }
                        else{
                            if(this.state.fileUploaded === "duplicate"){
                                this.setState({file_message:"File data already exists"})
                            }
                        }
                    }
                    this.GetAllPlayersData()
                },700)
                setTimeout(()=>{
                    if(this.state.playersdata.length>this.props.existingdata.length){
                        var x=[]
                        for(var i=this.props.existingdata.length;i<=this.state.playersdata.length-1;i++){
                            x.push(this.state.playersdata[i])
                        }
                        this.AddToLog(x)
                    }
                },900)
                setTimeout(()=>{
                    this.CancelModal()
                },1500)
            return
        }
        if(this.state.file_type === "xml" ){
            return null
        }       
    }

    CancelModal(){
        this.props.LogUpdate(this.state.updatedlogdata,this.state.playersdata)
        this.props.tbupdateno()
        this.props.tbupdateyes()
        this.setState({
            file_message:null,file:null,file_type:null,file_ext:null,playerdata:null,logdata:null,fileUploaded:null,dataread:false
        })
        this.props.hide()
    }

    RadioButtonChange(e){
        this.setState({
            file_type:e.target.value,
            choosefile:true,
            file_message:null
        })
        if(document.getElementById("excel_xml") !== null){
            document.getElementById("excel_xml").value=""
        }
    }

    body=()=>{
        return(
            <div style={{width:"100%",height:"100%",float:"left"}}>
                <span style={{width:"100%",position:"relative",top:"50px",left:"300px", backgroundColor:"red"}}>{this.state.file_message}</span>
                <div style={{float:"left",width:"100%",position:"relative",top:"100px",left:"300px"}}>
                    <RadioGroup onChange={(event)=>{this.RadioButtonChange(event)}} color>
                        <span> 
                            <label style={{color:"white"}}>Excel:</label><Radio value="excel" color="secondary"/>
                            <label style={{color:"white"}}>XML:</label><Radio value="xml" color="secondary"/>
                        </span>
                        <br></br>
                        <span>
                            {this.state.choosefile && <input type="file" id="excel_xml" accept=".xls,.xlsx,.csv,.xml" onChange={(event)=>this.filevalidation(event)}/>}
                        </span>
                    </RadioGroup>
                </div>
            </div>
        )
    }

    render(){
        return(
            <ModalwithSave show={this.props.show} hide={this.props.hide} modal_body_append={this.body()} modal_head_append={null} modal_end_append={null} title="Load Players from Excel or XML" save={this.save}/>
        )
    }
}

export default AddMember

function ExcelReport(datahead,data){
    const EXCEL_EXT='.xlsx'
    const EXCEL_TYPE='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    const workbook=new Workbook()
    workbook.title="PlayersList"
    workbook.created=new Date()

    const worksheet=workbook.addWorksheet("PlayersList") 
    worksheet.properties.defaultColWidth=15
    worksheet.addRow([])
    worksheet.mergeCells('A1:C1')
    worksheet.getCell('A1').value="Players List Report"
    worksheet.getCell('A1').alignment={horizontal:'left',vertical:'middle'}
    var cell=worksheet.getCell('A1')
    cell.fill={
        type:'pattern',
        pattern:'solid',
        fgColor:{argb:'FFCC99'}
    }

    worksheet.addRow([])
    worksheet.mergeCells('A2:C2')
    var date1=new Date()
    var date2=new Date(Date.UTC(date1.getFullYear(),date1.getMonth(),date1.getDate(),date1.getHours(),date1.getMinutes(),date1.getSeconds()))
    console.log(date2.toLocaleString('en-US',{timeZone:'UTC'}))
    
    worksheet.getCell('A2').value='Report Generated on: '+date2.toLocaleString('en-US',{timeZone:'UTC'})
    worksheet.getCell('A2').alignment={vertical:'middle',horizontal:'left'}
    worksheet.getCell('A2').fill={
        type:'pattern',
        pattern:'solid',
        fgColor:{argb:'FFCC99'} 
    }
    let columns=[]
    for(const x in data){
        if(data.hasOwnProperty(x)){
            columns=Object.keys(data[x])
        }
    }
    let col=[]
    columns.map(c=>{
        col.push(c.toString().toUpperCase())
    })

    worksheet.addRow(col)
    data.forEach((ele:any)=>{
        let d=[]
        columns.forEach(column =>{
            d.push(ele[column])
        })

        const recentRow=worksheet.addRow(d)
    })

    for(var i=1;i<=worksheet.rowCount;i++){
        let row=worksheet.getRow(i)
        row.eachCell(cell =>{
            cell.border={
                top:{style:'thin'},
                bottom:{style:'thin'},
                right:{style:'thin'},
                left:{style:'thin'}
            }
        })
    }

    workbook.xlsx.writeBuffer().then((data:ArrayBuffer) =>{
        const blob=new Blob([data],{type:EXCEL_TYPE})
        fs.saveAs(blob,"out"+EXCEL_EXT)
    })
    return (null) 
}

/*  
Export to Excel options
1. react-html-table-to-excel    //not yet tried
2. react-csv (csvlink,csvdownload) //unable to export
3. xlsx //able to export but styling is difficult
4. react-data-export    //not working, styling possible
*/

/*
Export to PDF options
1. @react-pdf/renderer    //
2. jsPDF
3. html-pdf
*/

/*
css- Animations
1. animation (short hand)
2. animation-name
3. animation-duration
4. animation-delay
5. animation-direction: normal,reverse,alternate,alternate-reverse
6. animation-timing-function : ease,linear,ease-in,ease-out,ease-in-out
7. animation-fill-mode : none,forwards,backwards,both
*/