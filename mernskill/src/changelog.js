import React from 'react'
import {SimpleModal} from './api/modal'
import {Table,TableHead,TableRow,TableCell,TableSortLabel, TableBody} from '@material-ui/core'


const datahead=[
    {id:"Action",type:"string",name:"Action"},
    {id:"Field",type:"string",name:"Field"},
    {id:"OldValue",type:"string",name:"Old Value"},
    {id:"NewValue",type:"string",name:"New Value"},
    {id:"DT",type:"string",name:"DateTime"}
]

function ascORdesc(a,b,orderby){
    if(orderby==="DT"){
        if(new Date(b[orderby]) < new Date(a[orderby])){
            return -1
        }
        if(new Date(b[orderby]) > new Date(a[orderby])){
            return 1
        }
    }
    else{
        if(b[orderby] < a[orderby]){
            return -1
        }
        if(b[orderby] > a[orderby]){
            return 1
        }
    }
    return 0
}

function datacompare(order,orderby){
    return order === "desc"
        ? (a,b) => ascORdesc(a,b,orderby)
        : (a,b) => - ascORdesc(a,b,orderby)
}

function sortData(array,compare){
    const sortarray = array.map((el,index) => [el])
    sortarray.sort((a,b)=>{
        const ord=compare(a[0],b[0]);
        if(ord !== 0) return ord;
        return a[1]-b[1]
    })
    return sortarray.map((el) => el[0])
}

function LogTableHead(props){
    const {order,orderby,onSortRequest,lastcellwidth}=props
    const SortReqHandler=(property)=>{
        onSortRequest(property)
    }
    return(
        <TableHead style={{backgroundColor:'white'}}>
            <TableRow style={{border:"1px solid black",width:"100%"}}>
                {datahead.map((cell)=>(
                    <TableCell 
                    style={{border:"1px solid black",width:"30%",textAlign:"center",alignItems:"center"}} 
                    key={cell.id}>
                        {cell.name}
                        <TableSortLabel 
                            active={orderby===cell.id}
                            direction={orderby===cell.id?order:'asc'}
                            onClick={()=>SortReqHandler(cell.id)}
                            style={{border:"none",borderCollapse:"collapse"}}
                        />
                    </TableCell> 
                ))}
                <TableCell style={lastcellwidth}></TableCell>
            </TableRow>
        </TableHead>
    )
}

function LogTable({Data}){
    const [order,setOrder]=React.useState('desc')
    const [orderby,setOrderBy]=React.useState('DT')
    const [data,setData]=React.useState(Data)
    const SortHandler=(property)=>{
        const AscorDesc=orderby===property && order==='asc'
        setOrder(AscorDesc? 'desc' : 'asc')
        setOrderBy(property)
    }
    var datacopy=[]
    if(data.length>0){
        for(var i=0;i<data.length;i++){
            for(var j=0;j<data[i].Log.length;j++){
                datacopy.push(data[i].Log[j])
            }
        } 
    }
    const scrollset= (datacopy.length>7) ? {overflowY:"scroll"} : {overflowY:"hidden"}
    const lastcolwidth=(datacopy.length>7) ? {width:"2%"} : {width:"0%"}
    return(
        <div>
            <Table style={{tableLayout:"fixed"}}>
                <LogTableHead
                    order={order}
                    orderby={orderby}
                    onSortRequest={SortHandler}
                    lastcellwidth={lastcolwidth}
                />
            </Table>
            <div id="table_data_records" style={scrollset}>
                <Table style={{tableLayout:"fixed",backgroundColor:"lemonchiffon"}}>
                        <TableBody>
                        {sortData(datacopy,datacompare(order,orderby)).map((cell)=>{
                            return(
                                <TableRow style={{border:"1px solid black",width:"100%"}}>
                                    <TableCell style={{border:"1px solid black",width:"20%"}}>{cell.Action}</TableCell>
                                    <TableCell style={{border:"1px solid black",width:"20%"}}>{cell.Field}</TableCell>
                                    <TableCell style={{border:"1px solid black",width:"20%"}}>{cell.OldValue}</TableCell>
                                    <TableCell style={{border:"1px solid black",width:"20%"}}>{cell.NewValue}</TableCell>
                                    <TableCell style={{border:"1px solid black",width:"20%"}}>{cell.DT}</TableCell>
                                </TableRow>
                            );
                        })} 
                        </TableBody>  
                </Table> 
            </div>             
        </div>
    )
}

export class Log extends React.Component{
    constructor(props){
        super()
        this.state={
            log:false,
            updatedlogdata:[]
        }
    }

    componentDidMount(){
        this.GetLogData()
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
        const ele=<LogTable Data={this.state.updatedlogdata}/>
        setTimeout(()=>{
            this.setState({
                log:true
            })
        },100)
        return(
            <React.Fragment>
              {this.state.log && <SimpleModal show={this.props.show} hide={this.props.hide} modal_body_append={ele} title="Change Log"/>}  
            </React.Fragment>
        )
    }

}


export default Log
