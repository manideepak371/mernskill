import ModalwithSave from './api/modal'
import React from 'react'
import {Button,Table,TableHead,TableBody,TableRow,TableCell, ThemeProvider} from '@material-ui/core'
import {SiMicrosoftexcel} from 'react-icons/si'
import {AiOutlineFilePdf} from 'react-icons/ai'
import jsPDF from 'jspdf'
import axios from 'axios'

//var createreactclass=require('create-react-class')


export class AddMember extends React.Component{
    constructor(){
        super()
        this.state={
            serverresponse:"Failed",
            UpdatedData:[],
            updatedlogdata:[],
            playerimage:null
        }
        this.CancelModal=this.CancelModal.bind(this)
    }

    Adding=()=>{
        const imagefile=(e)=>{
            if(e.target.value !== null && e.target.value !== ""){
                this.setState({
                    playerimage:e.target.files[0]
                })
            }
        }
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
                    <div style={{width:"100%"}}>
                        <span style={{width:"100%",position:"relative",left:"25px"}}><input type="file" name="player_photo" id="player_photo" accept="image/*" onChange={(event)=>imagefile(event)}/></span>
                    </div>    
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
                if(this.state.playerimage === null){
                    errMsg.innerHTML="Please select an image of this player"
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
        formData.append('playerimage',this.state.playerimage)
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
        var imagepath="http://localhost:9000/player/image/"+this.props.player+".png"
        return(
            <div style={{height:"375px",overflowY:"auto",borderStyle:"groove"}}>
                <fieldset disabled={!this.props.admin} style={{borderStyle:"none"}}>
                    <div className="edit_div" id="personal_div" >
                        <label className="edit_headers">Personal Profile:</label>
                        <div >
                            <form >
                                <img src={imagepath} id="container"alt="Image not found" title="Player Image" />
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
        alert(JSON.stringify(this.state.playerState))
        this.state.playerState.forEach(element =>{
            if(element.changeflag){
                alert(Object.keys(element)[0])
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


function SearchData(data,a,index,buffer,flag,indexArr){
    if(data.length > 0){
        if(index<a.length){
            var searchflag=false
            var matchfound=false
            if(a[index].value.length>0 && a[index].value !== null && a[index].value !== ""){
                searchflag=true
                for(var i=0;i<data.length;i++){
                    var x=data[i]
                    if(x[Object.keys(x)[index+1]].toLowerCase().includes(a[index].value) > 0 ){
                        if(indexArr.includes(i) !== true){
                            indexArr.push(i)
                            buffer.push(data[i])
                        }
                        matchfound=true
                    }
                }
            }
            if(searchflag === true && matchfound === false)         //no match found for that iteration
            {
                return [[],false]
            }
            if(searchflag === false && matchfound === false && flag === false)  //no value entered to search
            {
                return SearchData(data,a,++index,buffer,false,indexArr)
            }
            if(searchflag === false && matchfound === false && flag === true)   //atleast one match found in last iterations and no match found for this iteration 
            {
                return SearchData(data,a,++index,buffer,true,indexArr)
            }
            if(searchflag === true && matchfound === true && buffer.length>0){  //match found and continue searching
                return SearchData(buffer,a,++index,buffer,true,indexArr)
            }
            if(flag === false && index === a.length){              //not a single match found and end searching
                return [[],false]
            } 
        }
        if(buffer.length > 0 && flag === true){             //match found and return matched results
            return [buffer,true]
        }
        else{
            return [[],false]
        }
    }
    else{
        return [[],false]
    }
}

function PlayersTableHead(props){
    const {headers,cellwidth}=props
    return(
        <TableHead style={{backgroundColor:'white'}}>
            <TableRow style={{border:"1px solid black",backgroundColor:"lemonchiffon"}}>
                {headers.map((cell)=>(
                    <TableCell 
                    style={{border:"1px solid black",width:"32%",textAlign:"center",alignItems:"center",fontWeight:"bold"}} 
                    key={cell.id}>
                        {cell.name}
                    </TableCell> 
                ))}
                <TableCell style={cellwidth}/>
            </TableRow>
        </TableHead> 
    )
}

//backspace --- table not reseeting with matched records

function PlayersTable({Data,admin}){
    const [data,setData]=React.useState(Data)
    const playershead=[
        {id:"name",name:"Name"},
        {id:"country",name:"Country"},
        {id:"club",name:"Club"}
    ]
    const searchboxes=[
        {id:"searchbox1",className:"searchbox"},
        {id:"searchbox2",className:"searchbox"},
        {id:"searchbox3",className:"searchbox"}
    ]
    const [datacopy,setDataCopy]=React.useState(data.length>0 ? data:[])
    const [records,setMsg]=React.useState("found")
    const [editShow,showEditModal]=React.useState(false)
    const [exportflag,setExportFlag]=React.useState(false)
    const [editplayer,setEditPlayer]=React.useState(null)
    const setscroll=datacopy.length >=7 ?{overflowY:"scroll"}:{overflowY:"hidden"}
    const lastcellwidth=datacopy.length >=7 ?{width:"1.3%"}:{width:"0%"}
    const table_records=records === "found" ? "players_table_records":"no_table_records"
    const records_message=records === "notfound" ? "no_records_message":"records_found"
    const textinputStyle={
        width:datacopy.length >=7 ?"1.3%":"0%",
        border:"1px solid black"
    }
    const Searching=(e)=>{
        const a=document.getElementsByClassName("searchbox")
        var flag=false
        for(var i=0;i<a.length;i++){
            if(a[i].value.length > 0)
                flag=true
        }
        if(flag){
            var c=SearchData(datacopy,a,0,[],false,[])
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
            <div id="export_excel_pdf_container"><span style={{float:"right",width:"50px"}}><SiMicrosoftexcel title="Export to Excel" onClick={()=>Exports("excel")}/><AiOutlineFilePdf title="Export to PDF" onClick={()=>Exports("pdf")}/></span></div>
            <div id="table_header">
                <Table style={{tableLayout:"fixed"}}>
                    <PlayersTableHead
                        headers={playershead}
                        cellwidth={lastcellwidth}
                    />
                </Table>
                <Table style={{tableLayout:"fixed"}}>
                    <TableHead>
                        <TableRow key="table_header_textinput">
                            {searchboxes.map((cell)=>(
                                <TableCell key={cell.id} style={{border:"1px solid black",width:"32%",textAlign:"center",alignItems:"center"}}><input type="text" id={cell.id} className={cell.className} onChange={event=>Searching(event)}/></TableCell>
                            ))}
                            <TableCell style={textinputStyle}/>
                        </TableRow>
                    </TableHead>
                </Table>        
            </div>
            <div id={table_records} style={setscroll}>
                <Table style={{tableLayout:"fixed",backgroundColor:"white"}}>
                <TableBody>
                        {datacopy.map((cell,index)=>{
                            return(
                                <TableRow key={index++} style={{border:"1px solid black",width:"100%"}}>
                                    <TableCell style={{border:"1px solid black",width:"20%",textAlign:"center",alignItems:"center",textDecorationLine:"underline"}} ><label onClick={()=>showEdit(cell.name,cell.country,cell.club)}>{cell.name}</label></TableCell>
                                    <TableCell style={{border:"1px solid black",width:"20%",textAlign:"center",alignItems:"center"}}>{cell.country}</TableCell>
                                    <TableCell style={{border:"1px solid black",width:"20%",textAlign:"center",alignItems:"center"}}>{cell.club}</TableCell>
                                </TableRow>
                            );
                        })} 
                </TableBody>  
            </Table>
            </div>
            <div id={records_message}>
                        <span>No records available.</span>
            </div>             
            {editShow && <EditMember show={showEdit} hide={hideEdit} player={editplayer} admin={admin}/>}
        </div>
    )
}

function ExcelReport(datahead,data){
    const XLSX=require('xlsx')
    var wb=XLSX.utils.book_new()
    var ws=XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb,ws,"PlayersData")
    XLSX.writeFile(wb, 'out.xlsx', {type:"file"})
    return (null) 
}

function PDFReport(datahead,data){
    const doc=new jsPDF()
    doc.text("text",10,10)
    doc.text("text1",50,100)
    doc.save("test.pdf")
}

export class PlayerTable extends React.Component{
    render(){
        return (
            <PlayersTable Data={this.props.PlayersData} admin={this.props.admin}/>
        )
    }
}


export default AddMember


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