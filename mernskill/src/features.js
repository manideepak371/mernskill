import ModalwithSave from './modal'
import React from 'react'
import {Button,Table,TableHead,TableBody,TableRow,TableCell} from '@material-ui/core'
//var createreactclass=require('create-react-class')


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
                    this.TestServer()
                    this.AddToLog()
                    setTimeout(()=>{
                        this.GetLogData()
                        errMsg.innerHTML=""
                        if(this.state.serverresponse === "Added Successfully"){
                            errMsg.style.backgroundColor="green"
                            errMsg.innerHTML=this.state.serverresponse
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
        await fetch("http://localhost:9000/player/addPlayer",{
            method:'POST',
            mode:'cors',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
                _id:key,
                name:document.getElementById("Name").value,
                country:document.getElementById("Country").value,
                club:document.getElementById("Club").value,
            })
        })
        .then(res=>{
            if(res.ok){
                res.json()
                    .then(d=>{
                        if(d.dup_flag){
                            setTimeout(()=>{
                                this.setState({
                                    serverresponse:"Player-Country-Club combination already exists"
                                })
                            },200)
                        }
                        else{
                            setTimeout(()=>{
                                this.setState({
                                    UpdatedData:d,
                                    serverresponse:"Added Successfully"
                                })
                            },200)
                        }   
                    })
            }
            else{
                setTimeout(()=>{
                    this.setState({
                        serverresponse:"Failed to add player"
                    })
                },200)
            }
        })
        .then(res=>{
            return
        })
    }

    async AddToLog(){
        var date1=new Date()
        var date2=new Date(Date.UTC(date1.getFullYear(),date1.getMonth(),date1.getDate(),date1.getHours(),date1.getMinutes(),date1.getSeconds()))
        const response = await fetch("http://localhost:9000/player/AddToLog",{
            mode:'cors',
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
                Log:[
                    {Action:"Add",Field:"Name",OldValue:"NA",NewValue:document.getElementById("Name").value,DT:date2.toLocaleString('en-US',{timeZone:'UTC'})},
                    {Action:"Add",Field:"Country",OldValue:"NA",NewValue:document.getElementById("Country").value,DT:date2.toLocaleString('en-US',{timeZone:'UTC'})},
                    {Action:"Add",Field:"Club",OldValue:"NA",NewValue:document.getElementById("Club").value,DT:date2.toLocaleString('en-US',{timeZone:'UTC'})} 
                ]
            })
        })
    }

    async GetLogData(){
        const res=await fetch("http://localhost:9000/player/GetLog",{
                mode:"cors",
                method:"GET",
                headers:{'Content-Type':'application/json'}
            })
        const responseData=await res.json()
        this.setState({
            updatedlogdata:responseData
        })
        return null
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
            test:false
        }
    }

    MaterialUiTesting=()=>{
        return(
            <div style={{height:"200px"}}>
                <Button variant="contained" size="small" color="secondary" style={{top:"60px",left:"20px",width:"250px"}} onClick={()=>this.setState({test:true})}>Testing Material UI Button</Button>
            </div>
        )
    }

    render(){
        var ele=this.MaterialUiTesting()
        return(
            <React.Fragment>
                <ModalwithSave show={this.props.show} hide={this.props.hide} modal_body_append={ele} modal_end_append={null} title="Edit Player" save={null} />
                {this.state.test && alert("hello Material UI")}
            </React.Fragment>
            
        );
    }
}

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
    const {cellwidth}=props
    return(
        <TableHead style={{backgroundColor:'white'}}>
            <TableRow style={{border:"1px solid black",backgroundColor:"lemonchiffon"}}>
                {playershead.map((cell)=>(
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

function PlayersTable({Data}){
    const [data,setData]=React.useState(Data)
    const [datacopy,setDataCopy]=React.useState(data.length>0 ? data:[])
    const [records,setMsg]=React.useState("found")
    const [editShow,showEditModal]=React.useState(false)
    const setscroll=datacopy.length >=8 ?{overflowY:"scroll"}:{overflowY:"hidden"}
    const lastcellwidth=datacopy.length >=8 ?{width:"1.3%"}:{width:"0%"}
    const table_records=records === "found" ? "players_table_records":"no_table_records"
    const records_message=records === "notfound" ? "no_records_message":"records_found"
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
    const showEdit=()=>{
        showEditModal(true)
    }

    const hideEdit=()=>{
        showEditModal(false)
    }
    return(
        <div style={{width:"100%"}}>
            <div id="table_header">
                <Table style={{tableLayout:"fixed"}}>
                    <PlayersTableHead
                        cellwidth={lastcellwidth}
                    />
                </Table>
                <Table style={{tableLayout:"fixed"}}>
                    <TableHead>
                        <TableRow key="table_header_textinput">
                            {searchboxes.map((cell)=>(
                                <TableCell key={cell.id} style={{border:"1px solid black",textAlign:"center",alignItems:"center"}}><input type="text" id={cell.id} className={cell.className} onChange={event=>Searching(event)}/></TableCell>
                            ))}
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
                                    <TableCell style={{border:"1px solid black",width:"20%",textAlign:"center",alignItems:"center",textDecorationLine:"underline"}} onClick={()=>showEdit()}>{cell.name}</TableCell>
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
            {editShow && <EditMember show={showEdit} hide={hideEdit}/>}
        </div>
    )
}

export class PlayerTable extends React.Component{
    render(){
        return (
            <PlayersTable Data={this.props.PlayersData} />
        )
    }
}

export default AddMember