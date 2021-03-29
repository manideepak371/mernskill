import './GA.css'
import React from 'react'

export const ModalwithSave=({show,hide,modal_body_append,modal_end_append,title,save})=>{
    const name=show?"display-block" : "display_none"
    const over=show?"show-overlay" : "hide-overlay"
    return(
        <div className={over}>
            <div className={name} id="modal_div">
                <div className="sample_modal">
                    <div className="modal_header">   
                         <label><strong>{title}</strong></label>
                        <span className="close_modal" onClick={hide}><strong>&times;</strong></span>
                    </div>
                    <div className="modal_body">
                        {modal_body_append}
                        {modal_end_append}
                    </div>
                    <div className="modal_end">
                        <div id="cancel-save-btns">
                            <span className="modal_btns"><button type="button" onClick={save}>Save</button></span>
                            <span className="modal_btns"><button type="button" onClick={hide}>Cancel</button></span>
                        </div>
                    </div> 
                </div>  
            </div>
        </div>
    )
}

export const SimpleModal=({show,hide,modal_body_append,title})=>{
    const name=show?"display-block" : "display_none"
    const over=show?"show-overlay" : "hide-overlay"
    return(
        <div className={over}>
            <div className={name} id="modal_div">
                <div className="sample_modal">
                    <div className="modal_header">   
                         <label><strong>{title}</strong></label>
                        <span className="close_modal" onClick={hide}><strong>&times;</strong></span>
                    </div>
                    <div className="simple_modal_body">
                        {modal_body_append}
                    </div>
                </div>  
            </div>
        </div>
    )
}


export default ModalwithSave
